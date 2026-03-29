# ArogyaVault — Product Overview & Build Plan

---

## What is ArogyaVault?

ArogyaVault is an AI-powered personal health records platform. A patient uploads any medical document — a prescription photo, a scanned lab report, a hospital discharge summary — and ArogyaVault reads it, extracts the structured data, generates a plain-language summary, and makes it permanently searchable and queryable.

The patient can then ask questions in plain language: *"What medications am I on?"* or *"Is my blood sugar improving?"* and get accurate answers drawn directly from their own documents, with citations.

Records are private by default. The patient controls exactly who can see what — a family member can see everything, a specialist clinic sees only what the patient shares with them, a receptionist can upload on the patient's behalf. Access is always explicit, always directional, and always revocable.

ArogyaVault works on Android, iOS, and web. All three share the same account and records.

---

## Who Uses ArogyaVault?

**The App Owner (Patient)** — the person whose health records are stored. They upload documents, ask the AI questions, manage who has access to their data, and see their full medical history. Everything in ArogyaVault is built around this person.

**Group Members** — people the patient has granted access to: doctors, clinic staff, family members, caregivers. They can see the patient's health summary and records to the extent the patient allows. A doctor sees what the patient shares. A family member may see everything. A receptionist can upload on the patient's behalf.

---

# Part 1 — Product Overview

How ArogyaVault works from the user's perspective: how you join, how you stay logged in, what the core features are, how sharing and permissions work, and what the app looks and feels like.

---

## Joining ArogyaVault — Four Entry Points

There is no separate sign-up form. Your phone number is your identity. The first time you enter your number and verify the OTP, your account is created. There are four ways to arrive:

**Invited by someone** — An existing user enters your mobile number and sends you an invite. You receive an SMS with a one-time code. Enter it in the app or on the website and your account is created. The person who invited you is then prompted to define the relationship and form a group — see Linking & Groups below.

**Scan a QR code** — A clinic or doctor displays a QR code at reception, on a table card, or on a printed discharge slip. You scan it, the ArogyaVault web portal opens pre-configured for that clinic, you enter your number, verify OTP, and your account is created already linked to that clinic.

**Visit the website** — Go to arogyavault.com, tap "Get Started," enter your phone number, verify OTP. Account created. You are shown a short optional prompt for your name, date of birth, and blood group — all skippable.

**Download the app** — Install from Play Store, App Store, or a direct APK. Same flow: phone number → OTP → account created → set up PIN or fingerprint → dashboard.

All four paths converge at the same point. The experience of joining is identical regardless of how you arrived.

---

## Staying Logged In — Authentication & Session

Once you are in, you stay in. You never re-enter your phone number on routine visits.

**On mobile**, the first login uses phone OTP. After that, the app prompts you to set a PIN or enable fingerprint. Every subsequent time you open the app, you use your PIN or fingerprint — fast, local, no network call required. The app silently refreshes your session in the background. OTP is only required again if you haven't opened the app in 30 days, if you install on a new device, or if you explicitly log out.

**On web**, the first login uses phone OTP. After that, a secure session cookie keeps you logged in for 30 days. Every time you return to the website, you land directly on the dashboard.

No username. No password. No email. Just your phone number, once.

---

## The Core Feature — Upload, Process, Ask

When a patient uploads any medical document, the platform does five things automatically:

1. Stores the original file securely — PDF, photo, scan, anything
2. Reads the document using AI — whether it is a clean PDF or a blurry camera photo of a handwritten prescription
3. Extracts structured data — doctor name, medications, dosages, dates, test values, diagnosis, follow-up instructions
4. Generates a plain-language AI summary of the document
5. Sends the patient a notification: "Your prescription has been processed"

From that point on, the patient can ask any question about their records in natural language. The AI answers using only the patient's own documents and cites exactly which document each piece of information came from.

ArogyaVault handles five document categories: Prescriptions, Lab Reports, Radiology reports, Discharge Summaries, and Medical Bills. Each category extracts its own relevant fields — a prescription extracts medications and dosages, a lab report extracts test results with reference ranges and flags, a discharge summary extracts the diagnosis and follow-up plan.

---

## Sharing Records — Linking & Groups

A patient's records are private by default. Sharing is always an explicit, consent-based action.

**What is a Group?** A Group is a trusted access circle. It is not a chat room or a shared feed — it is a container that defines who is allowed to see whose medical data and under what conditions. Groups are used in clinical settings (a doctor's clinic is a group, the doctor and receptionist are members, patients share records with that group) and for personal use (a family circle around an elderly parent's health history).

