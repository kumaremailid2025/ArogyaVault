"""
In-memory store for development.
Replace with PostgreSQL once infrastructure is ready.

NOTE: Refresh token sessions are now in Redis (see app/core/redis.py).
Only user data, OTPs, invites, and community data remain in-memory.

PHONE SECURITY (industry standard — matches HIPAA / banking practices):
  - NO plaintext phone numbers anywhere in the store
  - HMAC-SHA256 hash as dict key for O(1) lookups (irreversible)
  - AES-256-GCM encrypted phone stored inside user record (recoverable only by app)
  - Masked phone (+91****5592) for display in API responses
  - Even a database engineer / backend developer with full DB access
    cannot see any real phone number — only hashes and ciphertext
"""

import uuid
import re
from datetime import datetime, timedelta, timezone

from app.core.crypto import encrypt_phone, mask_phone, phone_hash


# ══════════════════════════════════════════════════════════════════════════════
#  REGISTERED USERS
# ══════════════════════════════════════════════════════════════════════════════
#
#  Key:   HMAC-SHA256 hash of the phone (deterministic, irreversible)
#  Value: user dict with phone_encrypted (AES-256-GCM) and phone_masked
#
#  What someone with DB access sees:
#    key   = "a4f8c2...e91b"  (64-char hex hash — cannot reverse to phone)
#    phone_encrypted = "nonce+ciphertext base64"  (cannot decrypt without app key)
#    phone_masked    = "+91****5592"  (safe for display, no full number)
#
#  To check if a phone is registered:
#    hash the incoming phone → look up in dict → found = registered
#
#  To get the real phone (e.g. for SMS gateway):
#    decrypt(phone_encrypted) → "+919248255592"  (only the running app can do this)
# ══════════════════════════════════════════════════════════════════════════════

_SEED_USERS = [
    {
        "id": "usr_001",
        "phone": "+919248255592",
        "name": "Kumar",
        "initials": "KU",
        "role": "patient",
        "location": "Hyderabad",
        "created_at": "2025-01-15T10:30:00Z",
    },
    {
        "id": "usr_002",
        "phone": "+919177111831",
        "name": "Ayyappa",
        "initials": "AY",
        "role": "doctor",
        "location": "Chennai",
        "created_at": "2025-02-20T14:00:00Z",
    },
    {
        "id": "usr_003",
        "phone": "+919010238712",
        "name": "Yuvanth",
        "initials": "YU",
        "role": "patient",
        "location": "Bangalore",
        "created_at": "2025-03-10T09:15:00Z",
    },
]


def _build_user_stores() -> tuple[dict[str, dict], dict[str, dict]]:
    """
    Build REGISTERED_USERS (keyed by phone hash) and USERS_BY_ID from seed data.

    Each user record stores:
      - phone_hash:      HMAC-SHA256 of the plaintext phone (same as dict key)
      - phone_encrypted: AES-256-GCM ciphertext (only the app can decrypt)
      - phone_masked:    "+91****5592" for safe display
      - phone:           REMOVED — no plaintext phone in storage

    The plaintext phone is used only during this seed function and is
    never persisted. In production, user registration encrypts on write
    and the plaintext is immediately discarded.
    """
    by_hash: dict[str, dict] = {}
    by_id: dict[str, dict] = {}

    for seed in _SEED_USERS:
        raw_phone = seed["phone"]
        ph = phone_hash(raw_phone)

        user = {
            "id": seed["id"],
            "phone_hash": ph,
            "phone_encrypted": encrypt_phone(raw_phone),
            "phone_masked": mask_phone(raw_phone),
            "name": seed["name"],
            "initials": seed["initials"],
            "role": seed["role"],
            "location": seed.get("location", ""),
            "created_at": seed["created_at"],
        }

        by_hash[ph] = user
        by_id[seed["id"]] = user

    return by_hash, by_id


# phone_hash → user dict  (NO plaintext phones anywhere)
REGISTERED_USERS: dict[str, dict]
USERS_BY_ID: dict[str, dict]
REGISTERED_USERS, USERS_BY_ID = _build_user_stores()


def lookup_user_by_phone(phone: str) -> dict | None:
    """
    Look up a user by their plaintext phone.

    Hashes the input, then checks REGISTERED_USERS. Returns the user
    dict if found, None otherwise. The plaintext phone is never stored
    — only the caller has it (from the HTTP request body).
    """
    ph = phone_hash(phone)
    return REGISTERED_USERS.get(ph)


