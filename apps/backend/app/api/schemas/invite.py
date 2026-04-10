"""
Pydantic schemas for invite flow endpoints.

Industry-standard patterns:
  - Phone numbers stored encrypted (AES-256-GCM) — never in plaintext
  - HMAC-SHA256 hash for dedup lookups without decryption
  - Masked phone for UI display (+91****5592)
  - Status lifecycle: pending → accepted/rejected/expired/revoked
  - Offset-paginated invite lists with filters
"""

from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field

from app.api.schemas.community import OffsetPageMeta


# ══════════════════════════════════════════════════════════════════════════════
#  ENUMS
# ══════════════════════════════════════════════════════════════════════════════


class InviteStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"
    REVOKED = "revoked"


class InviteRelation(str, Enum):
    FAMILY = "Family Member"
    DOCTOR = "Doctor"
    CAREGIVER = "Caregiver"
    LAB = "Lab / Diagnostic"
    PHARMACY = "Pharmacy"
    OTHER = "Other"


class InviteAccessScope(str, Enum):
    APP_ACCESS = "App Access"         # Full app-level sharing
    GROUP_ACCESS = "Group Access"     # Limited to a specific group


class InviteDirection(str, Enum):
    SENT = "sent"       # Current user sent the invite
    RECEIVED = "received"  # Current user received the invite


# ══════════════════════════════════════════════════════════════════════════════
#  REQUEST SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════


class SendInviteRequest(BaseModel):
    """Send a new invite — phone is encrypted before storage."""
    phone: str = Field(
        ...,
        examples=["+919876543210"],
        description="Invitee phone in E.164 format",
    )
    invitee_name: str | None = Field(
        None,
        max_length=100,
        description="Optional display name for the invitee",
    )
    relation: InviteRelation = Field(
        ...,
        description="Relationship type with the invitee",
    )
    access_scope: InviteAccessScope = Field(
        default=InviteAccessScope.GROUP_ACCESS,
        description="Level of access to grant",
    )
    message: str | None = Field(
        None,
        max_length=500,
        description="Optional personal message with the invite",
    )


class ResendInviteRequest(BaseModel):
    """Resend an existing pending invite (resets expiry)."""
    pass  # invite_id comes from path parameter


class AcceptInviteRequest(BaseModel):
    """Accept a received invite."""
    pass  # invite_id comes from path parameter


class RejectInviteRequest(BaseModel):
    """Reject a received invite."""
    reason: str | None = Field(
        None,
        max_length=200,
        description="Optional reason for declining",
    )


# ══════════════════════════════════════════════════════════════════════════════
#  RESPONSE SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════


class InviterOut(BaseModel):
    """Who sent the invite."""
    id: str
    name: str
    initials: str
    phone_masked: str  # +91****5592


class InviteeOut(BaseModel):
    """Who received the invite (phone is always masked)."""
    name: str | None = None
    phone_masked: str  # +91****5592


class InviteOut(BaseModel):
    """Single invite — returned in lists and detail views."""
    id: str
    inviter: InviterOut
    invitee: InviteeOut
    relation: InviteRelation
    access_scope: InviteAccessScope
    status: InviteStatus
    direction: InviteDirection  # relative to the requesting user
    message: str | None = None
    created_at: str
    updated_at: str | None = None
    expires_at: str | None = None
    accepted_at: str | None = None
    rejected_at: str | None = None
    group_id: str | None = None  # set after acceptance (linked group created)


class InviteDetailOut(InviteOut):
    """Extended detail — includes the linked group info if accepted."""
    group_name: str | None = None
    group_slug: str | None = None


class SendInviteResponse(BaseModel):
    """Response after sending an invite."""
    success: bool = True
    invite: InviteOut
    message: str = "Invite sent successfully"


class InviteActionResponse(BaseModel):
    """Response for accept/reject/revoke/resend actions."""
    success: bool = True
    invite: InviteOut
    message: str


class InviteListResponse(BaseModel):
    """Paginated list of invites."""
    items: list[InviteOut]
    meta: OffsetPageMeta


class InviteCountsOut(BaseModel):
    """Quick counts for the invite dashboard."""
    sent_pending: int = 0
    sent_total: int = 0
    received_pending: int = 0
    received_total: int = 0


# ══════════════════════════════════════════════════════════════════════════════
#  LOOKUP + REGISTER (invite modal flow)
# ══════════════════════════════════════════════════════════════════════════════


class LookupPhoneRequest(BaseModel):
    """Check whether a phone is already registered on ArogyaVault."""
    phone: str = Field(..., description="Phone number in E.164 or loose format")
    group_id: str | None = Field(
        default=None,
        description=(
            "Optional group id the invite modal is currently scoped to. "
            "When supplied, the response will set already_member=True if the "
            "looked-up phone already belongs to this group so the modal can "
            "short-circuit into a cancel-only state."
        ),
    )


class LookupPhoneResponse(BaseModel):
    """Lookup result — safe for the invite modal."""
    registered: bool
    phone_masked: str
    name: str | None = None
    already_member: bool = Field(
        default=False,
        description=(
            "True when the looked-up phone is already a member of the "
            "group_id passed in the request. The invite modal uses this "
            "to show an 'already a member' state with only a Cancel button."
        ),
    )


class RegisterInviteeRequest(BaseModel):
    """
    Register a brand-new user via the invite OTP flow (dev OTP = 123456).

    `invite_level` drives the post-registration behaviour:
      - "app"         → register only, no group created
      - "group"       → register + create a fresh linked group between inviter+invitee
      - "<group_id>"  → register + add invitee to an existing group owned by the inviter
    """
    phone: str = Field(..., description="Invitee phone in E.164 format")
    code: str = Field(..., description="OTP verification code")
    name: str | None = Field(None, max_length=100)
    invite_level: str = Field(
        default="group",
        description="'app', 'group', or a group id the inviter wants to reuse",
    )
    relation: InviteRelation | None = Field(
        default=InviteRelation.FAMILY,
        description="Relationship to record on the newly-created linked group",
    )
    access_scope: InviteAccessScope | None = Field(
        default=InviteAccessScope.APP_ACCESS,
        description="Access scope for the new linked group",
    )


class RegisterInviteeResponse(BaseModel):
    success: bool = True
    user_id: str
    phone_masked: str
    name: str
    group_id: str | None = None
    message: str = "Invitee registered successfully"
