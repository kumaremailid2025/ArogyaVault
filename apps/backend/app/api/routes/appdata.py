"""
App Data API — serves all frontend mock/seed data from the backend store.

All user-specific mock datasets (vault health, dashboard, AI context, community,
linked members, etc.) are loaded from JSON seed files on module import. They are
exposed via a single bootstrap endpoint that is SCOPED per-user:

- Kumar (usr_001) receives the complete seeded dataset.
- Every other user (invited, newly registered) receives empty collections so their
  app starts out as a clean slate.

Static reference data (medical systems, drug interactions, educational topics,
voice language list) is identical for every user.

This replaces the former `apps/web/src/data/*.ts` files so no mock data lives
in the frontend anymore.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user


router = APIRouter(prefix="/app-data", tags=["app-data"])

CurrentUser = Annotated[dict, Depends(get_current_user)]

SEED_DIR = Path(__file__).resolve().parent.parent / "seeds"

# The primary (and currently only) seed-data owner.
SEED_OWNER_USER_ID = "usr_001"


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


def build_bootstrap_for_user(user_id: str) -> dict[str, Any]:
    """
    Return the full frontend-facing data bundle scoped to `user_id`.

    For the seed owner, every user-scoped dataset returns its seeded contents.
    For any other user, user-scoped datasets return empty shapes.
    """
    bundle: dict[str, Any] = {}
    for bundle_key, filename, user_scoped in DATASETS:
        seed = _load_seed(filename)
        if user_scoped and user_id != SEED_OWNER_USER_ID:
            bundle[bundle_key] = _empty_like(seed)
        else:
            bundle[bundle_key] = seed
    return bundle


@router.get("/bootstrap")
async def get_app_data_bootstrap(user: CurrentUser) -> dict[str, Any]:
    """
    Return all mock/seed datasets the frontend needs to render the app shell,
    scoped to the current user.

    Kumar (usr_001) sees the full seeded dataset; any other user sees empty
    collections so their experience starts as a clean slate.
    """
    return {
        "user_id": user.get("id"),
        "is_seed_owner": user.get("id") == SEED_OWNER_USER_ID,
        "data": build_bootstrap_for_user(user.get("id", "")),
    }