def is_phone_registered(phone: str) -> bool:
    """Check if a phone is registered (hash-based, no plaintext lookup)."""
    return phone_hash(phone) in REGISTERED_USERS

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
# phone_hash → { code, created_at, attempts }
# Keyed by HMAC hash — even OTP entries don't store plaintext phones.
OTP_STORE: dict[str, dict] = {}

# Re-export OTP codes from centralised constants for backward compatibility
from app.core.constants import SEND_OTP_CODE, RESEND_OTP_CODE  # noqa: E402, F401

# ── Invite Store (legacy — kept for auth/send-invite compat) ─────────────────
# phone_hash → { invited_by, created_at }
INVITE_STORE: dict[str, dict] = {}

# ── Invite Registry (new — encrypted phone, full lifecycle) ──────────────────
# invite_id → full invite record
# Phone numbers are stored encrypted (AES-256-GCM). See app/core/crypto.py.
INVITE_REGISTRY: dict[str, dict] = {}

# ── Invite Phone Index ──────────────────────────────────────────────────────
# phone_hash (HMAC-SHA256) → list[invite_id]
# Enables O(1) dedup lookups without decrypting stored phones.
INVITE_PHONE_INDEX: dict[str, list[str]] = {}


def _seed_invites() -> None:
    """
    Seed invite records for the existing linked groups.

    These invites are pre-seeded as "accepted" with group_id pointing
    to the existing linked groups. Phone numbers are encrypted at seed time.
    """
    from app.core.crypto import encrypt_phone, mask_phone, phone_hash
    from app.api.schemas.invite import (
        InviteStatus,
        InviterOut,
    )

    seed_data = [
        {
            "id": "inv_ravi_001",
            "inviter_id": "usr_001",
            "invitee_phone": "+919876500001",
            "invitee_name": "Ravi Kumar",
            "relation": "Family Member",
            "access_scope": "App Access",
            "status": InviteStatus.ACCEPTED,
            "message": "Hi Ravi, sharing health records for family coordination.",
            "group_id": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
            "created_at": "2025-12-01T10:00:00+00:00",
            "accepted_at": "2025-12-01T12:30:00+00:00",
        },
        {
            "id": "inv_sharma_001",
            "inviter_id": "usr_002",
            "invitee_phone": "+919248255592",
            "invitee_name": "Kumar",
            "relation": "Doctor",
            "access_scope": "Group Access",
            "status": InviteStatus.ACCEPTED,
            "message": "Connecting for your post-op follow-up records.",
            "group_id": "a1b2c3d4-5e6f-7a8b-9c0d-e1f2a3b4c5d6",
            "created_at": "2025-11-15T09:00:00+00:00",
            "accepted_at": "2025-11-15T14:00:00+00:00",
        },
        {
            "id": "inv_priya_001",
            "inviter_id": "usr_001",
            "invitee_phone": "+919876500003",
            "invitee_name": "Priya Singh",
            "relation": "Caregiver",
            "access_scope": "App Access",
            "status": InviteStatus.ACCEPTED,
            "message": "Priya, adding you as caregiver for my father.",
            "group_id": "f9e8d7c6-5b4a-3210-fedc-ba9876543210",
            "created_at": "2025-10-20T08:00:00+00:00",
            "accepted_at": "2025-10-20T09:15:00+00:00",
        },
        {
            "id": "inv_pending_001",
            "inviter_id": "usr_001",
            "invitee_phone": "+919876500004",
            "invitee_name": "Dr. Patel",
            "relation": "Doctor",
            "access_scope": "Group Access",
            "status": InviteStatus.PENDING,
            "message": "Hi Dr. Patel, would like to share records for consultation.",
            "group_id": None,
            "created_at": "2026-03-25T10:00:00+00:00",
            "accepted_at": None,
        },
    ]

    inviter_info = {
        "usr_001": InviterOut(
            id="usr_001", name="Kumar", initials="KU",
            phone_masked="+91****5592",
        ),
        "usr_002": InviterOut(
            id="usr_002", name="Ayyappa", initials="AY",
            phone_masked="+91****1831",
        ),
    }

    for s in seed_data:
        phone = s["invitee_phone"]
        ph = phone_hash(phone)
        encrypted = encrypt_phone(phone)
        masked = mask_phone(phone)

        now_str = s["created_at"]
        exp_str = None
        if s["status"] == InviteStatus.PENDING:
            from datetime import datetime, timedelta, timezone
            created = datetime.fromisoformat(now_str)
            exp_str = (created + timedelta(days=30)).isoformat()

        record = {
            "id": s["id"],
            "inviter_id": s["inviter_id"],
            "inviter": inviter_info[s["inviter_id"]],
            "phone_encrypted": encrypted,
            "phone_hash": ph,
            "phone_masked": masked,
            "invitee_name": s["invitee_name"],
            "relation": s["relation"],
            "access_scope": s["access_scope"],
            "message": s["message"],
            "status": s["status"],
            "created_at": now_str,
            "updated_at": s["accepted_at"],
            "expires_at": exp_str,
            "accepted_at": s["accepted_at"],
            "rejected_at": None,
            "group_id": s["group_id"],
        }

        INVITE_REGISTRY[s["id"]] = record
        INVITE_PHONE_INDEX.setdefault(ph, []).append(s["id"])