**How linking works.** When a user invites another person, the direction of access is always explicit — the invitor is requesting to see the other person's records. After both sides verify OTP (consent), a group is created with both members. The invitor selects the relationship type at the time of linking: Family Member, Caregiver, Friend, Patient, or a custom label.

If the person being invited already has an ArogyaVault account, they receive an in-app notification and SMS rather than an OTP invite. They accept from inside the app. Link requests expire after 48 hours.

Any member of an existing group can add more people at any time — the group is not limited in size.

**Direction is always visible.** Every group tile in the left navigation shows an arrow indicating data flow direction:

- **→ You invited** — you can see their records
- **← They invited you** — they can see your records
- **↔ Mutual** — both directions are active independently

Tapping a group opens a detail screen. The first thing you see at the top is a plain-language statement: *"You have access to Ravi's medical records"* or *"Dr. Sharma's Clinic has access to your medical records."* No ambiguity about what is flowing where.

---

## Controlling Access — Permissions

When a patient accepts a link, they set two things: the scope of access and what actions are allowed.

**Scope — how much the viewer can see:**

*App Level* — the viewer can see all of the patient's medical records, every document ever uploaded, past and future. The right choice for a primary care doctor, a trusted family member, or a full-time caregiver.

*Group Level* — the viewer can only see documents the patient explicitly shares into that specific group. Everything else is invisible and there is no indication it exists. The right choice for a specialist clinic, a hospital department, or anyone who needs scoped access. The patient shares individual documents into a group at any time from the document detail screen.

**Actions — what they can do:**

*Read* is always granted when a link is accepted. The viewer can read records within their permitted scope. This cannot be selectively disabled — the link either exists or it is revoked.

*Upload* is OFF by default. The patient can optionally allow a linked person to upload documents on their behalf — primarily for clinical use (a receptionist scanning a lab report, a doctor uploading a discharge summary). When someone uploads on the patient's behalf, the patient receives a notification and must approve the document before it becomes part of their permanent record. Documents that existed before the link was created are readable immediately — no per-document approval needed for those.

The patient can change permissions, revoke access, or remove someone from a group at any time. Every access event is logged.

| Scope | What the viewer sees | Upload behaviour |
|---|---|---|
| App Level | Every document the patient has ever uploaded | Goes to patient's main record — approval required |
| Group Level | Only documents explicitly shared into this group | Tagged to this group only — approval required to promote to main record |

---

## What the App Looks Like

The ArogyaVault layout has three elements that persist across every page — the left panel, the top upload bar, and the bottom AI chat input — plus a content area that changes per section.

**Left panel — Groups.** A vertical list of every group the user belongs to. Each tile shows the group name, member count, permission level badge (App Access / Group Access), and the direction arrow (→, ←, ↔). Tapping a tile opens the group detail screen: list of members with their permission levels, documents they have uploaded on the owner's behalf (pending or approved), and the group's activity log.

**Top bar — Upload.** For the App Owner, a prominent upload button is pinned at the top of every page — camera, gallery, or file. Never buried in a menu.

**Bottom bar — AI Chat.** A text input fixed at the bottom of every page. Type a question, select a scope from the dropdown (All records or a specific group), and send. Works on all pages for both user types.

---

### App Owner — Home Page

The home page is the patient's personal health dashboard, designed so that a doctor or receptionist glancing at it during a visit immediately understands the patient's current condition.

**AI Health Summary card** — A GPT-4o generated paragraph synthesising all uploaded records into the patient's current medical status: active conditions, current medications, recent lab flags, and next follow-up reminders. Regenerated every time a new document is approved.

> *"Currently managing Type 2 Diabetes (HbA1c 7.4% as of March 2026) and hypertension. On Metformin 500mg twice daily and Amlodipine 5mg once daily. Last lab report flagged mild anaemia — follow-up recommended. Next scheduled visit: Dr. Suresh, April 10."*

A **"More →"** link opens the full record explorer: every document, filterable by category and date, each with its AI summary and extracted fields.

**Activity feed** — Scrollable chronological log of everything that has happened on the account: documents uploaded, documents approved or rejected, new users linked, group members who viewed records, AI Q&A sessions.

---

### App Owner — All Other Pages

**Records** — Full document list, filterable by category (Prescription, Lab Report, Radiology, Discharge, Bill) and date. Each card shows document type, upload date, who uploaded it, and a one-line AI summary.

