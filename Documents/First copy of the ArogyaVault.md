# ArogyaVault — Overview & Planning

---

## Basic Technologies to kick start the development

You need these set up before writing a single line of code.

**GitHub** — one repo for the monorepo. **AWS Account** — all infrastructure lives here: Cognito (auth), RDS PostgreSQL (database), S3 (file storage), SNS (SMS OTP + push notifications), EC2/ECS (backend hosting), CloudFront (CDN). **OpenAI** — API key for GPT-4o. **Vercel** — web deployment, connects directly to GitHub. **Android Studio** — Flutter mobile development and Android emulator. **Sentry** — error tracking.

---

## ArogyaVault App Overview

These represent the finalized approach defined prior to development.

---

### Authentication Flow

ArogyaVault uses **mobile phone number as the only identity**. There is no username, no password, and no email login at any point. The patient enters their phone number, receives a 6-digit OTP via SMS (AWS SNS), and is logged in. Doctors follow the same flow.

Once logged in, the user stays logged in. They are never asked to re-enter their phone number on every visit.

---

#### Mobile Auth Flow

**First time login:**
1. Patient opens the app → enters phone number
2. AWS Cognito triggers OTP via AWS SNS SMS
3. Patient enters 6-digit OTP → verified
4. AWS Cognito returns Access Token (15 min) + Refresh Token (30 days)
5. Both tokens stored securely in **Flutter Secure Storage** (iOS Keychain / Android Keystore — never in plain storage)
6. App prompts: "Set up a PIN or enable fingerprint for faster access"

**Every subsequent open:**
1. App checks for stored refresh token → still valid
2. Shows **PIN screen** or **biometric prompt** (fingerprint / Face ID)
3. Patient authenticates locally (PIN or biometric) — this never contacts the server
4. App silently uses the refresh token to get a new access token in the background
5. Patient lands on the dashboard instantly — no OTP, no waiting

**When OTP is required again:**
- Refresh token has expired (after 30 days of no use)
- Patient explicitly logs out
- Patient installs app on a new device
- Suspicious activity detected by Cognito

**PIN details:**
- 6-digit PIN set by the patient after first login
- PIN hash stored locally in Flutter Secure Storage — never sent to the server
- PIN is only used to unlock the locally stored refresh token
- Wrong PIN 5 times → app locks, forces phone OTP

**Biometric details:**
- Uses Flutter `local_auth` package (supports fingerprint, Face ID, and Android face unlock)
- Biometric auth only unlocks the locally stored refresh token — it does not replace server-side JWT auth
- Patient can switch between PIN and biometric in settings at any time

---

#### Web Auth Flow

**First time login:**
1. Patient visits the web portal → enters phone number
2. AWS Cognito sends OTP via SMS
3. Patient enters OTP → verified
4. Tokens stored as **httpOnly secure cookies** (not localStorage — not accessible to JavaScript, protected from XSS)
5. "Keep me signed in" is ON by default — cookie expiry set to 30 days

**Every subsequent visit:**
1. Browser sends the httpOnly cookie automatically
2. Server validates the refresh token → issues new access token silently
3. Patient lands on the dashboard — no re-login needed

**Session expiry:**
- If "Keep me signed in" is ON → stays logged in for 30 days from last activity
- If "Keep me signed in" is OFF → session cookie expires when browser closes
- Explicit logout → clears cookies and invalidates refresh token on AWS Cognito immediately

**What this means for the build:**
- `users` table has `phone` as the unique identifier — no `email` column, no `password_hash`
- AWS Cognito User Pool configured for phone-only auth — all other sign-in options disabled
- Web: `aws-amplify` JS SDK handles Cognito session and token refresh automatically
- Mobile: `amplify_flutter` package handles Cognito OTP, secure token storage, and refresh
- `local_auth` Flutter package handles PIN and biometric unlock
- Backend FastAPI: validates Cognito-issued JWTs using Cognito's public JWKS endpoint

---

### Registration & Onboarding

ArogyaVault has no separate "sign up" and "sign in" flows. Since the only identity is a mobile phone number, the first time a number is entered and OTP is verified, an account is created automatically. Every subsequent login uses the same OTP flow. This keeps onboarding frictionless — patients never fill out a registration form.

There are four entry points into ArogyaVault, all of which converge on the same phone OTP verification step.

---

#### Entry Point 1 — Invited by Another User

An existing patient or a clinic admin can invite someone by entering their mobile number directly inside the app or web portal. This is designed for families (a patient adding a family member) or a clinic onboarding a patient before their first visit.