# Run seed on module load (dev only — will be DB migrations in production)
_seed_invites()

# ── Refresh Token Store ─────────────────────────────────────────────────────
# MOVED TO REDIS — see app/core/redis.py → session_manager
# Sessions are stored as: session:{jti} → { user_id, phone, created_at }
# with automatic TTL-based expiry.


# ══════════════════════════════════════════════════════════════════════════════
#  COMMUNITY DATA — posts, files, members (in-memory, mirrors FE mock data)
# ══════════════════════════════════════════════════════════════════════════════

# ── Community Posts ──────────────────────────────────────────────────────────
# group_id → list of post dicts
_COMMUNITY_GROUP_ID = "b3a1f5d2-7e4c-4a8b-9f6e-1c2d3e4f5a6b"

COMMUNITY_POSTS: dict[str, list[dict]] = {
    _COMMUNITY_GROUP_ID: [
        {
            "id": 0,
            "group_id": _COMMUNITY_GROUP_ID,
            "author": "Meena R.",
            "initials": "MR",
            "location": "Chennai",
            "time": "2 hours ago",
            "text": "My father's HbA1c just came down to 6.8% from 8.1% in 3 months — Metformin + diet changes. Anyone else seen similar results?",
            "likes": 14, "replyCount": 3, "tag": "Diabetes",
            "replies": [
                {"id": 1, "initials": "SK", "author": "Suresh K.", "time": "1 hr ago", "text": "Excellent! Low GI foods + regular walks made a similar difference for my wife. Keep it consistent."},
                {"id": 2, "initials": "AP", "author": "Ananya P.", "time": "1.5 hrs ago", "text": "Metformin + portion control — 7.2% to 6.5% in 4 months for my mother. It works!"},
                {"id": 3, "initials": "RV", "author": "Rahul V.", "time": "45 min ago", "text": "Is he exercising too? 30-min daily walks combined with meds made a huge difference for us."},
            ],
        },
        {
            "id": 1,
            "group_id": _COMMUNITY_GROUP_ID,
            "author": "Suresh K.",
            "initials": "SK",
            "location": "Mumbai",
            "time": "5 hours ago",
            "text": "Has anyone shared records with a cardiologist abroad using ArogyaVault? How does group sharing work for international remote consultations?",
            "likes": 8, "replyCount": 2, "tag": "Groups",
            "replies": [
                {"id": 1, "initials": "MR", "author": "Meena R.", "time": "4 hrs ago", "text": "Yes! Shared a group with a Singapore cardiologist — read-only access, works perfectly."},
                {"id": 2, "initials": "AP", "author": "Ananya P.", "time": "3 hrs ago", "text": "The AI Summary PDF is especially useful for international consultants needing a quick overview."},
            ],
        },
        {
            "id": 2,
            "group_id": _COMMUNITY_GROUP_ID,
            "author": "Ananya P.",
            "initials": "AP",
            "location": "Hyderabad",
            "time": "Yesterday",
            "text": "Reminder: the AI Health Summary is incredibly useful for new specialists. My oncologist was impressed with the structured format. Hit 'Export' in ArogyaAI.",
            "likes": 31, "replyCount": 2, "tag": "Tip",
            "replies": [
                {"id": 1, "initials": "SK", "author": "Suresh K.", "time": "Yesterday", "text": "Seconded! Saved 20 minutes of explanation at my last cardiology appointment."},
                {"id": 2, "initials": "PR", "author": "Prabhav R.", "time": "Yesterday", "text": "Does it include imaging reports? My MRI is uploaded but not sure AI reads those."},
            ],
        },
        {
            "id": 3,
            "group_id": _COMMUNITY_GROUP_ID,
            "author": "Divya M.",
            "initials": "DM",
            "location": "Bangalore",
            "time": "2 days ago",
            "text": "Iron deficiency tip: if CBC shows low Hb, ask your doctor about liquid iron vs. tablets. Liquid absorbs much faster for moderate anaemia cases.",
            "likes": 19, "replyCount": 4, "tag": "Nutrition",
            "replies": [
                {"id": 1, "initials": "MR", "author": "Meena R.", "time": "2 days ago", "text": "My mother switched to liquid iron — Hb went from 9.1 to 11.3 g/dL in 6 weeks."},
                {"id": 2, "initials": "SK", "author": "Suresh K.", "time": "2 days ago", "text": "IV iron is even faster for severe deficiency. ArogyaVault's trend tracking is great for this."},
                {"id": 3, "initials": "AP", "author": "Ananya P.", "time": "2 days ago", "text": "Liquid iron + Vitamin C together boosts absorption. Always confirm with your doctor."},
                {"id": 4, "initials": "RV", "author": "Rahul V.", "time": "2 days ago", "text": "Bookmarked. My sister's Hb is 9.8 — will share this with her doctor."},
            ],
        },
    ],
}

