"""
Group routes for ArogyaVault.

Endpoints:
  GET  /groups          — List all groups for the current user (with invite metadata)
  GET  /groups/{id}     — Get a single group by UUID

Platform-aware: mobile clients receive compact group payloads.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.schemas.groups import GroupListResponse, GroupOut
from app.api.store import GROUPS, GROUP_BY_SLUG, INVITE_REGISTRY
from app.core.deps import get_current_user, get_platform, PlatformContext
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/groups", tags=["Groups"])

CurrentUser = Annotated[dict, Depends(get_current_user)]
Platform = Annotated[PlatformContext, Depends(get_platform)]


def _enrich_group(group: dict, user: dict) -> dict:
    """
    Enrich a group dict with invite metadata.

    For linked groups, attach the invite direction and status so the
    frontend can display "You invited them" / "They invited you" / "Mutual".
    """
    enriched = {**group}

    if group.get("type") != "linked":
        return enriched

    group_id = group["id"]
    user_id = user["id"]
    user_ph = user.get("phone_hash", "")

    # Find the invite that created this group
    for inv in INVITE_REGISTRY.values():
        if inv.get("group_id") != group_id:
            continue

        if inv["inviter_id"] == user_id:
            enriched["invite_direction"] = "out"   # You invited them
        elif user_ph and inv["phone_hash"] == user_ph:
            enriched["invite_direction"] = "in"    # They invited you
        else:
            enriched["invite_direction"] = "unknown"

        enriched["invite_id"] = inv["id"]
        enriched["invite_status"] = inv["status"]
        enriched["invite_relation"] = inv.get("relation")
        enriched["invite_access_scope"] = inv.get("access_scope")
        break

    return enriched


@router.get(
    "",
    summary="List all groups",
    response_model=GroupListResponse,
)
async def list_groups(user: CurrentUser, ctx: Platform):
    """
    Return every group (system + linked) for the current user.

    Linked groups include invite metadata (direction, status, relation)
    for the frontend to display the correct invite state.
    """
    groups = [_enrich_group(g, user) for g in GROUPS.values()]
    return {"groups": groups}


@router.get(
    "/{group_id}",
    summary="Get a group by UUID",
    response_model=GroupOut,
)
async def get_group(group_id: str, user: CurrentUser, ctx: Platform):
    """Fetch a single group by its UUID with invite metadata."""
    group = GROUPS.get(group_id)
    if not group:
        raise NotFoundError("Group")
    return _enrich_group(group, user)