**Flow:**
1. Existing user opens ArogyaVault → goes to "Invite" → enters the new person's mobile number
2. System sends an SMS to the invitee: "You've been invited to ArogyaVault. Your OTP is 847291. Open the app or visit arogyavault.com to get started."
3. Invitee enters their number + OTP on app or web → account created → lands on dashboard
4. Once the invitee's account is created, the app immediately prompts the invitor to define the relationship and form a group — see **Linking Flow & Groups** section below.

**What the backend does:** Generates an invite record with the inviter's `user_id`, the invitee's phone, an expiry timestamp (15 minutes), and a one-time invite token stored in Redis. The OTP is sent via AWS SNS. On verification, the invite record is consumed and the new user row is created. A pending link request is then created between the two users, awaiting relationship confirmation.

---

#### Entry Point 2 — Scan a QR Code

A QR code can be displayed at a clinic reception desk, on a doctor's table card, on a printed discharge summary, or shared digitally. Scanning it takes the new user directly to the ArogyaVault web app with context pre-filled.

**Flow:**
1. Clinic or doctor generates a QR code from ArogyaVault (contains a short invite URL with clinic context)
2. New user scans QR code with phone camera → browser opens the ArogyaVault web portal
3. Web portal shows: "Welcome to [Clinic Name] on ArogyaVault. Enter your mobile number to continue."
4. User enters mobile number → OTP received → verified → account created → linked to that clinic or doctor automatically
5. If the user already has an account → they are simply logged in and linked to the new clinic context

**What the backend does:** QR codes encode a URL like `arogyavault.com/join?ref=CLINIC_TOKEN`. The backend resolves the clinic token, stores the referral context in the session, and completes account creation with the clinic association after OTP is verified.

---

#### Entry Point 3 — Self-Registration via Website

A new user visits the ArogyaVault website directly with no invite or QR code. This is the standard public onboarding path.

**Flow:**
1. User visits `arogyavault.com` → clicks "Get Started" or "Sign In"
2. Enters mobile number → receives OTP → enters OTP → account created → lands on patient dashboard
3. Shown a brief onboarding prompt: name, date of birth, blood group (optional — skippable)
4. App tutorial shown on first dashboard visit

**What the backend does:** Standard AWS Cognito phone OTP flow. If the phone number is new to the `users` table, a new patient row is created with `role = patient`. No separate registration endpoint — same `/auth/verify-otp` endpoint handles both new and returning users.

---

#### Entry Point 4 — Download the App

New user downloads the Android APK or iOS app and opens it for the first time.

**Flow:**
1. User downloads the app from Play Store, App Store, or a direct APK link
2. App opens → shows "Enter your mobile number" screen
3. User enters mobile number → receives OTP → enters OTP → account created
4. App prompts: "Set up a PIN or enable fingerprint for faster access next time"
5. User lands on the patient dashboard — all subsequent opens use PIN or biometric, no OTP

**What the backend does:** Identical to website self-registration. `amplify_flutter` handles the Cognito OTP flow. On first successful login, the app stores tokens in Flutter Secure Storage and moves to the PIN/biometric setup screen.

---

#### How all four paths are the same underneath

All four entry points hit the same two backend endpoints:

| Step | Endpoint | What it does |
|---|---|---|
| 1 | `POST /auth/send-otp` | Triggers AWS Cognito → AWS SNS sends OTP SMS |
| 2 | `POST /auth/verify-otp` | Verifies OTP with Cognito → creates user if new → returns JWT |

The only difference between entry points is what additional context (invite token, clinic QR ref, or nothing) is passed alongside the OTP verification. The account creation logic is the same regardless of how the user arrived.

---

### Linking Flow & Groups

A Group in ArogyaVault is a trusted circle — a set of users who have explicitly accepted each other and been given scoped access to each other's health data. Groups are created through the linking flow, which begins immediately after an invite is accepted.

A group can be as small as two people (a patient and a family member) or as large as needed — any member can grow the group by inviting additional people at any time.

---

#### Step 1 — Define the Relationship (Invitor's side)

After the invitee's OTP is verified and their account is either created or confirmed as existing, the invitor is immediately shown a relationship selector screen:

> "How would you like to link with this person?"

| Relationship type | Typical use case |
|---|---|
| Family Member | Parent, spouse, child, sibling |
| Caregiver | Nurse, home attendant, support person |
| Friend | Trusted person outside the family |
| Patient | Used by doctors — linking a patient to their care |
| Custom | Freeform label set by the invitor |

The invitor selects the relationship type and taps **Send Link Request**.

---

#### Step 2A — Invitee is a New User (just registered via invite)

The invitee is already in the app after completing OTP. They are shown a confirmation screen immediately:

> "[Invitor Name] (+91 98765 43210) wants to link with you as **Family Member**."
> "By accepting, they will be able to view your shared health summaries."
>
> **[Accept]** &nbsp;&nbsp; **[Decline]**

