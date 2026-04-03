"""
Group routes for ArogyaVault.

Endpoints:
  GET  /groups          — List all groups
  GET  /groups/{id}     — Get a single group by UUID
"""

from fastapi import APIRouter, HTTPException

from app.api.store import GROUPS, GROUP_BY_SLUG

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get(
    "",
    summary="List all groups",
)
async def list_groups():
    """Return every group (system + linked)."""
    return {"groups": list(GROUPS.values())}


@router.get(
    "/{group_id}",
    summary="Get a group by UUID",
)
async def get_group(group_id: str):
    """Fetch a single group by its UUID."""
    group = GROUPS.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group
