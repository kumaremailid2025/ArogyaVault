"""
Invite flow routes for ArogyaVault.

Endpoints:
  POST   /invites                    — Send a new invite
  GET    /invites                    — List invites (sent/received, filterable)
  GET    /invites/counts             — Quick counts for dashboard badges
  GET    /invites/{invite_id}        — Get invite detail
  POST   /invites/{invite_id}/accept — Accept a received invite
  POST   /invites/{invite_id}/reject — Reject a received invite
  POST   /invites/{invite_id}/resend — Resend a pending invite (reset expiry)
  DELETE /invites/{invite_id}        — Revoke/cancel a sent invite

Security:
  - Phone numbers encrypted with AES-256-GCM before storage
  - HMAC-SHA256 hash for dedup lookups (no decryption needed)
  - Masked phone (+91****5592) in all API responses
  - Only inviter can revoke/resend; only invitee can accept/reject
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.helpers import paginate_offset
from app.api.schemas.invite import (
    AcceptInviteRequest,
    InviteAccessScope,
    InviteActionResponse,
    InviteCountsOut,
    InviteDetailOut,
    InviteDirection,
    InviteListResponse,
    InviteOut,
    InviteRelation,
    InviteStatus,
    InviteeOut,
    InviterOut,
    RejectInviteRequest,
    SendInviteRequest,
    SendInviteResponse,
)
from app.api.store import (
    GROUPS,
    INVITE_REGISTRY,
    INVITE_PHONE_INDEX,
    is_phone_registered,
    COMMUNITY_POSTS,
    COMMUNITY_FILES,
    COMMUNITY_MEMBERS,
    POST_NEXT_ID,
)
from app.core.constants import INVITE_EXPIRY_DAYS
from app.core.crypto import (
    decrypt_phone,
    encrypt_phone,
    mask_phone,
    normalize_phone,
    phone_hash,
    validate_phone,
)
from app.core.deps import get_current_user, get_platform, PlatformContext

router = APIRouter(prefix="/invites", tags=["Invites"])

# ── Types ───────────────────────────────────────────────────────────────────

CurrentUser = Annotated[dict, Depends(get_current_user)]
Platform = Annotated[PlatformContext, Depends(get_platform)]


def _make_inviter(user: dict) -> InviterOut:
    """Build InviterOut from a user dict."""
    return InviterOut(
        id=user["id"],
        name=user.get("name", "Unknown"),
        initials=user.get("initials", "??"),
        phone_masked=user.get("phone_masked", "****"),
    )


def _make_invitee(invite: dict) -> InviteeOut:
    """Build InviteeOut from an invite record."""
    return InviteeOut(
        name=invite.get("invitee_name"),
        phone_masked=invite["phone_masked"],
    )


def _invite_to_out(invite: dict, direction: InviteDirection) -> InviteOut:
    """Convert a stored invite dict to InviteOut response."""
    return InviteOut(
        id=invite["id"],
        inviter=invite["inviter"],
        invitee=_make_invitee(invite),
        relation=invite["relation"],
        access_scope=invite["access_scope"],
        status=invite["status"],
        direction=direction,
        message=invite.get("message"),
        created_at=invite["created_at"],
        updated_at=invite.get("updated_at"),
        expires_at=invite.get("expires_at"),
        accepted_at=invite.get("accepted_at"),
        rejected_at=invite.get("rejected_at"),
        group_id=invite.get("group_id"),
    )


def _check_expired(invite: dict) -> bool:
    """Check if an invite has expired and update status if so."""
    expires_at = invite.get("expires_at")
    if not expires_at:
        return False
    exp_dt = datetime.fromisoformat(expires_at)
    if datetime.now(timezone.utc) > exp_dt:
        invite["status"] = InviteStatus.EXPIRED
        invite["updated_at"] = datetime.now(timezone.utc).isoformat()
        return True
    return False


def _get_invite_or_404(invite_id: str) -> dict:
    """Fetch invite by ID or raise 404."""
    invite = INVITE_REGISTRY.get(invite_id)
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found.")
    return invite


def _direction_for_user(invite: dict, user_id: str) -> InviteDirection:
    """Determine if invite is sent or received relative to user."""
    if invite["inviter_id"] == user_id:
        return InviteDirection.SENT
    return InviteDirection.RECEIVED


def _create_linked_group(invite: dict) -> str:
    """
    Create a linked group when an invite is accepted.
    Returns the new group ID.
    """
    group_id = str(uuid.uuid4())
    invitee_name = invite.get("invitee_name") or "Linked User"

    GROUPS[group_id] = {
        "id": group_id,
        "slug": group_id[:8],
        "name": invitee_name,
        "type": "linked",
        "rel": invite["relation"],
        "access": invite["access_scope"],
        "description": f"Shared records with {invite['relation'].lower()} {invitee_name}",
        "invite_id": invite["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Initialize empty collections for the new group
    COMMUNITY_POSTS[group_id] = []
    COMMUNITY_FILES[group_id] = []
    COMMUNITY_MEMBERS[group_id] = []
    POST_NEXT_ID[group_id] = 0

    return group_id


# ══════════════════════════════════════════════════════════════════════════════
#  1. SEND INVITE
# ══════════════════════════════════════════════════════════════════════════════


@router.post(
    "",
    summary="Send a new invite",
    response_model=SendInviteResponse,
    status_code=201,
)
async def send_invite(body: SendInviteRequest, user: CurrentUser):
    """
    Send an invite to a phone number.

    The phone is:
      1. Normalized to E.164 format
      2. Validated against Indian phone regex
      3. Hashed (HMAC-SHA256) for dedup lookup
      4. Encrypted (AES-256-GCM) for storage
      5. Masked for API responses (+91****XXXX)

    Business rules:
      - Cannot invite yourself
      - Cannot invite an already-registered user (they should be linked directly)
      - Cannot send duplicate pending invites to the same phone
    """
    # Normalize and validate
    try:
        phone = normalize_phone(body.phone)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    validate_phone(phone)

    # Cannot invite yourself (compare hashes — no plaintext phone on user dict)
    if phone_hash(phone) == user.get("phone_hash"):
        raise HTTPException(
            status_code=400,
            detail="You cannot invite yourself.",
        )

    # Check if phone is already registered
    if is_phone_registered(phone):
        raise HTTPException(
            status_code=409,
            detail="This phone number is already registered on ArogyaVault. "
                   "You can link with them directly.",
        )

    # Dedup check: compute hash and check for existing pending invite
    ph = phone_hash(phone)
    existing_invite_ids = INVITE_PHONE_INDEX.get(ph, [])
    for eid in existing_invite_ids:
        existing = INVITE_REGISTRY.get(eid)
        if (
            existing
            and existing["inviter_id"] == user["id"]
            and existing["status"] == InviteStatus.PENDING
        ):
            _check_expired(existing)
            if existing["status"] == InviteStatus.PENDING:
                raise HTTPException(
                    status_code=409,
                    detail="You already have a pending invite to this number. "
                           "Use resend to refresh it.",
                )

    # Encrypt phone for storage
    encrypted = encrypt_phone(phone)
    masked = mask_phone(phone)

    now = datetime.now(timezone.utc)
    invite_id = str(uuid.uuid4())

    inviter_out = _make_inviter(user)

    invite_record = {
        "id": invite_id,
        "inviter_id": user["id"],
        "inviter": inviter_out,
        "phone_encrypted": encrypted,
        "phone_hash": ph,
        "phone_masked": masked,
        "invitee_name": body.invitee_name,
        "relation": body.relation,
        "access_scope": body.access_scope,
        "message": body.message,
        "status": InviteStatus.PENDING,
        "created_at": now.isoformat(),
        "updated_at": None,
        "expires_at": (now + timedelta(days=INVITE_EXPIRY_DAYS)).isoformat(),
        "accepted_at": None,
        "rejected_at": None,
        "group_id": None,
    }

    # Store
    INVITE_REGISTRY[invite_id] = invite_record
    INVITE_PHONE_INDEX.setdefault(ph, []).append(invite_id)

    return SendInviteResponse(
        invite=_invite_to_out(invite_record, InviteDirection.SENT),
        message=f"Invite sent to {masked}",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  2. LIST INVITES
# ══════════════════════════════════════════════════════════════════════════════


@router.get(
    "",
    summary="List invites (sent and/or received)",
    response_model=InviteListResponse,
)
async def list_invites(
    user: CurrentUser,
    ctx: Platform,
    direction: InviteDirection | None = Query(None, description="Filter: sent or received"),
    status: InviteStatus | None = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(default=None, ge=1, le=100),
):
    """
    List invites for the current user.

    Filters:
      - direction: "sent" (I sent) or "received" (I received)
      - status: pending, accepted, rejected, expired, revoked

    Returns offset-paginated results sorted by created_at desc.
    Platform-adaptive default page size (mobile=10, web=20).
    """
    if page_size is None:
        page_size = ctx.page_size()

    results: list[tuple[dict, InviteDirection]] = []

    for invite in INVITE_REGISTRY.values():
        # Check expiry
        _check_expired(invite)

        inv_direction: InviteDirection | None = None

        if invite["inviter_id"] == user["id"]:
            inv_direction = InviteDirection.SENT
        else:
            # Check if this user is the invitee (by phone hash)
            user_ph = user.get("phone_hash", "")
            if user_ph and invite["phone_hash"] == user_ph:
                    inv_direction = InviteDirection.RECEIVED

        if inv_direction is None:
            continue

        # Apply direction filter
        if direction and inv_direction != direction:
            continue

        # Apply status filter
        if status and invite["status"] != status:
            continue

        results.append((invite, inv_direction))

    # Sort by created_at descending
    results.sort(key=lambda x: x[0]["created_at"], reverse=True)

    page_items, meta = paginate_offset(results, page, page_size)
    items = [_invite_to_out(inv, d) for inv, d in page_items]

    return InviteListResponse(items=items, meta=meta)


# ══════════════════════════════════════════════════════════════════════════════
#  3. INVITE COUNTS
# ══════════════════════════════════════════════════════════════════════════════


@router.get(
    "/counts",
    summary="Get invite counts for dashboard badges",
    response_model=InviteCountsOut,
)
async def invite_counts(user: CurrentUser):
    """Quick counts: sent pending, sent total, received pending, received total."""
    sent_pending = 0
    sent_total = 0
    received_pending = 0
    received_total = 0

    user_ph = user.get("phone_hash", "")

    for invite in INVITE_REGISTRY.values():
        _check_expired(invite)

        if invite["inviter_id"] == user["id"]:
            sent_total += 1
            if invite["status"] == InviteStatus.PENDING:
                sent_pending += 1
        elif user_ph and invite["phone_hash"] == user_ph:
            received_total += 1
            if invite["status"] == InviteStatus.PENDING:
                received_pending += 1

    return InviteCountsOut(
        sent_pending=sent_pending,
        sent_total=sent_total,
        received_pending=received_pending,
        received_total=received_total,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  4. GET INVITE DETAIL
# ══════════════════════════════════════════════════════════════════════════════


@router.get(
    "/{invite_id}",
    summary="Get invite detail",
    response_model=InviteDetailOut,
)
async def get_invite(invite_id: str, user: CurrentUser):
    """Get full detail for an invite (must be inviter or invitee)."""
    invite = _get_invite_or_404(invite_id)
    _check_expired(invite)

    # Auth check: must be inviter or invitee
    direction = _direction_for_user(invite, user["id"])
    if direction == InviteDirection.RECEIVED:
        user_ph = user.get("phone_hash", "")
        if invite["phone_hash"] != user_ph:
            raise HTTPException(status_code=403, detail="Not authorized to view this invite.")

    base = _invite_to_out(invite, direction)

    # Extend with group info if accepted
    group_name = None
    group_slug = None
    if invite.get("group_id"):
        group = GROUPS.get(invite["group_id"])
        if group:
            group_name = group["name"]
            group_slug = group["slug"]

    return InviteDetailOut(
        **base.model_dump(),
        group_name=group_name,
        group_slug=group_slug,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  5. ACCEPT INVITE
# ══════════════════════════════════════════════════════════════════════════════


@router.post(
    "/{invite_id}/accept",
    summary="Accept a received invite",
    response_model=InviteActionResponse,
)
async def accept_invite(
    invite_id: str,
    body: AcceptInviteRequest,
    user: CurrentUser,
):
    """
    Accept an invite. Creates a linked group for shared records.

    Only the invitee can accept. Invite must be in 'pending' status.
    """
    invite = _get_invite_or_404(invite_id)
    _check_expired(invite)

    # Must be the invitee
    user_ph = user.get("phone_hash", "")
    if invite["phone_hash"] != user_ph:
        raise HTTPException(
            status_code=403,
            detail="Only the invitee can accept this invite.",
        )

    if invite["status"] != InviteStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot accept invite with status '{invite['status']}'.",
        )

    now = datetime.now(timezone.utc).isoformat()

    # Create linked group
    group_id = _create_linked_group(invite)

    # Update invite
    invite["status"] = InviteStatus.ACCEPTED
    invite["accepted_at"] = now
    invite["updated_at"] = now
    invite["group_id"] = group_id

    return InviteActionResponse(
        invite=_invite_to_out(invite, InviteDirection.RECEIVED),
        message="Invite accepted. A shared group has been created.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  6. REJECT INVITE
# ══════════════════════════════════════════════════════════════════════════════


@router.post(
    "/{invite_id}/reject",
    summary="Reject a received invite",
    response_model=InviteActionResponse,
)
async def reject_invite(
    invite_id: str,
    body: RejectInviteRequest,
    user: CurrentUser,
):
    """
    Reject/decline an invite. Only the invitee can reject.
    """
    invite = _get_invite_or_404(invite_id)
    _check_expired(invite)

    # Must be invitee
    user_ph = user.get("phone_hash", "")
    if invite["phone_hash"] != user_ph:
        raise HTTPException(
            status_code=403,
            detail="Only the invitee can reject this invite.",
        )

    if invite["status"] != InviteStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject invite with status '{invite['status']}'.",
        )

    now = datetime.now(timezone.utc).isoformat()
    invite["status"] = InviteStatus.REJECTED
    invite["rejected_at"] = now
    invite["updated_at"] = now
    if body.reason:
        invite["reject_reason"] = body.reason

    return InviteActionResponse(
        invite=_invite_to_out(invite, InviteDirection.RECEIVED),
        message="Invite declined.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  7. RESEND INVITE
# ══════════════════════════════════════════════════════════════════════════════


@router.post(
    "/{invite_id}/resend",
    summary="Resend a pending invite (resets expiry)",
    response_model=InviteActionResponse,
)
async def resend_invite(invite_id: str, user: CurrentUser):
    """
    Resend a pending invite. Resets the expiry timer.
    Only the inviter can resend.
    """
    invite = _get_invite_or_404(invite_id)

    # Must be inviter
    if invite["inviter_id"] != user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Only the inviter can resend this invite.",
        )

    # Can only resend pending or expired invites
    _check_expired(invite)
    if invite["status"] not in (InviteStatus.PENDING, InviteStatus.EXPIRED):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot resend invite with status '{invite['status']}'.",
        )

    now = datetime.now(timezone.utc)
    invite["status"] = InviteStatus.PENDING
    invite["expires_at"] = (now + timedelta(days=INVITE_EXPIRY_DAYS)).isoformat()
    invite["updated_at"] = now.isoformat()

    return InviteActionResponse(
        invite=_invite_to_out(invite, InviteDirection.SENT),
        message=f"Invite resent to {invite['phone_masked']}. Expires in {INVITE_EXPIRY_DAYS} days.",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  8. REVOKE INVITE
# ══════════════════════════════════════════════════════════════════════════════


@router.delete(
    "/{invite_id}",
    summary="Revoke/cancel a sent invite",
    response_model=InviteActionResponse,
)
async def revoke_invite(invite_id: str, user: CurrentUser):
    """
    Revoke (cancel) a pending invite. Only the inviter can revoke.
    """
    invite = _get_invite_or_404(invite_id)

    # Must be inviter
    if invite["inviter_id"] != user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Only the inviter can revoke this invite.",
        )

    if invite["status"] != InviteStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot revoke invite with status '{invite['status']}'.",
        )

    now = datetime.now(timezone.utc).isoformat()
    invite["status"] = InviteStatus.REVOKED
    invite["updated_at"] = now

    return InviteActionResponse(
        invite=_invite_to_out(invite, InviteDirection.SENT),
        message="Invite has been revoked.",
    )
