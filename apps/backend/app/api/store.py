"""
In-memory store for development.
Replace with PostgreSQL + Redis once infrastructure is ready.
"""

from datetime import datetime

# ── Registered Users (mock) ──────────────────────────────────────────────────
# phone → user dict
REGISTERED_USERS: dict[str, dict] = {
    "+919248255592": {
        "id": "usr_001",
        "phone": "+919248255592",
        "name": "Kumar",
        "role": "patient",
        "created_at": "2025-01-15T10:30:00Z",
    },
    "+919177111831": {
        "id": "usr_002",
        "phone": "+919177111831",
        "name": "Ayyappa",
        "role": "doctor",
        "created_at": "2025-02-20T14:00:00Z",
    },
     "+919010238712": {
        "id": "usr_003",
        "phone": "+919010238712",
        "name": "Yuvanth",
        "role": "patient",
        "created_at": "2025-03-10T09:15:00Z",
    },
}

# ── OTP Store ────────────────────────────────────────────────────────────────
# phone → { code, created_at, attempts }
OTP_STORE: dict[str, dict] = {}

# ── Invite Store ─────────────────────────────────────────────────────────────
# phone → { invited_by, created_at }
INVITE_STORE: dict[str, dict] = {}

# ── Hardcoded OTPs ───────────────────────────────────────────────────────────
SEND_OTP_CODE = "121212"
RESEND_OTP_CODE = "123123"
