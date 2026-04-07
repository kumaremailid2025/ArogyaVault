"""
Platform-aware middleware for ArogyaVault.

Industry-standard approach for shared APIs consumed by both web and mobile:

Instead of a web/mobile "flag", we use the standard `X-Platform` header.
This follows the pattern used by Stripe, Twilio, Firebase, and other
production APIs that serve multiple client types from a single API.

Why NOT separate /web and /mobile endpoints:
  - Violates DRY — duplicated logic, double the bugs
  - API versioning nightmare — /v1/web/invites vs /v1/mobile/invites
  - Forces clients into a lane they can't easily switch out of

Why X-Platform header:
  - Single API, client identifies itself via header
  - Backend can adapt response shape, pagination defaults, push config
  - Easy to extend: add "tablet", "watch", "tv" later
  - Standard practice in Stripe (User-Agent), Firebase (X-Client-Version)

Header: X-Platform
  Values: "web" | "ios" | "android" | "api" (default: "web")

Additional standard headers parsed:
  X-App-Version: "1.2.3" — client app version (mobile release tracking)
  X-Device-Id: "uuid" — anonymous device identifier (for push tokens, analytics)
  Accept-Language: "en-IN" — locale for response i18n (future)
"""

from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


# Valid platform values
VALID_PLATFORMS = {"web", "ios", "android", "api"}
DEFAULT_PLATFORM = "web"


class PlatformMiddleware(BaseHTTPMiddleware):
    """
    Extracts platform context from request headers and stores on request.state.

    Usage in routes:
        platform = request.state.platform  # "web" | "ios" | "android" | "api"
        app_version = request.state.app_version  # "1.2.3" or None
        device_id = request.state.device_id  # UUID or None
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        # Parse X-Platform header (default: "web")
        raw_platform = request.headers.get("X-Platform", DEFAULT_PLATFORM).lower().strip()
        platform = raw_platform if raw_platform in VALID_PLATFORMS else DEFAULT_PLATFORM

        # Store on request.state for route access
        request.state.platform = platform
        request.state.app_version = request.headers.get("X-App-Version")
        request.state.device_id = request.headers.get("X-Device-Id")
        request.state.locale = request.headers.get("Accept-Language", "en")

        response = await call_next(request)

        # Echo platform in response (useful for debugging)
        response.headers["X-Platform"] = platform

        return response