To confirm acceptance, the invitee is asked to verify with their OTP one more time — this acts as an explicit consent step, not just a tap.

> "To confirm this link, enter the OTP sent to your number."

Once OTP is verified and accepted:
- A Group is created with both users as members
- The relationship type is stored on both sides (`user_A links user_B as Family Member`)
- Each user can independently set the access level they grant the other (see Access Levels below)
- Both users receive a confirmation: "You are now linked with [Name] on ArogyaVault."

---

#### Step 2B — Invitee is an Existing ArogyaVault User

The invitor enters a mobile number that already belongs to an existing ArogyaVault account. In this case no OTP is sent — the existing user receives a link request notification instead.

**What happens:**
1. System detects the phone number already exists in the `users` table
2. An in-app push notification is sent to the invitee: "[Invitor Name] wants to link with you on ArogyaVault as Family Member. Open the app to respond."
3. An SMS is also sent as a fallback: "Someone wants to link with you on ArogyaVault. Open the app to accept or decline."
4. Invitee opens the app → sees a pending link request card on their home screen
5. Invitee taps **Accept** → shown the relationship details and access level they are granting → confirms with OTP
6. Group is created, both users notified

Link requests expire after **48 hours** if not accepted. The invitor can cancel or resend at any time.

---

#### Step 3 — Growing the Group

Once a group exists, any member of that group can invite additional people. The group is not limited to two users.

**Flow for adding a new member to an existing group:**
1. Any group member opens the group → taps "Add Member" → enters a mobile number
2. System determines if the number is new or existing:
   - **New user** → sends invite SMS with OTP → after registration, shows the group join confirmation screen → OTP consent → added to group
   - **Existing user** → sends in-app notification + SMS with group context → user accepts via app → OTP consent → added to group
3. The invitor selects the relationship type and access level for the new member within this group
4. All existing group members receive a notification: "[New Member Name] has joined the group."

**Group invite link (optional):** The group admin can generate a short invite link or QR code for the group — `arogyavault.com/group/join?token=XYZ` — which can be shared via WhatsApp or any messaging app. Anyone who opens this link goes through OTP verification and lands directly in the group join screen.

---

#### What the backend stores

| Table | Key fields |
|---|---|
| `groups` | `id`, `name`, `created_by`, `created_at` |
| `group_members` | `group_id`, `viewer_user_id`, `data_owner_user_id`, `invited_by`, `relationship_type`, `permission_scope` (app / group), `can_read`, `can_upload`, `upload_requires_approval`, `status` (pending / accepted / declined), `joined_at` |
| `link_requests` | `id`, `from_user_id`, `to_phone`, `group_id`, `relationship_type`, `token`, `expires_at`, `status` |

The `group_members` table is directional — `viewer_user_id` is who is being granted access, `data_owner_user_id` is whose records are being accessed. The `permission_scope` field determines whether the viewer sees all records (`app`) or only group-tagged records (`group`). Every API call that returns patient records checks this table before returning any data. See **Group Permissions** section below for full details.

---

### Group Permissions

#### What a Group Is

A Group in ArogyaVault is a **logical access unit** — not a chat room or a shared feed. It is a container that defines who is allowed to see whose medical data, and under what conditions. Groups are most commonly used in clinical settings: a doctor's clinic has a group, the doctor and their receptionist are members, and patients who visit the clinic share their records with that group. Family and personal links also go through the same group structure but with a personal relationship type.

Groups do not create a shared data pool. Each person's records remain their own. A group only defines access — who can look at whose records, and what they can do.

---

#### Permission Model

Access in ArogyaVault operates at two levels: a **scope** that controls how broadly the viewer can see data, and **actions** that control what they can do within that scope. Both are set by the data owner when accepting a link.

Access is always **one-directional and explicit**. When User A invites User B, A is requesting to view B's records. B reading A's records requires a completely separate invitation the other way — there is no auto-mutual sharing.

---

#### Scope Level — App or Group

The scope is the first decision the data owner makes when accepting a link. It defines the breadth of what the viewer can see.

**App Level**

The viewer can see all medical documents the data owner has uploaded — past, present, and future — across the entire ArogyaVault account. This is a global view with no filtering. Suited for a trusted family member, a primary care doctor, or a caregiver who needs the full picture.

> "Allow [Name] to see all your medical records on ArogyaVault."

**Group Level**

The viewer's access is restricted to only the documents the data owner explicitly shares into that specific group. Documents uploaded by the patient that are not tagged to this group remain invisible to the viewer. Suited for a specialist clinic, a hospital department, or a situation where the patient wants to share only relevant documents (e.g., only cardiology records with a heart specialist's group).

