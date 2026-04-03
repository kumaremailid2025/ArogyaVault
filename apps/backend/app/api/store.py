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

# ── Groups ────────────────────────────────────────────────────────────────────
# Stable UUIDs for dev — will be DB-generated in production.
# type: "system" = platform section, "linked" = user-linked group
GROUPS: dict[str, dict] = {
    "b3a1f5d2-7e4c-4a8b-9f6e-1c2d3e4f5a6b": {
        "id": "b3a1f5d2-7e4c-4a8b-9f6e-1c2d3e4f5a6b",
        "slug": "community",
        "name": "ArogyaCommunity",
        "type": "system",
        "description": "Public health discussions and community support",
    },
    "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a": {
        "id": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
        "slug": "ravi",
        "name": "Ravi Kumar",
        "type": "linked",
        "rel": "Family Member",
        "access": "App Access",
        "description": "Shared records with family member Ravi Kumar",
    },
    "a1b2c3d4-5e6f-7a8b-9c0d-e1f2a3b4c5d6": {
        "id": "a1b2c3d4-5e6f-7a8b-9c0d-e1f2a3b4c5d6",
        "slug": "sharma",
        "name": "Dr. Sharma's Clinic",
        "type": "linked",
        "rel": "Doctor",
        "access": "Group Access",
        "description": "Shared records with Dr. Sharma's Clinic",
    },
    "f9e8d7c6-5b4a-3210-fedc-ba9876543210": {
        "id": "f9e8d7c6-5b4a-3210-fedc-ba9876543210",
        "slug": "priya",
        "name": "Priya Singh",
        "type": "linked",
        "rel": "Caregiver",
        "access": "App Access",
        "description": "Shared records with caregiver Priya Singh",
    },
}

# Lookup helpers
GROUP_BY_SLUG: dict[str, dict] = {g["slug"]: g for g in GROUPS.values()}

# ── OTP Store ────────────────────────────────────────────────────────────────
# phone → { code, created_at, attempts }
OTP_STORE: dict[str, dict] = {}
SEND_OTP_CODE = "121212"
RESEND_OTP_CODE = "123123"

# ── Invite Store ─────────────────────────────────────────────────────────────
# phone → { invited_by, created_at }
INVITE_STORE: dict[str, dict] = {}

# ── Hardcoded OTPs ────────────────