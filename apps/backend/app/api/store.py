"""
In-memory store for development.
Replace with PostgreSQL once infrastructure is ready.

NOTE: Refresh token sessions are now in Redis (see app/core/redis.py).
Only user data, OTPs, invites, and community data remain in-memory.
"""

from datetime import datetime

# ── Registered Users (mock) ──────────────────────────────────────────────────
# phone → user dict
REGISTERED_USERS: dict[str, dict] = {
    "+919248255592": {
        "id": "usr_001",
        "phone": "+919248255592",
        "name": "Kumar",
        "initials": "KU",
        "role": "patient",
        "location": "Hyderabad",
        "created_at": "2025-01-15T10:30:00Z",
    },
    "+919177111831": {
        "id": "usr_002",
        "phone": "+919177111831",
        "name": "Ayyappa",
        "initials": "AY",
        "role": "doctor",
        "location": "Chennai",
        "created_at": "2025-02-20T14:00:00Z",
    },
     "+919010238712": {
        "id": "usr_003",
        "phone": "+919010238712",
        "name": "Yuvanth",
        "initials": "YU",
        "role": "patient",
        "location": "Bangalore",
        "created_at": "2025-03-10T09:15:00Z",
    },
}

# Lookup by id
USERS_BY_ID: dict[str, dict] = {u["id"]: u for u in REGISTERED_USERS.values()}

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

# ── Post next ID counter (per group) ────────────────────────────────────────
POST_NEXT_ID: dict[str, int] = {_COMMUNITY_GROUP_ID: 4}
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