**Ask AI** — Full-screen chat interface. Conversation history preserved across sessions. Each answer shows which documents were used as sources.

**Groups** — Manage all linked users, review pending link requests, change permission settings per member.

**Profile & Settings** — Phone number, biometric/PIN settings, notification preferences, access log.

---

### Group Member View

When a linked viewer opens ArogyaVault and views a patient's shared data, the experience is intentionally more restricted:

- **No upload bar** — unless the patient has granted upload permission. If granted, submissions go into pending approval, never auto-approved.
- **No activity feed** — private to the App Owner.
- **AI Health Summary** — shown, but scoped: App Level shows the full summary, Group Level shows a summary generated only from the documents shared into that group.
- **"More →"** — App Level lists all documents, Group Level lists only group-shared documents. Nothing outside the scope is hinted at.
- **AI Chat** — answers only from within the permitted scope.

---

### At a Glance — What Each User Type Sees

| UI Element | App Owner | Group Member — App Level | Group Member — Group Level |
|---|---|---|---|
| Upload bar (top) | Always visible | Only if upload was granted | Only if upload was granted |
| Left nav groups | All their groups | Not shown | Not shown |
| AI Health Summary | All records | All records | Group records only |
| "More →" records | All documents | All documents | Group-shared documents only |
| Activity feed | Full account activity | Not shown | Not shown |
| AI Chat scope | All or any group | Full permitted records | Group records only |

---

# Part 2 — Technical Architecture & Build Plan

How everything is built: infrastructure choices, authentication internals, database schema, document AI pipeline, and the sprint-by-sprint plan to go from empty repo to live product in 55 days.

---

## Infrastructure & Tools

All backend infrastructure runs on a single AWS account. No third-party services for core functionality.

| Tool / Service | Role |
|---|---|
| AWS Cognito | Phone OTP authentication, user pool, JWT issuance |
| AWS RDS PostgreSQL + pgvector | Primary database — structured data, JSONB fields, vector embeddings |
| AWS S3 | Encrypted medical document storage |
| AWS SNS | SMS OTP delivery, push notifications |
| AWS EC2 / ECS | FastAPI backend and AI service hosting |
| AWS CloudFront | CDN, S3 signed URL delivery |
| OpenAI GPT-4o | Document summarisation, RAG Q&A |
| OpenAI Embeddings API | 1536-dimension vector generation per document |
| Redis (Upstash) | Invite token cache, session data, rate limiting |
| Vercel | Next.js web app hosting |
| Firebase Cloud Messaging | Mobile push notifications |
| Docker | Containerisation — introduced after Sprint 2 QA |
| GitHub Actions | CI/CD — introduced after Sprint 2 QA |
| Sentry | Error tracking across all three apps |

**Frontend stack:** Flutter + Dart (mobile, built in Android Studio), Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui (web).

**Backend stack:** Python 3.12 + FastAPI. LangChain for AI orchestration. PyMuPDF + Tesseract OCR for document extraction.

**Monorepo:** All apps and shared packages in one GitHub repo managed with Turborepo. Folder structure: `apps/web`, `apps/backend`, `apps/mobile`, `apps/ai-service`, `packages/shared-types`, `packages/api-client`, `packages/utils`.

---

## Authentication — Technical Details

AWS Cognito User Pool configured for phone-only auth. All other sign-in methods disabled. The `users` table has `phone` as the unique identifier — no `email` column, no `password_hash` column.

**Mobile token lifecycle:**
- `amplify_flutter` handles Cognito OTP, token issuance, and silent refresh
- Access Token: 15-minute expiry. Refresh Token: 30-day expiry
- Both stored in Flutter Secure Storage — iOS Keychain / Android Keystore, never plain storage
- `local_auth` Flutter package handles PIN (6-digit, hash stored locally, never sent to server) and biometric (fingerprint, Face ID)
- Wrong PIN 5 consecutive times → app locks, forces phone OTP re-verification

**Web session lifecycle:**
- `aws-amplify` JS SDK manages Cognito session and token refresh
- Tokens stored as httpOnly secure cookies — not accessible to JavaScript, XSS-protected
- 30-day session cookie expiry. "Keep me signed in" ON by default
- Explicit logout → cookie cleared + refresh token invalidated on Cognito immediately

**Backend JWT validation:**
FastAPI validates Cognito-issued JWTs using Cognito's public JWKS endpoint. Role guard decorators enforce Patient / Doctor / Admin access per route.

**Auth endpoints:**

