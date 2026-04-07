"""
Centralised constants for ArogyaVault backend.

Avoids magic numbers scattered across route files.
Import from here instead of hardcoding page sizes, cookie names, etc.
"""

from __future__ import annotations

import re

# ══════════════════════════════════════════════════════════════════════════════
#  PAGINATION DEFAULTS
# ══════════════════════════════════════════════════════════════════════════════

WEB_PAGE_SIZE = 20
MOBILE_PAGE_SIZE = 10

WEB_FEED_LIMIT = 20
MOBILE_FEED_LIMIT = 10

# Activities use a bigger page size because entries are smaller
WEB_ACTIVITY_PAGE_SIZE = 50
MOBILE_ACTIVITY_PAGE_SIZE = 25


# ══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════════════════════════════════════

ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"

# Dev-only hardcoded OTP codes (replaced by SMS gateway in production)
SEND_OTP_CODE = "121212"
RESEND_OTP_CODE = "123123"


# ══════════════════════════════════════════════════════════════════════════════
#  PHONE VALIDATION
# ══════════════════════════════════════════════════════════════════════════════

PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")


# ══════════════════════════════════════════════════════════════════════════════
#  INVITE
# ══════════════════════════════════════════════════════════════════════════════

INVITE_EXPIRY_DAYS = 30