> "Allow [Name] to see only the records you share with this group."

The data owner can share individual documents into a group at any time from the document detail screen — "Share to group → [Group Name]." A document can be shared into multiple groups simultaneously.

| Scope | What the viewer sees |
|---|---|
| App Level | Every document the patient has uploaded, past and future |
| Group Level | Only documents the patient has explicitly shared into this group |

---

#### Actions — Read and Upload

Within whichever scope is granted, the viewer has two possible actions:

**1. Read (default ON, always granted after acceptance)**

The viewer can read documents and AI summaries within their scope from the moment the link is accepted. This cannot be selectively turned off — either the link exists and the viewer can read within their scope, or the link is revoked entirely.

**2. Upload (default OFF, optional checkbox)**

The viewer can upload medical documents on behalf of the data owner. This is an opt-in checkbox shown to the data owner at the time of accepting the link:

> "Allow [Invitor Name] to upload documents to your records?"
> ☐ Yes, allow uploads &nbsp;&nbsp; *(unchecked by default)*

At **App Level**, uploads go directly into the patient's main record (subject to approval flow). At **Group Level**, uploads are tagged to that group and visible only within it until the patient explicitly promotes them to their main record.

This is intended for clinical use — a receptionist scanning and uploading a lab report for a patient, or a doctor uploading a discharge summary. The data owner can enable or disable upload permission at any time from their group settings.

---

#### Full Permission Matrix

| Scope | Read | Upload |
|---|---|---|
| App Level | All documents, past and future, across the entire account | Upload goes to patient's main record — approval required |
| Group Level | Only documents explicitly shared into this group | Upload is tagged to this group only — approval required to promote to main record |

---

#### Upload Approval Flow

Even when upload permission is granted, the data owner has final control over what enters their permanent record.

When the invitor uploads a document on behalf of the data owner:

1. Document is processed by the AI pipeline (OCR + extraction + summary + embedding) as normal
2. Document is stored in S3 and RDS, but with `status = pending_approval`
3. The data owner receives a push notification: "[Name] uploaded a document to your records — tap to review."
4. Data owner opens the document → sees the AI summary → taps **Accept** or **Reject**
5. If accepted → `status = approved`, document becomes part of their permanent record, visible in their dashboard
6. If rejected → document is soft-deleted, the uploader is notified, the data owner's records are unaffected

**Old documents (uploaded before the link was established):** These are immediately visible to the invitor as soon as the link is accepted — no per-document approval required. Approval is only for documents uploaded by the linked person after the link exists.

---

#### What the Data Owner Controls

The data owner (the person whose records are being accessed) has full control at all times. They can change settings for each linked person independently from the Group Settings screen.

| Setting | What it does |
|---|---|
| Revoke read access | Breaks the link entirely — the viewer can no longer see any records |
| Toggle upload permission | Enable or disable whether the viewer can upload documents on their behalf |
| Remove from group | Removes the person from the group; they lose all access immediately |
| View access log | See a log of every time the linked person accessed their records |

---

#### Group Types in Practice

| Group type | Who is in it | Typical use |
|---|---|---|
| Personal / Family | Patient + family members or friends | A parent monitoring a child's health, a spouse managing joint records |
| Clinical | Doctor + receptionist + nurse | Clinic staff accessing patient records during a visit |
| Hospital | Hospital admin + multiple doctors | Patient shared with a department for multi-specialist care |
| Self-managed | Patient only | No linking; patient manages their own records solo |

A patient can belong to multiple groups simultaneously — for example, their family group and their cardiologist's clinic group — and each group has its own independent permission settings.

---

### App Look & Feel

ArogyaVault has two distinct UI experiences depending on who is logged in — the **App Owner** (the patient whose health data it is) and a **Group Member** (someone who has been granted access). The layout shell — left nav, top upload bar, and bottom AI input — is persistent across all pages, but what appears inside those areas changes based on the user type.

---

#### Persistent Shell — Appears on Every Page

**Top — Upload Bar (App Owner only)**

A prominent upload action is pinned at the top of every screen for the App Owner. It is the first thing they see on every page — tapping it shows three options: take a photo with the camera, choose from gallery, or pick a file. This is never buried in a menu.

**Left Side Nav — Groups Panel**

The left navigation panel displays every group the user belongs to as a vertical list of tiles. Each tile shows:

- **Direction indicator** — a small icon on the left edge of the tile that immediately tells the user which way the data flows in this relationship:
  - **→ You invited** — you initiated this link, meaning you can see the other person's medical records. Shown as an outward arrow or eye-right icon.
  - **← They invited you** — the other person initiated this link, meaning they can see your medical records. Shown as an inward arrow or share-left icon.
  - **↔ Mutual** — both directions exist independently (each person invited the other). Both can see each other's records. Shown as a double-headed arrow.