# ── Invited Group Posts ───────────────────────────────────────────────────────
_RAVI_GROUP_ID = "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a"
_SHARMA_GROUP_ID = "a1b2c3d4-5e6f-7a8b-9c0d-e1f2a3b4c5d6"
_PRIYA_GROUP_ID = "f9e8d7c6-5b4a-3210-fedc-ba9876543210"

COMMUNITY_POSTS[_RAVI_GROUP_ID] = [
    {
        "id": 0, "group_id": _RAVI_GROUP_ID,
        "author_id": "usr_ravi", "author": "Ravi Kumar", "initials": "RK",
        "location": "Hyderabad", "time": "1 hour ago", "tag": "Lab Report",
        "text": "Just uploaded my latest CBC report. Let me know if anything looks off — flagging it here so you can check too.",
        "likes": 2, "replyCount": 1,
        "replies": [
            {"id": 1, "author_id": "usr_001", "initials": "KU", "author": "Kumar", "time": "45 min ago",
             "text": "Checked it — Haemoglobin is at 11.2 g/dL, mildly low again. Let's get you back on the iron supplements and retest in 4 weeks."},
        ],
    },
    {
        "id": 1, "group_id": _RAVI_GROUP_ID,
        "author_id": "usr_001", "author": "You", "initials": "KU",
        "location": "Hyderabad", "time": "Yesterday", "tag": "Reminder",
        "text": "Ravi, your Haemoglobin was 11.2 g/dL last time — mildly low. Please make sure you're taking the iron supplements daily.",
        "likes": 0, "replyCount": 0, "replies": [],
    },
    {
        "id": 2, "group_id": _RAVI_GROUP_ID,
        "author_id": "usr_ravi", "author": "Ravi Kumar", "initials": "RK",
        "location": "Hyderabad", "time": "3 days ago", "tag": "Follow-up",
        "text": "Doctor suggested we get a thyroid panel done this month. Will upload once the report comes in.",
        "likes": 1, "replyCount": 1,
        "replies": [
            {"id": 2, "author_id": "usr_001", "initials": "KU", "author": "Kumar", "time": "3 days ago",
             "text": "Good idea. Let me know once it's done — I'll add it to your health timeline and flag anything outside normal range."},
        ],
    },
]

COMMUNITY_POSTS[_SHARMA_GROUP_ID] = [
    {
        "id": 0, "group_id": _SHARMA_GROUP_ID,
        "author_id": "usr_sharma", "author": "Dr. Sharma's Clinic", "initials": "DS",
        "location": "Mumbai", "time": "2 hours ago", "tag": "Post-op",
        "text": "Your post-operative report has been reviewed. Healing is on track. Please continue the prescribed antibiotics for the full course.",
        "likes": 0, "replyCount": 1,
        "replies": [
            {"id": 1, "author_id": "usr_001", "initials": "KU", "author": "Kumar", "time": "1 hour ago",
             "text": "Thank you, Doctor. Noted — I'll complete the full antibiotic course and monitor for any swelling or fever."},
        ],
    },
    {
        "id": 1, "group_id": _SHARMA_GROUP_ID,
        "author_id": "usr_001", "author": "You", "initials": "KU",
        "location": "Hyderabad", "time": "Yesterday", "tag": "Update",
        "text": "Doctor, I've uploaded the wound photos as requested. Please review at your earliest convenience.",
        "likes": 0, "replyCount": 0, "replies": [],
    },
    {
        "id": 2, "group_id": _SHARMA_GROUP_ID,
        "author_id": "usr_sharma", "author": "Dr. Sharma's Clinic", "initials": "DS",
        "location": "Mumbai", "time": "4 days ago", "tag": "Discharge",
        "text": "Discharge summary has been added to your group. Please review the follow-up schedule — next visit in 2 weeks.",
        "likes": 0, "replyCount": 1,
        "replies": [
            {"id": 2, "author_id": "usr_001", "initials": "KU", "author": "Kumar", "time": "4 days ago",
             "text": "Reviewed — follow-up booked for 13 April. I've also shared the discharge summary with my caregiver Priya for reference."},
        ],
    },
]

