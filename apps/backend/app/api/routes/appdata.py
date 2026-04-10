"""
App Data API — serves all frontend mock/seed data from the backend store.

All user-specific mock datasets (vault health, dashboard, AI context, community,
linked members, etc.) are loaded from JSON seed files on module import. They are
exposed via a single bootstrap endpoint that is SCOPED per-user:

- Kumar (the seed owner) receives the complete seeded dataset.
- Every other user (invited, newly registered) receives empty collections so their
  app starts out as a clean slate.

Static reference data (medical systems, drug interactions, educational topics,
voice language list) is identical for every user.

This replaces the former `apps/web/src/data/*.ts` files so no mock data lives
in the frontend anymore.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.constants import SEED_OWNER_USER_ID
from app.api.store import (
    GROUPS,
    USER_GROUPS,
    USERS_BY_ID,
    get_user_groups,
)

logger = logging.getLogger("arogyavault.appdata")

# Dev-time tracer for counterpart label resolution. Flip on by setting
# `AROGYA_DEBUG_COUNTERPART=1` in the backend environment. Prints
# unconditionally to stdout (not just logger) so it shows up even when
# logger config is minimal. Leave off in prod.
_DEBUG_COUNTERPART = os.getenv("AROGYA_DEBUG_COUNTERPART", "0") == "1"


router = APIRouter(prefix="/app-data", tags=["app-data"])

CurrentUser = Annotated[dict, Depends(get_current_user)]

SEED_DIR = Path(__file__).resolve().parent.parent / "seeds"


@lru_cache(maxsize=None)
def _load_seed(name: str) -> dict[str, Any]:
    """Load and cache a JSON seed file by its bare name (no .json extension)."""
    path = SEED_DIR / f"{name}.json"
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


def _empty_like(shape: dict[str, Any]) -> dict[str, Any]:
    """Return the same keys as `shape` but with empty containers of matching type."""
    out: dict[str, Any] = {}
    for key, value in shape.items():
        if isinstance(value, list):
            out[key] = []
        elif isinstance(value, dict):
            out[key] = {}
        elif isinstance(value, str):
            out[key] = ""
        elif isinstance(value, bool):
            out[key] = False
        elif isinstance(value, (int, float)):
            out[key] = 0
        else:
            out[key] = None
    return out


# ── Dataset registry ────────────────────────────────────────────────────────
# Each entry says: which seed file, and whether it is user-scoped.
# user_scoped=True → empty for everyone except the seed owner.
# user_scoped=False → same data for every user (static reference data).
DATASETS: list[tuple[str, str, bool]] = [
    # (bootstrap key, seed filename, user_scoped)
    ("vaultHealth", "vault-health-data", True),
    ("dashboard", "dashboard-data", True),
    ("aiContext", "ai-context-data", True),
    ("aiConversations", "ai-conversations", True),
    ("community", "community-data", True),
    ("communityFiles", "community-files-data", True),
    ("communityMembers", "community-members-data", True),
    ("linkedMembers", "linked-member-data", True),
    # User-scoped mock data (Kumar-only seed; empty for everyone else)
    ("groups", "groups-data", True),
    ("records", "records-data", True),
    ("profile", "profile-data", True),
    ("sidebar", "sidebar-data", True),
    ("pdfLibrary", "pdf-library", True),
    # Static reference data — same for every user
    ("learn", "learn-data", False),
    ("learnContext", "learn-context-data", False),
    ("medicalSystems", "medical-systems-data", False),
    ("voiceLanguages", "voice-languages", False),
    ("drugSuggestions", "drug-suggestions", False),
]


def _initials_for_label(label: str) -> str:
    """
    Produce 2-char initials from a label which may be either a real name
    ("Ravi Kumar" → "RK") or a masked phone ("+91****5592" → "92").
    """
    label = (label or "").strip()
    if not label:
        return "U"
    # Phone-ish label → use last two visible digits
    if label.startswith("+") or label.lstrip("+").replace("*", "").isdigit():
        digits = [c for c in label if c.isdigit()]
        if len(digits) >= 2:
            return "".join(digits[-2:])
        return "U"
    letters = "".join(w[0] for w in label.split()[:2]).upper()
    return letters[:2] or "U"


def _counterpart_label(group: dict[str, Any], viewer_id: str) -> str:
    """
    Resolve the display label for a linked group from the viewer's POV.

    Resolution order (covers every state the in-memory store can be in,
    including rows that were created BEFORE the inviter_id / invitee_id /
    invited_by fields existed):

      1. Viewer is the invitee
         a. Use group.inviter_id → inviter.phone_masked
         b. Fall back to viewer.invited_by → inviter.phone_masked
         c. Fall back to a group-membership scan: any OTHER user that
            belongs to this group and whose phone_masked differs from
            the viewer's own masked phone.
      2. Viewer is the inviter
         a. Use group.invitee_id → invitee.name or invitee.phone_masked
         b. Fall back to a group-membership scan (same rule).
      3. Viewer is neither known side but has an invited_by stamp
         (legacy groups).

    Under NO circumstance should a viewer see their own phone as the
    counterpart label — we guard against that at the end.
    """
    inviter_id = group.get("inviter_id")
    invitee_id = group.get("invitee_id")
    stored_name = (group.get("name") or "").strip()
    group_id = group.get("id") or group.get("slug")

    viewer_user = USERS_BY_ID.get(viewer_id or "") or {}
    viewer_masked = (viewer_user.get("phone_masked") or "").strip()

    def _log(branch: str, value: str) -> None:
        if _DEBUG_COUNTERPART:
            print(
                f"[counterpart] group={group_id} viewer={viewer_id}"
                f" inviter_id={inviter_id} invitee_id={invitee_id}"
                f" stored_name={stored_name!r}"
                f" viewer_masked={viewer_masked!r}"
                f" → branch={branch} value={value!r}",
                flush=True,
            )

    def _scan_other_member() -> str | None:
        """
        Find any OTHER user in this group's membership and return their
        masked phone. Used when the group has no inviter_id/invitee_id
        (legacy rows) or when those ids don't resolve to a known user.
        """
        if not group_id:
            return None
        for uid, gids in USER_GROUPS.items():
            if uid == viewer_id:
                continue
            if group_id not in gids:
                continue
            other = USERS_BY_ID.get(uid) or {}
            other_masked = (other.get("phone_masked") or "").strip()
            if other_masked and other_masked != viewer_masked:
                return other_masked
        return None

    # ── 1. Invitee viewer ────────────────────────────────────────────
    if viewer_id and viewer_id == invitee_id:
        # 1a. group.inviter_id
        if inviter_id:
            inviter = USERS_BY_ID.get(inviter_id) or {}
            masked = (inviter.get("phone_masked") or "").strip()
            if masked and masked != viewer_masked:
                _log("invitee:group.inviter_id", masked)
                return masked
        # 1b. viewer.invited_by
        fallback_inviter_id = viewer_user.get("invited_by")
        if fallback_inviter_id:
            inviter = USERS_BY_ID.get(fallback_inviter_id) or {}
            masked = (inviter.get("phone_masked") or "").strip()
            if masked and masked != viewer_masked:
                _log("invitee:viewer.invited_by", masked)
                return masked
        # 1c. group membership scan
        scanned = _scan_other_member()
        if scanned:
            _log("invitee:scan", scanned)
            return scanned
        _log("invitee:fallback-stored", stored_name or "Inviter")
        return stored_name or "Inviter"

    # ── 2. Inviter viewer ────────────────────────────────────────────
    if viewer_id and viewer_id == inviter_id:
        if invitee_id:
            invitee = USERS_BY_ID.get(invitee_id) or {}
            counterpart_name = (invitee.get("name") or "").strip()
            if counterpart_name:
                _log("inviter:invitee.name", counterpart_name)
                return counterpart_name
            masked = (invitee.get("phone_masked") or "").strip()
            if masked and masked != viewer_masked:
                _log("inviter:invitee.phone_masked", masked)
                return masked
        scanned = _scan_other_member()
        if scanned:
            _log("inviter:scan", scanned)
            return scanned
        _log("inviter:fallback-stored", stored_name or "Invited")
        return stored_name or "Invited"

    # ── 3. Legacy viewer (neither id set on group) ───────────────────
    if viewer_id:
        fallback_inviter_id = viewer_user.get("invited_by")
        if fallback_inviter_id:
            inviter = USERS_BY_ID.get(fallback_inviter_id) or {}
            masked = (inviter.get("phone_masked") or "").strip()
            if masked and masked != viewer_masked:
                _log("legacy:viewer.invited_by", masked)
                return masked
        scanned = _scan_other_member()
        if scanned:
            _log("legacy:scan", scanned)
            return scanned

    # ── 4. Final guard ───────────────────────────────────────────────
    # Never return the viewer's own masked phone as a "counterpart".
    final = stored_name or "Linked"
    if viewer_masked and final == viewer_masked:
        final = "Linked"
    _log("fallback", final)
    return final


def _group_member_count(group: dict[str, Any]) -> int:
    """
    Return the total number of members in a dynamic linked group by
    counting how many users have this group id in their USER_GROUPS
    membership set.
    """
    gid = group.get("id")
    if not gid:
        return 2
    return sum(1 for groups in USER_GROUPS.values() if gid in groups)


def _extras_count(group: dict[str, Any]) -> int:
    """Extras beyond the 1:1 pair — drives the `+N` suffix in the sidebar."""
    return max(0, _group_member_count(group) - 2)


def _format_invited_at(iso_value: str) -> str:
    """
    Format an ISO-8601 `created_at` timestamp as a compact, human-friendly
    "invited on" label for the sidebar (e.g. "Invited Apr 10, 15:42").
    Falls back to an empty string on parse errors.
    """
    if not iso_value:
        return ""
    try:
        raw = iso_value.replace("Z", "+00:00")
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return "Invited " + dt.strftime("%b %d, %H:%M")
    except (TypeError, ValueError):
        return ""


def _linked_group_to_sidebar(group: dict[str, Any], viewer_id: str) -> dict[str, Any]:
    """
    Shape a store group record into a sidebar LINKED_GROUPS entry.

    For dynamic invite-created groups the secondary line shows the
    invite timestamp ("Invited Apr 10, 15:42") instead of the static
    "Family Member · App Access" combo — callers of this helper only
    pass dynamic groups, so rel/sub are safe to override.
    """
    label = _counterpart_label(group, viewer_id)
    invited_at = _format_invited_at(group.get("created_at", ""))
    return {
        "slug": group.get("slug") or group.get("id"),
        "name": label,
        # Show invite timestamp as the sole sub-line for dynamic invite
        # groups. `rel` is intentionally blank so the sidebar renders
        # just the date/time without a "Family Member · " prefix.
        "rel": "",
        "sub": invited_at,
        "count": _extras_count(group),
        "initials": _initials_for_label(label),
    }


def _linked_group_to_group_card(group: dict[str, Any], viewer_id: str) -> dict[str, Any]:
    """Shape a store group record into a groups-data ALL_GROUPS entry."""
    label = _counterpart_label(group, viewer_id)
    return {
        "id": group.get("slug") or group.get("id"),
        "name": label,
        "rel": group.get("rel", ""),
        "direction": "out",
        "scope": group.get("access", ""),
        "canUpload": False,
        "members": _group_member_count(group),
        "joined": "Just now",
        "last": "Invitation accepted",
        "initials": _initials_for_label(label),
    }


def _dynamic_linked_groups_for(user_id: str) -> list[dict[str, Any]]:
    """
    Return the user's dynamic (invite-created) linked groups sorted by
    creation time descending — newest first, so the freshest invite
    lands at the top of the sidebar.
    """
    groups = [
        g
        for g in get_user_groups(user_id)
        if g.get("type") == "linked" and (g.get("inviter_id") or g.get("invitee_id"))
    ]
    groups.sort(key=lambda g: g.get("created_at") or "", reverse=True)
    return groups


def _sidebar_for_invited_user(user_id: str) -> dict[str, Any]:
    """
    Build a minimal sidebar for a non-seed-owner user that surfaces:
      - The Community header entry (fallback shape)
      - Any dynamically-created linked groups the user belongs to,
        newest first, with phone-number labels until a name is set.
    """
    linked = [
        _linked_group_to_sidebar(g, user_id)
        for g in _dynamic_linked_groups_for(user_id)
    ]
    return {
        "COMMUNITY_GROUP": {
            "slug": "community",
            "name": "Community",
            "sub": "ArogyaCommunity",
            "icon": "MessageCircleIcon",
        },
        "LINKED_GROUPS": linked,
        "INVITE_GROUPS": [
            {"id": g["slug"], "name": g["name"]} for g in linked
        ],
        "TOP_NOTIFICATIONS": [],
    }


def _build_member_row(
    user: dict[str, Any],
    *,
    role: str,
    viewer_masked: str,
    group_id: str,
) -> dict[str, Any]:
    """
    Convert a user record into a `CommunityMember`-shaped dict the
    frontend members list understands. Label defaults to the user's
    masked phone; falls back to their name when available.

    The member row's `id` is the user's own UUID — selecting a member
    in the UI maps directly to a real user record on the backend.
    """
    masked = (user.get("phone_masked") or "").strip()
    display_name = (user.get("name") or "").strip() or masked or "Member"
    # Viewer sees themselves as "You" — matches the tone of the seeded rows.
    if masked and masked == viewer_masked:
        display_name = f"You ({masked})"
    return {
        "id": user.get("id") or "",
        "name": display_name,
        "initials": _initials_for_label(display_name),
        "role": role,
        "status": "recently",
        "statusLabel": "Recently active",
        "joinedAt": "",
        "location": "",
        "stats": {
            "posts": 0,
            "replies": 0,
            "uploads": 0,
            "questions": 0,
            "likes": 0,
        },
        "activities": [],
    }


def _members_rows_for_group(group: dict[str, Any], viewer_id: str) -> list[dict[str, Any]]:
    """
    Return the `INVITED_GROUP_MEMBERS[slug]` list for one dynamic linked
    group from `viewer_id`'s point of view.

    Rows are derived from the live USER_GROUPS membership so any user
    who has been added to the group (including later +N invitees) shows
    up automatically. The viewer themselves is labelled "You (…)".
    """
    group_id = group.get("id") or group.get("slug")
    if not group_id:
        return []

    inviter_id = group.get("inviter_id")
    viewer_user = USERS_BY_ID.get(viewer_id or "") or {}
    viewer_masked = (viewer_user.get("phone_masked") or "").strip()

    rows: list[dict[str, Any]] = []
    seen: set[str] = set()

    def _append(uid: str) -> None:
        if not uid or uid in seen:
            return
        user = USERS_BY_ID.get(uid)
        if not user:
            return
        role = "Owner" if uid == inviter_id else "Family Member"
        rows.append(
            _build_member_row(
                user,
                role=role,
                viewer_masked=viewer_masked,
                group_id=group_id,
            )
        )
        seen.add(uid)

    # Viewer first so they always sit at the top of the list.
    if viewer_id:
        _append(viewer_id)

    # Then every other member of the group (inviter, invitee, additional +N).
    for uid, gids in USER_GROUPS.items():
        if group_id in gids:
            _append(uid)

    return rows


def _community_members_for_invited_user(user_id: str) -> dict[str, Any]:
    """
    Build a `communityMembers` bundle for a non-seed user containing only
    the members of the dynamic linked groups they belong to (keyed by the
    group's slug/UUID).
    """
    invited_groups: dict[str, list[dict[str, Any]]] = {}
    for g in _dynamic_linked_groups_for(user_id):
        slug = g.get("slug") or g.get("id")
        if not slug:
            continue
        invited_groups[slug] = _members_rows_for_group(g, user_id)
    return {
        "COMMUNITY_MEMBERS": [],
        "INVITED_GROUP_MEMBERS": invited_groups,
    }


def _linked_members_for_invited_user(user_id: str) -> dict[str, Any]:
    """
    Build a linkedMembers bundle for a non-seed-owner user containing
    minimal LinkedMember records for every dynamic linked group they
    belong to. The slug used here matches the group's `slug` (its UUID).
    """
    members: dict[str, Any] = {}
    summaries: dict[str, Any] = {}
    ai_responses: dict[str, Any] = {}
    for g in _dynamic_linked_groups_for(user_id):
        slug = g.get("slug") or g.get("id")
        label = _counterpart_label(g, user_id)
        members[slug] = {
            "name": label,
            "relation": g.get("rel", "Family Member"),
            "direction": "They invited you",
            "scope": g.get("access", "App Access"),
            "badgeLabel": g.get("rel", "Member"),
            "initials": _initials_for_label(label),
            "posts": [],
            "sharedFiles": [],
            "memberCount": _group_member_count(g),
            "members": [],
        }
        summaries[slug] = {}
        ai_responses[slug] = {}
    return {
        "LINKED_MEMBER_DATA": members,
        "LINKED_POST_SUMMARIES": summaries,
        "LINKED_POST_AI_RESPONSES": ai_responses,
    }


def _groups_for_invited_user(user_id: str) -> dict[str, Any]:
    """
    Build a groups-data bundle for a non-seed-owner user containing only
    the groups they actually belong to (sorted newest first).
    """
    linked = [
        _linked_group_to_group_card(g, user_id)
        for g in _dynamic_linked_groups_for(user_id)
    ]
    return {
        "ALL_GROUPS": linked,
        "DIR": {
            "out": {
                "icon": "ArrowRightIcon",
                "label": "You invited",
                "color": "text-primary",
                "bg": "bg-primary/10",
                "desc": "You can see their records",
            },
            "in": {
                "icon": "ArrowLeftIcon",
                "label": "They invited",
                "color": "text-amber-500",
                "bg": "bg-amber-50",
                "desc": "They can see your records",
            },
            "both": {
                "icon": "ArrowLeftRightIcon",
                "label": "Mutual",
                "color": "text-emerald-500",
                "bg": "bg-emerald-50",
                "desc": "Both directions active",
            },
        },
        "GROUP_PERMISSIONS": {},
        "GROUP_NAMES": {g["id"]: g["name"] for g in linked},
    }


def _overlay_seed_owner_dynamic_groups(
    bundle: dict[str, Any], user_id: str
) -> None:
    """
    For the seed owner (Kumar), merge dynamic invite-created linked groups
    on top of the seeded sidebar/groups/linkedMembers payloads so newly
    invited groups appear at the TOP of the Community sidebar without
    clobbering the pre-seeded demo groups.
    """
    dyn = _dynamic_linked_groups_for(user_id)
    if not dyn:
        return

    # ── Sidebar: prepend new dynamic groups (newest first) ───────────────
    sidebar = bundle.get("sidebar") or {}
    existing_linked = list(sidebar.get("LINKED_GROUPS") or [])
    existing_slugs = {g.get("slug") for g in existing_linked}
    dyn_sidebar = [
        _linked_group_to_sidebar(g, user_id)
        for g in dyn
        if (g.get("slug") or g.get("id")) not in existing_slugs
    ]
    sidebar["LINKED_GROUPS"] = dyn_sidebar + existing_linked
    existing_invite_groups = list(sidebar.get("INVITE_GROUPS") or [])
    existing_invite_ids = {g.get("id") for g in existing_invite_groups}
    dyn_invite_groups = [
        {"id": g["slug"], "name": g["name"]}
        for g in dyn_sidebar
        if g["slug"] not in existing_invite_ids
    ]
    sidebar["INVITE_GROUPS"] = dyn_invite_groups + existing_invite_groups
    bundle["sidebar"] = sidebar

    # ── Groups: prepend ALL_GROUPS cards (newest first) ─────────────────
    groups_bundle = bundle.get("groups") or {}
    existing_all = list(groups_bundle.get("ALL_GROUPS") or [])
    existing_group_ids = {g.get("id") for g in existing_all}
    dyn_cards = [
        _linked_group_to_group_card(g, user_id)
        for g in dyn
        if (g.get("slug") or g.get("id")) not in existing_group_ids
    ]
    groups_bundle["ALL_GROUPS"] = dyn_cards + existing_all
    group_names = dict(groups_bundle.get("GROUP_NAMES") or {})
    for card in dyn_cards:
        group_names[card["id"]] = card["name"]
    groups_bundle["GROUP_NAMES"] = group_names
    bundle["groups"] = groups_bundle

    # ── LinkedMembers: add entries keyed by slug ────────────────────────
    lm_bundle = bundle.get("linkedMembers") or {}
    member_data = dict(lm_bundle.get("LINKED_MEMBER_DATA") or {})
    summaries = dict(lm_bundle.get("LINKED_POST_SUMMARIES") or {})
    ai_responses = dict(lm_bundle.get("LINKED_POST_AI_RESPONSES") or {})
    for g in dyn:
        slug = g.get("slug") or g.get("id")
        if not slug or slug in member_data:
            continue
        label = _counterpart_label(g, user_id)
        member_data[slug] = {
            "name": label,
            "relation": g.get("rel", "Family Member"),
            "direction": "You invited them",
            "scope": g.get("access", "App Access"),
            "badgeLabel": g.get("rel", "Member"),
            "initials": _initials_for_label(label),
            "posts": [],
            "sharedFiles": [],
            "memberCount": _group_member_count(g),
            "members": [],
        }
        summaries[slug] = {}
        ai_responses[slug] = {}
    lm_bundle["LINKED_MEMBER_DATA"] = member_data
    lm_bundle["LINKED_POST_SUMMARIES"] = summaries
    lm_bundle["LINKED_POST_AI_RESPONSES"] = ai_responses
    bundle["linkedMembers"] = lm_bundle

    # ── CommunityMembers: add INVITED_GROUP_MEMBERS rows for dynamic groups ─
    cm_bundle = bundle.get("communityMembers") or {}
    invited_group_members = dict(cm_bundle.get("INVITED_GROUP_MEMBERS") or {})
    for g in dyn:
        slug = g.get("slug") or g.get("id")
        if not slug or slug in invited_group_members:
            continue
        invited_group_members[slug] = _members_rows_for_group(g, user_id)
    cm_bundle["INVITED_GROUP_MEMBERS"] = invited_group_members
    bundle["communityMembers"] = cm_bundle


def build_bootstrap_for_user(user_id: str) -> dict[str, Any]:
    """
    Return the full frontend-facing data bundle scoped to `user_id`.

    For the seed owner, every user-scoped dataset returns its seeded
    contents PLUS any dynamic linked groups the user has created via
    the invite flow (prepended so the newest invite is at the top).

    For any other user, user-scoped datasets return empty shapes —
    except for `sidebar`, `groups` and `linkedMembers`, which are
    overlaid with the dynamic linked groups the user belongs to.
    """
    bundle: dict[str, Any] = {}
    for bundle_key, filename, user_scoped in DATASETS:
        seed = _load_seed(filename)
        if user_scoped and user_id != SEED_OWNER_USER_ID:
            if bundle_key == "sidebar":
                bundle[bundle_key] = _sidebar_for_invited_user(user_id)
            elif bundle_key == "groups":
                bundle[bundle_key] = _groups_for_invited_user(user_id)
            elif bundle_key == "linkedMembers":
                bundle[bundle_key] = _linked_members_for_invited_user(user_id)
            elif bundle_key == "communityMembers":
                bundle[bundle_key] = _community_members_for_invited_user(user_id)
            else:
                bundle[bundle_key] = _empty_like(seed)
        else:
            bundle[bundle_key] = seed

    if user_id == SEED_OWNER_USER_ID:
        _overlay_seed_owner_dynamic_groups(bundle, user_id)

    return bundle


@router.get("/bootstrap")
async def get_app_data_bootstrap(user: CurrentUser) -> dict[str, Any]:
    """
    Return all mock/seed datasets the frontend needs to render the app shell,
    scoped to the current user.

    Kumar (the seed owner) sees the full seeded dataset; any other user sees empty
    collections so their experience starts as a clean slate.
    """
    return {
        "user_id": user.get("id"),
        "is_seed_owner": user.get("id") == SEED_OWNER_USER_ID,
        "data": build_bootstrap_for_user(user.get("id", "")),
    }
