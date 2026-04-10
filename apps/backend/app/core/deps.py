"""
Dependency injection utilities for FastAPI routes.

Centralised dependencies ensure consistent behaviour across all endpoints.
`get_current_user` decodes the JWT forwarded by the Next.js proxy (or a
mobile client's raw Authorization header) and returns the real user record.
"""

from __future__ import annotations

from dataclasses import dataclass

import jwt
from fastapi import HTTPException, Request

from app.api.store import USERS_BY_ID, lookup_user_by_phone, register_new_user
from app.core.config import get_settings
from app.core.constants import (
    MOBILE_ACTIVITY_PAGE_SIZE,
    MOBILE_FEED_LIMIT,
    MOBILE_PAGE_SIZE,
    SEED_OWNER_USER_ID,
    WEB_ACTIVITY_PAGE_SIZE,
    WEB_FEED_LIMIT,
    WEB_PAGE_SIZE,
)


# ══════════════════════════════════════════════════════════════════════════════
#  CURRENT USER — decode the JWT access token and return the real user
# ══════════════════════════════════════════════════════════════════════════════

# Legacy fallback, only used when FORCE_FALLBACK_USER=1 is explicitly set
# (handy for local debugging without a running auth flow). Points at the
# seed owner (Kumar).
_FALLBACK_USER_ID = SEED_OWNER_USER_ID


def _decode_access_token(token: str) -> dict:
    """Decode a JWT access token. Raises HTTPException on any failure."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=401,
            detail=f"Expected access token, got {payload.get('type')}.",
        )
    return payload


async def get_current_user(request: Request) -> dict:
    """
    Return the authenticated user dict by decoding the Bearer access token.

    The Next.js proxy forwards the httpOnly `access_token` cookie as an
    `Authorization: Bearer <jwt>` header; native mobile clients set the
    header directly. We decode it here and look up the user by `sub`.
    """
    import os

    auth_header = request.headers.get("Authorization", "") or ""

    # Only fall back to the seed owner when FORCE_FALLBACK_USER=1.
    if not auth_header.startswith("Bearer "):
        if os.getenv("FORCE_FALLBACK_USER") == "1":
            user = USERS_BY_ID.get(_FALLBACK_USER_ID)
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            return user
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header.",
        )

    token = auth_header[len("Bearer "):].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Empty bearer token.")

    payload = _decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject.")

    user = USERS_BY_ID.get(user_id)
    if user:
        return user

    # ── Dev-mode rehydrate ───────────────────────────────────────────
    # The in-memory store is wiped on every backend restart, so any
    # JWT issued before the restart points to a user id that no longer
    # exists. Rather than forcing a full re-sign-in (which in turn
    # requires redoing the invite flow for invitees), we auto-rehydrate
    # the user from the `phone` claim in the JWT: it's still signed by
    # our secret, so trusting it in dev is fine.
    phone = (payload.get("phone") or "").strip()
    if phone:
        existing = lookup_user_by_phone(phone)
        if existing:
            return existing
        # Auto-register a minimal user record so the session keeps
        # working. Invite-group linkage (inviter_id / invited_by) is
        # intentionally lost — the invite group was in-memory too and
        # is gone after the restart anyway.
        return register_new_user(phone, name=None, invited_by=None)

    raise HTTPException(status_code=401, detail="User not found")


# ══════════════════════════════════════════════════════════════════════════════
#  PLATFORM CONTEXT — extracted from X-Platform / X-App-Version headers
# ══════════════════════════════════════════════════════════════════════════════


@dataclass
class PlatformContext:
    """
    Platform context parsed from request headers by PlatformMiddleware.

    Usage in routes:
        platform: PlatformContext = Depends(get_platform)
        if platform.is_mobile:
            # return smaller page size, push-friendly payload, etc.
    """
    platform: str       # "web" | "ios" | "android" | "api"
    app_version: str | None
    device_id: str | None
    locale: str

    @property
    def is_mobile(self) -> bool:
        return self.platform in ("ios", "android")

    @property
    def is_web(self) -> bool:
        return self.platform == "web"

    def page_size(self, web: int = WEB_PAGE_SIZE, mobile: int = MOBILE_PAGE_SIZE) -> int:
        """Return the platform-adaptive page size.

        Accepts custom web/mobile values for endpoints that need
        different defaults (e.g. activities: 50/25, feeds: 20/10).
        """
        return mobile if self.is_mobile else web

    def feed_limit(self) -> int:
        """Return the platform-adaptive cursor-feed limit."""
        return MOBILE_FEED_LIMIT if self.is_mobile else WEB_FEED_LIMIT

    def activity_page_size(self) -> int:
        """Return the platform-adaptive activity page size."""
        return MOBILE_ACTIVITY_PAGE_SIZE if self.is_mobile else WEB_ACTIVITY_PAGE_SIZE


async def get_platform(request: Request) -> PlatformContext:
    """
    Extract platform context from request.state (set by PlatformMiddleware).

    Routes can use this to adapt behaviour per client:
      - Mobile: smaller default page sizes, push token registration
      - Web: larger payloads, cookie-based auth
      - API: raw JSON, no session management
    """
    return PlatformContext(
        platform=getattr(request.state, "platform", "web"),
        app_version=getattr(request.state, "app_version", None),
        device_id=getattr(request.state, "device_id", None),
        locale=getattr(request.state, "locale", "en"),
    )