| Endpoint | What it does |
|---|---|
| `POST /auth/send-otp` | Triggers Cognito → AWS SNS sends 6-digit OTP via SMS |
| `POST /auth/verify-otp` | Verifies OTP with Cognito → creates `users` row if new → returns JWT |
| `POST /auth/refresh` | Silent refresh using stored refresh token → returns new access token |

---

## Registration — Technical Details

All four entry points hit the same two auth endpoints (`/auth/send-otp`, `/auth/verify-otp`). The difference is the optional context passed alongside OTP verification.

**Invite flow:** Invite record stored in Redis with `inviter_user_id`, `invitee_phone`, `invite_token`, and a 15-minute expiry. OTP sent via SNS. On verification, invite record is consumed, new user row created, and a pending link request is created between inviter and invitee.

**QR code flow:** QR encodes `arogyavault.com/join?ref=CLINIC_TOKEN`. Backend resolves the clinic token and stores referral context in the session. After OTP: account creation + clinic group association in a single transaction.

**Self-registration (web or app):** Standard Cognito OTP flow. If phone exists in `users` → login. If not → create with `role = patient`. No separate registration endpoint — same `/auth/verify-otp` handles both cases.

---

## Groups & Permissions — Database Schema

| Table | Key fields |
|---|---|
| `groups` | `id`, `name`, `created_by`, `created_at` |
| `group_members` | `group_id`, `viewer_user_id`, `data_owner_user_id`, `invited_by`, `relationship_type`, `permission_scope` (app / group), `can_read`, `can_upload`, `upload_requires_approval`, `status` (pending / accepted / declined), `joined_at` |
| `link_requests` | `id`, `from_user_id`, `to_phone`, `group_id`, `relationship_type`, `token`, `expires_at`, `status` |

The `group_members` table is directional — `viewer_user_id` is who holds the access, `data_owner_user_id` is whose records are being accessed. Every API call returning patient records checks this table first. `permission_scope = 'app'` returns all records. `permission_scope = 'group'` returns only documents that have a matching row in `document_group_shares` for that group.

**Upload approval flow:** Documents uploaded by a viewer on behalf of the data owner are stored with `status = pending_approval`. The data owner reviews the AI summary via a push notification card and taps Accept or Reject. Accepted → `status = approved`, enters permanent record. Rejected → soft-deleted, uploader notified.

---

## Document Storage & AI Pipeline

Every uploaded document produces four artefacts, all stored together in a single RDS row — no separate document store, no separate vector database.

| Artefact | What it is | Where it lives |
|---|---|---|
| Original file | Raw PDF, JPG, or PNG | AWS S3 — encrypted, patient-scoped path, accessed only via short-lived signed URLs |
| Structured JSON | Extracted fields per document category | RDS — `documents.extracted_json` (JSONB column, indexed, queryable) |
| AI summary | Plain-language paragraph | RDS — `documents.ai_summary` (text column, used for RAG context retrieval) |
| Vector embedding | 1536-dimension float array | RDS — `documents.embedding` (pgvector column, cosine similarity search) |

**Why PostgreSQL handles everything:** pgvector extension provides native vector search, JSONB provides structured field queries, Row Level Security enforces patient-level isolation, and ACID compliance is mandatory for medical records. No separate vector store or NoSQL layer needed.

**Async processing pipeline (patient never waits):**
1. Upload → S3 stores file → API returns `document_id` in under 1 second
2. Background worker picks up the task
3. PyMuPDF extracts text from PDFs; Tesseract OCR processes scanned images and camera photos
4. LangChain + GPT-4o generates `extracted_json` and `ai_summary` using a typed medical prompt per document category
5. OpenAI Embeddings API generates the 1536-dim vector from combined summary + extracted text
6. Single RDS write — all four artefacts in one row
7. AWS SNS push notification sent to patient

**Extracted fields per document category:**

| Category | Extracted fields |
|---|---|
| Prescription | doctor_name, clinic, date, medications (name, dosage, frequency, duration), diagnosis, next_visit |
| Lab Report | lab_name, date, test_results (test_name, value, unit, reference_range, flag), ordering_doctor |
| Radiology | modality, body_part, radiologist, findings, impression, date |
| Discharge Summary | hospital, admission_date, discharge_date, diagnosis, procedures, discharge_medications, follow_up |
| Medical Bill | facility, date, line_items (description, amount), total, insurance_claim_id |

