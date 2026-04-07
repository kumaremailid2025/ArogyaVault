"""
Dependency injection utilities for FastAPI routes.

Centralised dependencies ensure consistent behaviour across all endpoints.
When auth middleware is wired, `get_current_user` will decode JWTs.
"""

from __future__ import annotations

from dataclasses import dataclass
from fastapi import Request

from app.api.store import USERS_BY_ID
from app.core.constants import (
    MOBILE_ACTIVITY_PAGE_SIZE,
    MOBILE_FEED_LIMIT,
    MOBILE_PAGE_SIZE,
    WEB_ACTIVITY_PAGE_SIZE,
    WEB_FEED_LIMIT,
    WEB_PAGE_SIZE,
)


# ══════════════════════════════════════════════════════════════════════════════
#  CURRENT USER — placeholder until real JWT auth is wired
# ══════════════════════════════════════════════════════════════════════════════

_FALLBACK_USER_ID = "usr_001"


async def get_current_user(request: Request) -> dict:
    """
    Return the authenticated user dict.

    Currently returns the hardcoded fallback user. Once JWT auth middleware
    is wired, this will decode the token from the Authorization header
    (forwarded by the Next.js proxy) and return the real user.
    """
    # Future: token = request.headers.get("Authorization", "").removeprefix("Bearer ")
    # decoded = jwt.decode(token, ...)
    # user = USERS_BY_ID[decoded["sub"]]
    user = USERS_BY_ID.get(_FALLBACK_USER_ID)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="User not found")
    return user


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