- **Group name** — derived from the primary person in the relationship: e.g., "Dr. Sharma's Clinic", "Ravi (+3)", "Family (+2)"
- **Member count** — (+N) indicating total members beyond the primary name
- **Permission badge** — "App Access" or "Group Access", with a small upload icon if upload rights are active

**On tap — Group Detail Title Bar**

When a group tile is tapped, the Group Detail screen opens. At the very top, pinned as a subtitle under the group name and always visible, is a plain-language statement describing exactly what is happening in this relationship. This is the first thing the user reads — before member lists, before activity:

| Tile direction | Title bar statement |
|---|---|
| → You invited | "You have access to [Name]'s medical records" |
| ← They invited you | "[Name] has access to your medical records" |
| ↔ Mutual | "You and [Name] have mutual access to each other's records" |
| Multi-member group (you invited) | "You are viewing records shared in this group" |
| Multi-member group (they invited you) | "This group has access to your medical records" |

This statement is never behind a settings tap or a tooltip. It is always visible at the top of the detail screen so there is no ambiguity about what data is flowing where.

**Bottom — AI Chat Input**

A text input bar is fixed at the bottom of every page. The patient types a question — "What medications am I on?", "Is my blood sugar trending up?" — and hits send. A dropdown next to the send button lets them choose who the answer context is scoped to: **All** (uses all their records) or a specific group name (uses only documents shared in that group). This bottom bar appears on all pages for both App Owner and Group Members.

---

#### App Owner — Home Page

The home page for the App Owner is their personal health dashboard. It is designed so that a doctor or receptionist glancing at it during a visit can immediately understand the patient's current condition.

**AI Health Summary Card** — Displayed prominently at the top of the content area. This is a GPT-4o generated paragraph that synthesises all of the patient's uploaded documents into a plain-language current medical status: active conditions, current medications, recent lab flags, and any follow-up reminders. This summary is regenerated each time a new document is uploaded and approved.

> "Currently managing Type 2 Diabetes (HbA1c 7.4% as of March 2026) and hypertension. On Metformin 500mg twice daily and Amlodipine 5mg once daily. Last lab report showed mild anaemia — follow-up recommended. Next scheduled visit: Dr. Suresh, April 10."

A **"More →"** link below the summary opens the full record explorer — every document, every extracted JSON field, every AI summary, filterable by category and date.

**Activity Feed** — Below the AI summary is a scrollable chronological activity list. Every action that has happened on the account appears here:

- Document uploaded (by owner or by a group member on their behalf)
- Document approved or rejected
- New user linked or joined a group
- Group member viewed the owner's records
- AI Q&A session occurred
- Doctor visit logged

---

#### App Owner — Other Pages

All pages carry the same left nav, top upload bar, and bottom AI input. The content area changes per section:

**Records** — Full document list, filterable by category (Prescription, Lab Report, Radiology, Discharge, Bill) and date range. Each card shows document type, upload date, who uploaded it, and the one-line AI summary. Tapping opens the full document with extracted JSON fields and the full AI summary.

**Ask AI** — The full-screen AI chat interface. Conversation history is preserved. Source citations show which documents were used to answer each question.

**Groups** — A full-page view of all groups, managing members, reviewing pending link requests, and changing permission settings per member.

**Profile & Settings** — Phone number, biometric/PIN settings, notification preferences, access log.

---

#### Group Member View

When a Group Member opens ArogyaVault and navigates to a patient they are linked with, the experience is intentionally more restricted and focused.

**No upload bar at the top** — unless the data owner has explicitly granted upload permission to this member. If upload is granted, the upload button is shown but documents submitted go directly into pending approval, never auto-approved.

**No activity feed** — Group Members do not see the activity log of the patient's account. The activity feed is private to the App Owner.

**Medical Status Card** — The same AI-generated health summary is shown, but the content is scoped by the member's permission level:

- If **App Level** permission → the full AI Health Summary is shown, identical to what the owner sees
- If **Group Level** permission → the AI summary is generated only from the documents shared into that group, not the full record

**"More →" link** — Expands to show individual documents, but:

- If **App Level** → all documents are listed
- If **Group Level** → only documents explicitly shared into this group are listed; all others are hidden entirely with no indication they exist

**Bottom AI Chat Input** — Group Members can ask questions, but the RAG pipeline only retrieves from within their permitted scope. An App Level member asking "What medications is this patient on?" gets the full answer. A Group Level member gets an answer derived only from the documents shared into their group.

---

#### Summary — What Each User Type Sees