**RAG Q&A pipeline:**
1. Patient question → OpenAI Embeddings generates question vector
2. pgvector cosine similarity search → top-K matching document summaries retrieved from RDS
3. LangChain prompt template injects retrieved summaries as context
4. GPT-4o generates answer with source citations
5. Response + linked document references stored in `conversations` table

---

## Build Plan — Sprint by Sprint

Each sprint follows this rhythm. You say "Start Sprint X." I generate every file with exact paths — you create them, run the commands, test, and paste back any errors. I fix them. You confirm the milestone works and we move on. You handle AWS setup, API keys, and deployments. I handle all the code.

---

### Sprint 0 — Monorepo Scaffolding (Days 1–3)

**What gets built:** The full project skeleton — every folder, config, and environment file. No Docker, no CI/CD yet.

**You do:** Create the GitHub repo. Install Node 20+, Python 3.12, Flutter SDK, Android Studio with Flutter and Dart plugins. Create the AWS account and install AWS CLI.

**I generate:** Turborepo config (`turbo.json`), root `package.json` with workspaces, all app and package folder skeletons, ESLint and Prettier configs, `.env.example` files for every service with all required AWS variable keys, and a `README.md` with local setup instructions.

**Sprint 0 milestone:** `npm install` runs clean. Each app starts independently.

---

### Sprint 1 — Database + Auth (Days 4–8)

**What gets built:** AWS RDS PostgreSQL schema, Cognito phone OTP, JWT flow, session persistence, role-based access.

**You do:** Create RDS instance (db.t3.micro for dev), enable pgvector (`CREATE EXTENSION vector;`), create Cognito User Pool (phone only, SMS via SNS), copy env vars into `.env`.

**I generate:** All SQL migration files (`users`, `documents`, `health_metrics`, `groups`, `group_members`, `link_requests`, `conversations` tables with indexes and Row Level Security policies). FastAPI auth service with all three auth endpoints. JWT validation middleware using Cognito JWKS. Role guard decorators (Patient / Doctor / Admin). httpOnly cookie handler for web sessions. Shared TypeScript types package.

**Sprint 1 milestone:** POST phone → receive SMS OTP → verify → receive JWT. Patient and Doctor roles working. Session persists via cookie (web) and secure storage (mobile).

---

### Sprint 2 — Document Upload + AI Pipeline (Days 9–16)

**What gets built:** The core AI feature — upload any medical document, get a structured summary, stored with embeddings.

**You do:** Create S3 bucket (encrypted, private), add OpenAI API key to `.env`, configure S3 CORS for web uploads.

**I generate:** Document upload API with file validation and S3 integration (boto3). Full async AI pipeline — PyMuPDF + Tesseract OCR + LangChain + GPT-4o + Embeddings API. Document auto-classification. Background task worker (upload returns in under 1 second, AI runs async). SNS push notification on completion.

**Sprint 2 milestone:** Upload a real prescription photo via Postman. Within 15 seconds — structured JSON with medications, dosages, doctor, date, facility. Upload a lab report — blood sugar, cholesterol, haemoglobin extracted automatically.

---

### QA Checkpoint + CI/CD + Docker (Days 17–20)

Docker and CI/CD are intentionally excluded from Sprints 0–2. They are introduced here, after the AI pipeline is QA-validated, so the early sprints stay lean and infrastructure debugging doesn't block product logic.

**You do:** Test uploads with clear PDFs, blurry scans, handwritten prescriptions, and printed lab reports. Log any failures in OCR accuracy, extraction quality, or API error handling.

**I generate:** Dockerfiles for FastAPI backend and AI service. `docker-compose.yml` for the full local stack (backend + PostgreSQL + Redis). GitHub Actions CI workflow (lint + unit tests + smoke test on every push to `main`). `pytest` test suite covering the document pipeline and all auth endpoints.

**Checkpoint milestone:** `docker-compose up` runs everything locally. CI pipeline is green. Every future sprint is protected by automated tests.

---

### Sprint 3 — AI Q&A + Analytics APIs (Days 21–27)

**What gets built:** The full RAG Q&A system, analytics endpoints, and recommendations engine. Backend is feature-complete after this sprint.

**I generate:** Full RAG pipeline (embed question → pgvector similarity search → top-K retrieval → GPT-4o with injected context → response with citations). Conversation history storage and retrieval. Analytics endpoints — metric trend time-series, health score calculation, visit frequency aggregation. Personalised recommendations engine (diet, exercise, lifestyle from patient conditions and lab history). Doctor access token generation with QR code output. Full OpenAPI spec exported to `packages/api-client`.