COMMUNITY_POSTS[_PRIYA_GROUP_ID] = [
    {
        "id": 0, "group_id": _PRIYA_GROUP_ID,
        "author_id": "usr_priya", "author": "Priya Singh", "initials": "PS",
        "location": "Delhi", "time": "3 hours ago", "tag": "Medication",
        "text": "I've been tracking your father's medication schedule — he missed the evening Metformin dose twice this week. Want me to set up reminders?",
        "likes": 1, "replyCount": 1,
        "replies": [
            {"id": 1, "author_id": "usr_001", "initials": "KU", "author": "Kumar", "time": "2 hours ago",
             "text": "Yes please — reminders would be really helpful. Also, can you check if his BP medication needs refilling this week?"},
        ],
    },
    {
        "id": 1, "group_id": _PRIYA_GROUP_ID,
        "author_id": "usr_001", "author": "You", "initials": "KU",
        "location": "Hyderabad", "time": "2 days ago", "tag": "Care Plan",
        "text": "Priya, I've updated the care plan with the new physiotherapy schedule. Please make sure he does the exercises after lunch.",
        "likes": 0, "replyCount": 1,
        "replies": [
            {"id": 2, "author_id": "usr_priya", "initials": "PS", "author": "Priya Singh", "time": "2 days ago",
             "text": "Got it — I'll ensure he does the exercises daily. Should I also log his BP readings every evening?"},
        ],
    },
    {
        "id": 2, "group_id": _PRIYA_GROUP_ID,
        "author_id": "usr_priya", "author": "Priya Singh", "initials": "PS",
        "location": "Delhi", "time": "5 days ago", "tag": "Vitals",
        "text": "Today's vitals: BP 138/86, Sugar (fasting) 142 mg/dL, Temperature 98.4°F. Slightly elevated BP and sugar — should we flag this with Dr. Sharma?",
        "likes": 2, "replyCount": 1,
        "replies": [
            {"id": 3, "author_id": "usr_001", "initials": "KU", "author": "Kumar", "time": "5 days ago",
             "text": "Yes, please share this with Dr. Sharma's group. The fasting sugar has been creeping up — might need a dosage adjustment."},
        ],
    },
]

# ── Post next ID counter (per group) ────────────────────────────────────────
POST_NEXT_ID: dict[str, int] = {
    _COMMUNITY_GROUP_ID: 4,
    _RAVI_GROUP_ID: 3,
    _SHARMA_GROUP_ID: 3,
    _PRIYA_GROUP_ID: 3,
}
REPLY_NEXT_ID: int = 100

# ── Likes ────────────────────────────────────────────────────────────────────
# set of (group_id, post_id, user_id)
POST_LIKES: set[tuple[str, int, str]] = set()

# ── Post Summaries & AI Responses ────────────────────────────────────────────
POST_SUMMARIES: dict[int, str] = {
    0: "Community strongly agrees: Metformin + low-GI diet + daily 30-minute walks produces meaningful HbA1c drops within 3–4 months. Multiple members reported drops from the 7–8% range to 6.5–6.8%. Consistency with both medication and lifestyle is the critical factor.",
    1: "International group sharing works seamlessly with read-only access for specialists. The AI Summary PDF is particularly valued — it gives unfamiliar doctors structured context quickly, reducing lengthy verbal explanations at appointments.",
    2: "Strong consensus that the AI Health Summary export saves 15–20 minutes per specialist visit. One open community question: whether uploaded MRI/imaging reports are fully parsed and included in the AI-generated summary.",
    3: "Liquid iron absorbs significantly faster than tablets for moderate anaemia — one member reported Hb rising from 9.1 to 11.3 g/dL in just 6 weeks. Combining liquid iron with Vitamin C boosts absorption further. IV iron is preferred for severe deficiency.",
}