| UI Element | App Owner | Group Member (App Level) | Group Member (Group Level) |
|---|---|---|---|
| Upload bar (top) | Always visible | Only if upload permission granted | Only if upload permission granted |
| Left nav groups | All their groups | Not shown (they are a viewer, not an owner in this context) | Not shown |
| AI Health Summary | Full — all records | Full — all records | Scoped — group records only |
| "More →" records | All documents | All documents | Group-shared documents only |
| Activity feed | Full account activity | Not shown | Not shown |
| Bottom AI chat | Sends to All or any group | Scoped to permitted records | Scoped to group records only |

---

### Document Storage & Processing

Every medical document a patient uploads goes through a three-layer storage pipeline. The raw file is never the only thing saved — the system also generates structured data and an AI summary from it, and all three are stored together in a single database row.

**What gets stored per document:**

| Layer | What it is | Where it lives |
|---|---|---|
| Original file | The exact file the patient uploaded (PDF, JPG, PNG) | AWS S3 — encrypted, private, patient-scoped path |
| Structured JSON | Machine-extracted fields — doctor, medications, dates, test values, diagnosis | RDS PostgreSQL — `documents.extracted_json` (JSONB column) |
| AI summary | Human-readable paragraph summary of the document | RDS PostgreSQL — `documents.ai_summary` (text column) |
| Vector embedding | 1536-dimension float array generated from the summary text | RDS PostgreSQL — `documents.embedding` (pgvector column) |

**Why this structure:**

The original file lives in S3 because medical records must never be deleted or altered — S3 gives durable, versioned, encrypted storage with signed URL access control. Every download goes through a short-lived signed URL, never a public link.

The structured JSON is stored as a JSONB column in RDS so the backend can query specific fields directly — "show all prescriptions where medication = metformin" — without re-running AI on every query. Fast, indexed, filterable.

The AI summary is stored as plain text in RDS. When a patient asks a question, the RAG pipeline retrieves this summary (not the raw file) and passes it as context to GPT-4o. The AI has already read and digested every document — Q&A is instant.

The vector embedding stored via pgvector powers semantic search — "find documents related to my kidney function" matches by meaning, not keywords.

**One row per document. All intelligence in one place. No separate document store needed.**

**Processing pipeline (async — patient never waits):**

1. Patient uploads file → API stores raw file to S3 → returns `document_id` immediately (< 1 second response)
2. Background worker picks up the task
3. PyMuPDF extracts text from PDFs; Tesseract OCR handles scanned images and camera photos
4. GPT-4o with a structured prompt generates `extracted_json` (typed fields per document category) and `ai_summary` (readable paragraph)
5. OpenAI Embeddings API generates the 1536-dimension vector from summary + extracted text combined
6. Single RDS write: `file_url + extracted_json + ai_summary + embedding + document_type` stored in one row
7. AWS SNS push notification sent to patient: "Your prescription has been processed"

**Document categories and what the JSON captures:**

| Category | Extracted fields |
|---|---|
| Prescription | doctor_name, clinic, date, medications (name, dosage, frequency, duration), diagnosis, next_visit |
| Lab Report | lab_name, date, test_results (test_name, value, unit, reference_range, flag), ordering_doctor |
| Radiology | modality, body_part, radiologist, findings, impression, date |
| Discharge Summary | hospital, admission_date, discharge_date, diagnosis, procedures, discharge_medications, follow_up |
| Medical Bill | facility, date, line_items (description, amount), total, insurance_claim_id |

---

---

## How I Help You

At every step below, you tell me what to build next. I generate the complete code — files, configs, scripts — which you copy into the repo, run, and test. You handle AWS setup, API keys, and deployments. I handle all the code. We move as fast as you can review and deploy.

---

## Sprint 0 — Monorepo Scaffolding (Days 1–3)

**What gets built:** The entire project skeleton. Every app and package folder and base configuration. No Docker, no CI/CD yet.

**You do:** Create the GitHub repo. Install Node 20+, Python 3.12, Flutter SDK, and Android Studio with Flutter and Dart plugins. Create your AWS account and install AWS CLI.

**I generate:** The complete Turborepo config (`turbo.json`), root `package.json` with workspaces, all folder skeletons (`apps/web`, `apps/backend`, `apps/mobile`, `apps/ai-service`, `packages/shared-types`, `packages/api-client`, `packages/utils`), ESLint and Prettier configs, `.env.example` files for every service with all required AWS environment variable keys, and a `README.md` with local setup instructions.

**End of Sprint 0 demo:** All folders exist. `npm install` runs clean. Each app starts independently.

---

## Sprint 1 — Database + Phone OTP Authentication (Days 4–8)

**What gets built:** AWS RDS PostgreSQL schema, AWS Cognito phone OTP auth, JWT flow, session persistence, and role-based access. No username, no password, no email — ever.

