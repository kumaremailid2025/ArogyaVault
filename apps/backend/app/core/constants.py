"""
Centralised constants for ArogyaVault backend.

Avoids magic numbers scattered across route files.
Import from here instead of hardcoding page sizes, cookie names, etc.
"""

from __future__ import annotations

import re
import uuid

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

# Dev-only hardcoded OTP used by the invite modal flow. The real SMS gateway
# replaces this in production. Kept separate from the sign-in OTP codes above
# so QA can clearly tell which path is being exercised.
INVITE_REGISTER_OTP = "123456"


# ══════════════════════════════════════════════════════════════════════════════
#  SEED USER
# ══════════════════════════════════════════════════════════════════════════════

# Kumar's plaintext phone is only referenced here and in the seed builder.
# It's used to derive a deterministic UUID so the seed owner's id is stable
# across restarts and across deployments (same phone → same UUID).
SEED_OWNER_PHONE = "+919248255592"

# Deterministic UUID derived from Kumar's phone. Every user id in the system
# is a UUID; Kumar's happens to be derived from his number so it's
# reproducible in tests and local dev without hardcoding a magic constant.
#     uuid5(NAMESPACE_OID, "+919248255592") → 8541cc91-8663-51bf-869b-982dd31a0d12
SEED_OWNER_USER_ID = str(uuid.uuid5(uuid.NAMESPACE_OID, SEED_OWNER_PHONE))