POST_AI_RESPONSES: dict[int, str] = {
    0: "Metformin + lifestyle changes (low-GI diet + 150 min/week moderate exercise) reduces HbA1c by 1–2% on average per clinical data. A 1.3% drop in 3 months is excellent. Sustaining daily walks alongside medication adherence is the key to long-term results.",
    1: "ArogyaVault supports read-only group access for international specialists. The AI Summary PDF export is strongly recommended — it condenses medications, diagnoses, and recent lab trends into a single structured document any doctor can quickly review.",
    2: "The AI Export includes all uploaded documents. Imaging reports (MRIs, X-rays) are processed if uploaded as PDFs with embedded text — the AI extracts and summarises key findings. Pure image-only scans without accompanying report text may not be fully analysed.",
    3: "Liquid ferrous sulfate has ~40% higher bioavailability than tablets due to faster dissolution. Taking it alongside 500mg Vitamin C significantly enhances non-haem iron absorption. Avoid tea, coffee, or dairy within 2 hours of dosing as tannins and calcium inhibit absorption.",
}

# ── Community Files ──────────────────────────────────────────────────────────
# group_id → list of file dicts
FILE_NEXT_ID: int = 100
QA_NEXT_ID: int = 100

COMMUNITY_FILES: dict[str, list[dict]] = {
    _COMMUNITY_GROUP_ID: [
        {
            "id": 1, "group_id": _COMMUNITY_GROUP_ID,
            "name": "Community Health Guidelines 2026.pdf", "type": "pdf", "size": "2.4 MB",
            "uploadedBy": "Ananya P.", "uploadedByInitials": "AP", "uploadedAt": "Mar 28, 2026",
            "category": "Guidelines", "qaCount": 2,
            "aiSummary": "Comprehensive community health guidelines covering preventive care schedules, vaccination timelines for adults and seniors, chronic disease management best practices, and emergency contact protocols.",
            "questions": [
                {"id": 1, "question": "Does this cover vaccination schedules for seniors above 65?", "askedBy": "Meena R.", "askedByInitials": "MR", "askedAt": "Mar 29, 2026", "answer": "Yes — Section 3.2 covers the full adult immunisation schedule including Pneumococcal, Influenza (annual), Shingles (Zoster), and Tdap boosters specifically recommended for adults aged 65 and above."},
                {"id": 2, "question": "Are the emergency contact numbers region-specific?", "askedBy": "Suresh K.", "askedByInitials": "SK", "askedAt": "Mar 30, 2026", "answer": "Yes. Appendix B lists emergency helplines, nearest government hospitals, and ambulance services organised by state and city for 12 major metros in India."},
            ],
        },
        {
            "id": 2, "group_id": _COMMUNITY_GROUP_ID,
            "name": "CBC Report — Meena R.xlsx", "type": "xlsx", "size": "156 KB",
            "uploadedBy": "Meena R.", "uploadedByInitials": "MR", "uploadedAt": "Mar 25, 2026",
            "category": "Lab Report", "qaCount": 1,
            "aiSummary": "Complete Blood Count report showing haemoglobin at 11.8 g/dL (normal range), WBC within normal limits, and platelet count slightly elevated at 420K. Overall healthy profile with minor iron markers to watch.",
            "questions": [
                {"id": 3, "question": "Is the platelet count concerning?", "askedBy": "Kumar", "askedByInitials": "KU", "askedAt": "Mar 26, 2026", "answer": "A platelet count of 420K is mildly elevated but generally not concerning unless persistent. Reactive thrombocytosis (e.g. from iron deficiency, infection, or inflammation) is the most common cause. Follow-up CBC in 3 months recommended."},
            ],
        },
        {
            "id": 3, "group_id": _COMMUNITY_GROUP_ID,
            "name": "Diet Plan — Diabetic.pdf", "type": "pdf", "size": "890 KB",
            "uploadedBy": "Dr. Anjali Mehta", "uploadedByInitials": "AM", "uploadedAt": "Mar 20, 2026",
            "category": "Nutrition", "qaCount": 0,
            "aiSummary": "Structured meal plan for Type 2 diabetic patients emphasising low-GI foods, portion control, and balanced macronutrients. Includes regional Indian alternatives and meal timing recommendations.",
            "questions": [],
        },
        {
            "id": 4, "group_id": _COMMUNITY_GROUP_ID,
            "name": "Prescription — Metformin 500mg.pdf", "type": "pdf", "size": "120 KB",
            "uploadedBy": "Suresh K.", "uploadedByInitials": "SK", "uploadedAt": "Mar 18, 2026",
            "category": "Prescription", "qaCount": 0,
            "aiSummary": "Prescription for Metformin 500mg twice daily with meals for HbA1c management. Includes contraindications, monitoring schedule, and expected timeline for results.",
            "questions": [],
        },
    ],
}