**You do:**
- Create an AWS RDS PostgreSQL instance (db.t3.micro for dev)
- Enable pgvector extension: `CREATE EXTENSION vector;`
- Create an AWS Cognito User Pool — phone number only, SMS via AWS SNS
- Copy all connection strings and Cognito Pool ID into `.env`

**I generate:** All SQL migration files for `users` (phone as unique key, no email/password columns), `documents`, `health_metrics`, `doctor_access_tokens`, `conversations` tables with indexes and Row Level Security policies. The complete FastAPI auth service with AWS Cognito integration — `/auth/send-otp`, `/auth/verify-otp`, `/auth/refresh` endpoints. JWT validation middleware using Cognito JWKS public key. Role guard decorators for Patient/Doctor/Admin. httpOnly secure cookie handler for web sessions. The shared TypeScript types package consumed by both web and mobile.

**End of Sprint 1 demo:** POST a phone number → receive SMS OTP → verify → receive JWT. Patient and Doctor roles both working. Session persists across requests via cookie (web) and secure storage (mobile ready).

---

## Sprint 2 — Document Upload + AI Pipeline (Days 9–16)

**What gets built:** The core AI feature — upload any medical document, get a structured summary, stored with embeddings. The heart of ArogyaVault.

**You do:** Create an AWS S3 bucket (encrypted, private). Add your OpenAI API key to `.env`. Configure S3 CORS for web uploads.

**I generate:** Complete document upload API with file validation and AWS S3 integration via boto3. The full async AI pipeline — PyMuPDF for PDF text extraction, Tesseract OCR for scanned images, LangChain chains calling GPT-4o with a structured medical summarization prompt, OpenAI Embeddings API generating the 1536-dimension vector, database write storing summary and embedding together in RDS. Background task worker so upload returns instantly and processing runs async. Document auto-classification (prescription / lab report / bill / radiology). AWS SNS push notification when processing completes.

**End of Sprint 2 demo:** Upload a real prescription photo via Postman. Within 15 seconds the API returns a structured JSON — patient name, doctor, medications, dosage, date, facility. Upload a lab report — blood sugar, cholesterol, hemoglobin extracted automatically.

---

## QA Checkpoint + CI/CD + Docker Setup (Days 17–20)

**What happens:** Docker and CI/CD are intentionally excluded from Sprint 0 through Sprint 2 — this keeps the early sprints lean and avoids debugging infrastructure before product logic exists. Here, QA validates the full Sprint 2 AI pipeline — upload edge cases, OCR accuracy, summary quality, API error handling. Once QA signs off, Docker and CI/CD are introduced for the first time.

**You do:** Test uploads with different document types — clear PDFs, blurry scans, handwritten prescriptions, printed lab reports. Log any failures.

**I generate:** `Dockerfile` for the FastAPI backend and AI service. `docker-compose.yml` for running the full local stack (backend + postgres + redis) in one command. GitHub Actions CI workflow — lint, unit tests, smoke test on every push to `main`. `pytest` test suite covering the document processing pipeline and all auth endpoints.

**End of checkpoint:** `docker-compose up` runs everything locally. CI pipeline is green. Every future sprint is protected by automated tests.

---

## Sprint 3 — AI Q&A + Health Analytics API (Days 21–27)

**What gets built:** The RAG Q&A system and all analytics and recommendations APIs. Backend is feature-complete.

**I generate:** Full RAG pipeline — embed patient question, cosine similarity search against pgvector on RDS, top-K document summary retrieval, LangChain prompt template injecting retrieved summaries as context, GPT-4o call, structured response with source citations. Conversation history storage and retrieval. All analytics endpoints — metric trend time-series, health score calculation, visit frequency aggregation. Recommendations engine generating personalized diet, exercise, and lifestyle plans from patient conditions and lab history. Doctor access token generation with QR code output. Full OpenAPI spec exported for the `api-client` shared package.

**End of Sprint 3 demo:** Ask "What medications am I currently on?" — accurate answer from uploaded prescriptions. Ask "Is my blood sugar improving?" — trend-based answer with cited documents. All 16 API endpoints live and documented at `/docs`.

---

## Sprint 4 — Web Portal (Days 28–37)

**What gets built:** Full Next.js web application for patients and doctors.

**I generate:** Complete Next.js 15 setup with TypeScript, Tailwind CSS, shadcn/ui, `aws-amplify` for Cognito session management, and the auto-generated API client. Phone OTP login page (no email/password). Session persistence via httpOnly cookies — patient stays logged in across browser sessions. Patient dashboard — drag-and-drop document upload to S3, AI summary cards, Recharts health metrics charts, health score gauge. AI Q&A page — chat interface with conversation history and document citation chips. Doctor Access page — QR code generator, access log, scope selector. Doctor portal — read-only structured patient history via token link. Profile and settings. Fully responsive. Dark mode.