**Sprint 3 milestone:** "What medications am I currently on?" → accurate answer from uploaded prescriptions. "Is my blood sugar improving?" → trend-based answer with cited documents. All 16 API endpoints live and documented at `/docs`.

---

### Sprint 4 — Web Portal (Days 28–37)

**What gets built:** Full Next.js web application for patients and doctors.

**I generate:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui + `aws-amplify` + auto-generated API client. Phone OTP login (no email/password). httpOnly session cookies — stays logged in across browser visits. Patient dashboard (drag-and-drop S3 upload, AI summary cards, Recharts health charts, health score gauge). AI Q&A page (chat interface, conversation history, document citation chips). Groups page (manage linked users and permissions). Doctor Access page (QR code generator, access log, scope selector). Doctor portal (read-only patient history via token link). Fully responsive. Dark mode.

**Sprint 4 milestone:** Patient logs in with phone OTP, returns to dashboard on next visit without re-logging in, uploads a prescription, sees AI summary in seconds, asks a question, generates a QR code for the doctor. Doctor opens QR link, verifies OTP, reads full patient history. First fully demo-able product.

---

### Sprint 5 — Flutter Mobile App (Days 38–48)

**What gets built:** Full Flutter app — phone OTP first login, then PIN or biometric for all subsequent opens.

**You do:** Set up Flutter SDK in Android Studio with Flutter and Dart plugins (this is the only IDE — no Expo, no EAS). Create Android emulator. Connect physical Android device via USB for real-device testing. On Mac, configure Xcode for iOS simulator and App Store builds.

**I generate:** Flutter project with full `pubspec.yaml` dependencies — `amplify_flutter` (Cognito auth + token storage), `local_auth` (PIN and biometric), `flutter_secure_storage` (token vault). Full auth flow (phone → OTP → PIN setup → biometric prompt → PIN/biometric on all subsequent opens). Bottom navigation (Home, Records, Ask AI, Profile). Home (health score card, recent documents, quick stats). Records (S3 upload via camera / gallery / file picker, document detail with AI summary, category filter). Ask AI (voice input, citation chips). Health charts (`fl_chart`, 1M/3M/6M/1Y selector). Doctor Access (QR code display, access log). Push notifications via SNS + Firebase Cloud Messaging.

**Build commands:** `flutter build apk --release` for Android. `flutter build ipa` on Mac with Xcode for iOS / TestFlight.

**Sprint 5 milestone:** Install APK → phone OTP → set PIN → close and reopen → enter PIN → dashboard instantly. Photograph a prescription → push notification when processed → ask a voice question → show QR code to doctor.

---

### Sprint 6 — Deploy to Production (Days 49–55)

**What gets built:** Fully deployed, live, shareable product on AWS.

**I generate:** `vercel.json` and environment config for Next.js on Vercel (frontend only — all API calls go to AWS). AWS ECS task definitions and production-tuned Dockerfiles. Application Load Balancer config. CloudFront distribution for S3 file delivery with signed URLs. GitHub Actions deploy workflows — web auto-deploys to Vercel on push to `main`, backend auto-deploys to ECS on push to `main`. Nginx config. Sentry SDK in all three apps. Health check endpoints. Rate limiting. Production checklist.

**Sprint 6 milestone:** Share one URL — web app live on Vercel backed by AWS. Share an APK — installs on any Android. Share a TestFlight link — installs on any iPhone. Investors and stakeholders use the full product with no local setup.

---

## Full Timeline

| Phase | Focus | Days | Milestone |
|---|---|---|---|
| Sprint 0 | Monorepo Scaffolding | 1–3 | All folders exist, local dev running |
| Sprint 1 | Auth + Database | 4–8 | Phone OTP + session persistence working |
| Sprint 2 | Document Upload + AI Pipeline | 9–16 | Upload doc → get AI summary |
| QA + CI/CD + Docker | Quality Gate | 17–20 | Tests green, containers running |
| Sprint 3 | AI Q&A + Analytics APIs | 21–27 | Ask questions, get cited answers |
| Sprint 4 | Web Portal | 28–37 | Full web app demo-able |
| Sprint 5 | Flutter Mobile App | 38–48 | App on device with biometric login |
| Sprint 6 | Production Deployment | 49–55 | Live URL + APK shareable |

**55 days to a fully deployed, AI-powered, demo-able product — entirely on AWS.**

---

*Say **"Start Sprint 0"** whenever you are ready and the build begins.*