# ── Community Members ────────────────────────────────────────────────────────
# group_id → list of member dicts
COMMUNITY_MEMBERS: dict[str, list[dict]] = {
    _COMMUNITY_GROUP_ID: [
        {
            "id": 1, "name": "Dr. Anjali Mehta", "initials": "AM", "role": "Moderator",
            "status": "online", "statusLabel": "Active now", "joinedAt": "Jan 2024", "location": "Delhi",
            "stats": {"posts": 48, "replies": 215, "uploads": 12, "questions": 6, "likes": 340},
            "activities": [
                {"id": 1, "type": "reply", "time": "20 min ago", "text": "Great improvement on HbA1c! Consistency with diet + medication is key.", "context": "Replied to Meena R.'s post", "tag": "Diabetes"},
                {"id": 2, "type": "upload", "time": "2 hours ago", "text": "Community Health Guidelines 2026.pdf", "context": "Uploaded to Community Files", "tag": "Guidelines"},
                {"id": 3, "type": "post", "time": "Yesterday", "text": "Reminder: Annual health check-ups are essential even if you feel healthy.", "tag": "Wellness"},
            ],
        },
        {
            "id": 2, "name": "Meena R.", "initials": "MR", "role": "Member",
            "status": "online", "statusLabel": "Active now", "joinedAt": "Mar 2024", "location": "Chennai",
            "stats": {"posts": 22, "replies": 87, "uploads": 5, "questions": 14, "likes": 156},
            "activities": [
                {"id": 1, "type": "post", "time": "2 hours ago", "text": "My father's HbA1c just came down to 6.8% from 8.1% in 3 months.", "tag": "Diabetes"},
                {"id": 2, "type": "question", "time": "Yesterday", "text": "Does this cover vaccination schedules for seniors above 65?", "context": "Asked on Community Health Guidelines 2026.pdf", "tag": "Guidelines"},
            ],
        },
        {
            "id": 3, "name": "Suresh K.", "initials": "SK", "role": "Member",
            "status": "recently", "statusLabel": "30 min ago", "joinedAt": "Apr 2024", "location": "Mumbai",
            "stats": {"posts": 15, "replies": 64, "uploads": 3, "questions": 8, "likes": 187},
            "activities": [
                {"id": 1, "type": "post", "time": "5 hours ago", "text": "Has anyone shared records with a cardiologist abroad?", "tag": "Groups"},
                {"id": 2, "type": "reply", "time": "Yesterday", "text": "Seconded! Saved 20 minutes of explanation at my last appointment.", "context": "Replied to Ananya P.'s post", "tag": "Tip"},
            ],
        },
        {
            "id": 4, "name": "Ananya P.", "initials": "AP", "role": "Health Expert",
            "status": "recently", "statusLabel": "1 hour ago", "joinedAt": "Feb 2024", "location": "Hyderabad",
            "stats": {"posts": 34, "replies": 156, "uploads": 8, "questions": 22, "likes": 203},
            "activities": [
                {"id": 1, "type": "post", "time": "Yesterday", "text": "Reminder: the AI Health Summary is incredibly useful for new specialists.", "tag": "Tip"},
                {"id": 2, "type": "upload", "time": "2 days ago", "text": "Community Health Guidelines 2026.pdf", "context": "Uploaded to Community Files", "tag": "Guidelines"},
            ],
        },
        {
            "id": 5, "name": "Divya M.", "initials": "DM", "role": "Member",
            "status": "offline", "statusLabel": "2 days ago", "joinedAt": "Jun 2024", "location": "Bangalore",
            "stats": {"posts": 8, "replies": 42, "uploads": 2, "questions": 5, "likes": 89},
            "activities": [
                {"id": 1, "type": "post", "time": "2 days ago", "text": "Iron deficiency tip: liquid iron vs. tablets.", "tag": "Nutrition"},
            ],
        },
    ],
}


# ══════════════════════════════════════════════════════════════════════════════
#  VAULT DATA — favorites, likes, replies, activity, tags (in-memory)
# ══════════════════════════════════════════════════════════════════════════════

def _tag_to_slug(tag: str) -> str:
    """Convert a tag label to a URL-safe slug (mirrors FE tagToSlug)."""
    return re.sub(r"[^a-z0-9]+", "-", tag.lower()).strip("-")


def _post_snapshot(post: dict) -> dict:
    """Extract a lightweight snapshot from a full post dict."""
    return {
        "id": post["id"],
        "group_id": post["group_id"],
        "author": post["author"],
        "initials": post["initials"],
        "location": post["location"],
        "time": post["time"],
        "text": post["text"],
        "likes": post.get("likes", 0),
        "replyCount": len(post.get("replies", [])),
        "tag": post.get("tag", ""),
    }