**End of Sprint 4 demo:** Patient logs in with phone OTP, lands on dashboard on next visit without re-logging in, uploads a prescription, sees AI summary in seconds, asks a question, views blood sugar trend, generates a QR code. Doctor opens QR link, verifies via OTP, reads full patient history. First fully demo-able product.

---

## Sprint 5 — Flutter Mobile App (Days 38–48)

**What gets built:** Full Flutter mobile app in Android Studio — phone OTP first login, then PIN or biometric for all subsequent opens.

**You do:** Set up Flutter SDK in Android Studio with Flutter and Dart plugins installed — this is the only IDE used, no Expo or EAS at any stage. Create Android emulator for testing. Connect a physical Android device via USB for real-device testing. On Mac, configure Xcode for iOS simulator and App Store builds.

**I generate:** Flutter project with clean folder structure and all `pubspec.yaml` dependencies including `amplify_flutter` (AWS Cognito auth + secure token storage), `local_auth` (PIN and biometric), `flutter_secure_storage` (token vault). Full auth flow — phone number input screen → OTP verification → PIN setup screen → biometric enable prompt. On subsequent opens: PIN screen or biometric prompt → silent token refresh → dashboard. Onboarding flow. Bottom navigation with four tabs: Home, Records, Ask AI, Profile. Home — health score card, recent documents, quick stats. Records — document list, S3 upload (camera + gallery + file picker), document detail with AI summary, category filter. Ask AI — chat interface with voice input, citation chips. Dashboard — fl_chart line charts with 1M/3M/6M/1Y range selector. Doctor Access — QR code display and access log. Push notifications via AWS SNS + Firebase Cloud Messaging.

**Build commands:**
- Android: `flutter build apk --release` → share APK directly for testing
- iOS: `flutter build ipa` on Mac with Xcode → distribute via TestFlight

**End of Sprint 5 demo:** Patient installs APK → logs in with phone OTP → sets a PIN → closes and reopens the app → enters PIN → lands on dashboard instantly. Photographs a prescription → receives push notification when AI processes it → asks a voice question → shows QR code to doctor.

---

## Sprint 6 — Deploy to Production (Days 49–55)

**What gets built:** Fully deployed, live, shareable product on AWS.

**I generate:** `vercel.json` and environment config for Next.js on Vercel (frontend only — API calls go to AWS). AWS ECS task definitions and `Dockerfile` tuned for production FastAPI and AI service. AWS Application Load Balancer config. AWS CloudFront distribution for S3 file delivery with signed URLs. GitHub Actions deploy workflows — web auto-deploys to Vercel on push to `main`, backend auto-deploys to ECS on push to `main`. Nginx config. Sentry SDK in all three apps. Health check endpoints. Rate limiting. Production environment checklist.

**End of Sprint 6 demo:** Share one URL — web app is live on Vercel backed by AWS. Share an APK — Android app installs on any phone. Share a TestFlight link — iOS app installs on any iPhone. Investors and stakeholders can use the full product with no local setup.

---

## Full Timeline Summary

| Sprint | Focus | Days | Milestone |
|---|---|---|---|
| Sprint 0 | Monorepo Scaffolding | 1–3 | Folders, configs, local dev running |
| Sprint 1 | AWS RDS + Cognito Phone OTP Auth | 4–8 | OTP login + session persistence working |
| Sprint 2 | Document Upload + AI Pipeline (S3 + RDS) | 9–16 | Upload doc → get AI summary |
| QA + CI/CD + Docker | Quality Gate | 17–20 | Tests green, containers running |
| Sprint 3 | AI Q&A + Analytics APIs | 21–27 | Ask questions, get answers |
| Sprint 4 | Web Portal (session + stay logged in) | 28–37 | Full web app demo-able |
| Sprint 5 | Flutter Mobile (PIN + Biometric auth) | 38–48 | App on device with biometric login |
| Sprint 6 | Deploy to AWS Production | 49–55 | Live URL + APK shareable |

**55 days to a fully deployed, demo-able, AI-powered product — entirely on AWS.**

---

## How We Work Sprint by Sprint

Each sprint follows this rhythm. You say "Start Sprint X." I generate every file with exact paths — you create them, run the commands, and test. You paste any errors back, I fix them. You confirm the milestone works, we move on.

At any point you can say "add WhatsApp bot" or "add wearable sync" and I slot it in without breaking existing work.

---

*Whenever you are ready, say **"Start Sprint 0"** and the build begins.*