# Helper: reference to community posts for seeding
_ALL_COMMUNITY_POSTS = COMMUNITY_POSTS.get(_COMMUNITY_GROUP_ID, [])

# ── User Favorites ──────────────────────────────────────────────────────────
# user_id → { post_id → FavoriteEntry dict }
_now = datetime.now(timezone.utc)

USER_FAVORITES: dict[str, dict[int, dict]] = {
    "usr_001": {
        0: {
            "uuid": str(uuid.uuid4()),
            "type_code": "POST",
            "entity_id": 0,
            "favorited_at": (_now - timedelta(hours=2)).isoformat(),
            "post": _post_snapshot(_ALL_COMMUNITY_POSTS[0]),
        },
        2: {
            "uuid": str(uuid.uuid4()),
            "type_code": "POST",
            "entity_id": 2,
            "favorited_at": (_now - timedelta(hours=5)).isoformat(),
            "post": _post_snapshot(_ALL_COMMUNITY_POSTS[2]),
        },
    },
}

# ── User Likes ──────────────────────────────────────────────────────────────
# user_id → { post_id → LikeEntry dict }
USER_LIKES: dict[str, dict[int, dict]] = {
    "usr_001": {
        0: {
            "uuid": str(uuid.uuid4()),
            "type_code": "POST",
            "entity_id": 0,
            "liked_at": (_now - timedelta(hours=1)).isoformat(),
            "post": _post_snapshot(_ALL_COMMUNITY_POSTS[0]),
        },
        3: {
            "uuid": str(uuid.uuid4()),
            "type_code": "POST",
            "entity_id": 3,
            "liked_at": (_now - timedelta(hours=3)).isoformat(),
            "post": _post_snapshot(_ALL_COMMUNITY_POSTS[3]),
        },
    },
}

# ── User Replied ────────────────────────────────────────────────────────────
# user_id → { post_id → RepliedEntry dict }
USER_REPLIED: dict[str, dict[int, dict]] = {
    "usr_001": {},
}

# ── User Activities ─────────────────────────────────────────────────────────
# user_id → list[ActivityRecord dict]  (newest first)
USER_ACTIVITIES: dict[str, list[dict]] = {
    "usr_001": [
        {
            "id": str(uuid.uuid4()),
            "type_code": "POST",
            "action_code": "FAVORITE",
            "entity_id": 0,
            "datetime": (_now - timedelta(hours=2)).isoformat(),
            "user_id": "usr_001",
            "group_id": _COMMUNITY_GROUP_ID,
            "description": "Favorited post by Meena R.",
            "meta": {"postText": _ALL_COMMUNITY_POSTS[0]["text"][:100]},
        },
        {
            "id": str(uuid.uuid4()),
            "type_code": "POST",
            "action_code": "LIKE",
            "entity_id": 0,
            "datetime": (_now - timedelta(hours=1)).isoformat(),
            "user_id": "usr_001",
            "group_id": _COMMUNITY_GROUP_ID,
            "description": "Liked post by Meena R.",
            "meta": None,
        },
        {
            "id": str(uuid.uuid4()),
            "type_code": "POST",
            "action_code": "FAVORITE",
            "entity_id": 2,
            "datetime": (_now - timedelta(hours=5)).isoformat(),
            "user_id": "usr_001",
            "group_id": _COMMUNITY_GROUP_ID,
            "description": "Favorited post by Ananya P.",
            "meta": {"postText": _ALL_COMMUNITY_POSTS[2]["text"][:100]},
        },
        {
            "id": str(uuid.uuid4()),
            "type_code": "POST",
            "action_code": "LIKE",
            "entity_id": 3,
            "datetime": (_now - timedelta(hours=3)).isoformat(),
            "user_id": "usr_001",
            "group_id": _COMMUNITY_GROUP_ID,
            "description": "Liked post by Divya M.",
            "meta": None,
        },
    ],
}

# ── Tags Index ──────────────────────────────────────────────────────────────
# Derived from all community posts; tag → list[post snapshot]
TAG_INDEX: dict[str, list[dict]] = {}
TAG_SLUG_MAP: dict[str, str] = {}  # slug → display label

for _post in _ALL_COMMUNITY_POSTS:
    _tag = _post.get("tag", "")
    if _tag:
        _slug = _tag_to_slug(_tag)
        TAG_SLUG_MAP[_slug] = _tag
        TAG_INDEX.setdefault(_tag, []).append(_post_snapshot(_post))
