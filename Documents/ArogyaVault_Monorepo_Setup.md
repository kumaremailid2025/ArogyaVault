# ArogyaVault — Monorepo Setup Guide

Sprint 0 complete (scaffold + static marketing site). Repository root: `C:\Users\ADMIN\ArogyaVault`

---

## Folder Structure

```
ArogyaVault/
├── apps/
│   ├── web/                    Next.js 15 + TypeScript + Tailwind CSS v4  (port 3000)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── globals.css              Tailwind v4 @theme inline + dark/light CSS vars
│   │       │   ├── layout.tsx               RootLayout — wraps ThemeProvider
│   │       │   ├── (marketing)/             Route group — public marketing pages
│   │       │   │   ├── layout.tsx           Marketing layout: Navbar + main + Footer
│   │       │   │   ├── page.tsx             / → Home page
│   │       │   │   ├── features/page.tsx    /features
│   │       │   │   ├── how-it-works/page.tsx /how-it-works
│   │       │   │   ├── security/page.tsx    /security
│   │       │   │   ├── about/page.tsx       /about
│   │       │   │   ├── faq/page.tsx         /faq
│   │       │   │   └── contact/page.tsx     /contact
│   │       │   ├── (auth)/                  Route group — authentication pages (no nav/footer)
│   │       │   │   ├── layout.tsx           Auth layout: minimal header, logo only
│   │       │   │   └── sign-in/page.tsx     /sign-in → OTP login (2-step: phone → OTP → /liveboard)
│   │       │   └── (app)/                   Route group — authenticated app pages
│   │       │       ├── layout.tsx           App shell: header + sidebar + bottom bar
│   │       │       ├── liveboard/page.tsx   /liveboard → Home dashboard (welcome + activity)
│   │       │       ├── records/page.tsx     /records   → Document explorer
│   │       │       ├── ask-ai/page.tsx      /ask-ai    → AI chat interface
│   │       │       ├── groups/page.tsx      /groups    → Groups & sharing
│   │       │       └── profile/page.tsx     /profile   → Settings & access log
│   │       ├── core/                        Layer 1 & 2 — base primitives
│   │       │   ├── ui/                      ← ALL 46 shadcn/ui components live here
│   │       │   │   ├── index.ts             Barrel re-export of every shadcn component
│   │       │   │   ├── button.tsx
│   │       │   │   ├── card.tsx
│   │       │   │   └── ... (44 more)
│   │       │   └── primitives/              Typed HTML element wrappers (Layer 1)
│   │       │       ├── typography.tsx       H1–H4, Text, Lead, Muted, Eyebrow, etc.
│   │       │       ├── layout.tsx           Container, Section, Stack, Row, Grid, Flex
│   │       │       ├── surface.tsx          Surface, GradientBadge, GlassCard
│   │       │       └── index.ts             Barrel export of all primitives
│   │       ├── components/                  Layer 3 — composite page-level components
│   │       │   ├── app/                     Authenticated app shell components
│   │       │   │   ├── app-header.tsx       Top bar: logo + notifications + profile dropdown
│   │       │   │   ├── app-sidebar.tsx      Left nav: 5 nav links + My Groups list
│   │       │   │   └── app-bottom-bar.tsx   Bottom: Upload button + AI search input
│   │       │   ├── layout/
│   │       │   │   ├── navbar.tsx           Top nav (desktop + mobile sheet)
│   │       │   │   ├── footer.tsx           4-column footer + copyright bar
│   │       │   │   └── page-wrapper.tsx     Navbar + main + Footer wrapper
│   │       │   ├── ui/                      Reusable page building blocks
│   │       │   │   ├── section-header.tsx   Eyebrow + H2 + Lead
│   │       │   │   ├── feature-card.tsx     Icon + title + description card
│   │       │   │   ├── step-card.tsx        Numbered step with connector line
│   │       │   │   ├── stat-card.tsx        Value + label + sublabel
│   │       │   │   ├── testimonial-card.tsx Star rating + quote + author
│   │       │   │   ├── faq-item.tsx         Accordion FAQ item wrapper
│   │       │   │   └── page-hero.tsx        Inner-page compact hero
│   │       │   └── sections/               Full page sections (used across all 7 pages)
│   │       │       ├── hero-section.tsx     Homepage hero (headline, CTAs, mockup)
│   │       │       ├── stats-section.tsx    4 key stat cards
│   │       │       ├── features-section.tsx ALL_FEATURES array + grid (limit prop)
│   │       │       ├── how-it-works-section.tsx STEPS array + step cards
│   │       │       ├── groups-section.tsx   Family linking diagram
│   │       │       ├── security-section.tsx SECURITY_PILLARS array + cards
│   │       │       ├── testimonials-section.tsx 3 testimonial cards
│   │       │       ├── faq-section.tsx      ALL_FAQS array + Accordion (limit prop)
│   │       │       ├── cta-section.tsx      Full-width navy CTA (customisable)
│   │       │       └── contact-form-section.tsx react-hook-form + zod contact form
│   │       ├── lib/
│   │       │   └── utils.ts                 cn() helper (clsx + tailwind-merge)
│   │       └── providers/
│   │           └── theme-provider.tsx       next-themes ThemeProvider wrapper
│   ├── backend/          Python FastAPI — auth, documents, groups API (port 8000)
│   ├── ai-service/       Python FastAPI — OCR, GPT-4o pipeline, RAG Q&A (port 8001)
│   └── mobile/           Flutter 3.x app — Android + iOS (Android Studio)
├── packages/
│   ├── shared-types/     TypeScript types shared across web and api-client
│   ├── api-client/       Typed fetch wrapper (auto-generated from OpenAPI in Sprint 3)
│   └── utils/            Shared helper functions (formatPhone, formatDate, etc.)
├── .venv/                Python virtual environment (gitignored — recreate locally)
├── turbo.json            Turborepo pipeline config
├── package.json          Root npm workspace config
├── tsconfig.json         Root TypeScript config
├── components.json       shadcn/ui config — points components to src/core/ui
├── .env.example          All environment variable keys — copy to .env and fill in
├── .gitignore
└── .prettierrc
```

---

## Verified Package Versions (Sprint 0 baseline)

| Package | Version | Location |
|---|---|---|
| Node.js | 22.x | System |
| Turbo | latest | `node_modules/.bin/turbo` |
| Next.js | 15.x | Hoisted to root `node_modules` |
| React | 19.x | Hoisted to root `node_modules` |
| TypeScript | 5.x | Hoisted to root `node_modules` |
| Tailwind CSS | 4.x | Hoisted to root `node_modules` |
| @tailwindcss/postcss | 4.x | Hoisted to root `node_modules` |
| Python | 3.13 | System |
| numpy | ≥2.0, <3.0 | `.venv` (install required) |
| FastAPI | 0.115.0 | `.venv` (install required) |
| langchain | 0.3.25 | `.venv` (install required) |
| Flutter | 3.x | System |
| shadcn/ui components | 46 components | `src/core/ui/` (already committed) |
| next-themes | ^0.4.4 | Hoisted to root `node_modules` after `npm install` |
| lucide-react | ^0.468.0 | Hoisted to root `node_modules` after `npm install` |
| @radix-ui/* | various | Hoisted to root `node_modules` after `npm install` |
| react-hook-form | ^7.54.0 | `apps/web` — used in ContactFormSection |
| @hookform/resolvers | ^3.9.0 | `apps/web` — zod adapter for react-hook-form |
| zod | ^3.24.0 | `apps/web` — contact form schema validation |

> **Note on Python venv:** `.venv` is gitignored. Every developer must create and populate it locally after pulling. See instructions below.

---

## First-Time Setup (Original Machine or New Clone)

Run all commands from `C:\Users\ADMIN\ArogyaVault` in PowerShell.

### 1. Install JavaScript dependencies

```powershell
npm install
```

Installs Turborepo, Next.js, TypeScript, Tailwind CSS, and all shared packages via npm workspaces. All packages are hoisted to the root `node_modules/`.

### 2. Create Python virtual environment

```powershell
python -m venv .venv
```

Creates `.venv/` at the repo root. This is gitignored — every developer must do this step.

### 3. Activate the virtual environment

```powershell
.venv\Scripts\activate
```

Your terminal prompt changes to `(.venv)`. **Keep this terminal open for all Python steps below.**

### 4. Install backend Python dependencies

```powershell
pip install -r apps\backend\requirements.txt
```

Installs: FastAPI, Uvicorn, Pydantic, Boto3, PyJWT, psycopg2, Redis, httpx.

### 5. Install AI service Python dependencies

```powershell
pip install -r apps\ai-service\requirements.txt
```

Installs: FastAPI, Uvicorn, numpy 2.x, OpenAI, LangChain 0.3.25, PyMuPDF, pytesseract, Pillow, pgvector, psycopg2, Boto3.

> **Python 3.13 compatibility note:** numpy 1.x has no pre-built wheel for Python 3.13 on Windows. This project pins `numpy>=2.0.0,<3.0.0` and `langchain==0.3.25` (which dropped the numpy<2 restriction at 0.3.7+). Do not downgrade these.

### 6. Set up Flutter mobile

```powershell
cd apps\mobile
flutter pub get
cd ..\..
```

If the `apps\mobile` folder is empty (fresh clone), create the project first:

```powershell
cd apps\mobile
flutter create . --org com.arogyavault --project-name mobile
flutter pub get
cd ..\..
```

### 7. Copy environment file

```powershell
copy .env.example .env
```

Open `.env` and fill in your AWS, OpenAI, and Redis keys when ready. **The app runs without real keys for Sprint 0** — placeholder values are fine until Sprint 1.

---

## New Developer Setup (After Git Pull / Fresh Clone)

> This section is for any developer joining the project or setting up on a new machine. Follow these steps in order after cloning the repo.

### Prerequisites — Install these first if not already present

| Tool | Version | Download |
|---|---|---|
| Node.js | 22.x LTS | https://nodejs.org |
| Python | 3.13 | https://python.org/downloads |
| Flutter SDK | 3.x stable | https://docs.flutter.dev/get-started/install |
| Android Studio | Latest | https://developer.android.com/studio |
| Git | Any | https://git-scm.com |

Verify your installs:

```powershell
node --version        # should print v22.x.x
python --version      # should print Python 3.13.x
flutter --version     # should print Flutter 3.x.x
git --version
```

### Step 1 — Clone the repository

```powershell
git clone https://github.com/YOUR_ORG/arogyavault.git
cd arogyavault
```

Replace `YOUR_ORG/arogyavault` with the actual GitHub repo path once it is created.

### Step 2 — Install JavaScript dependencies

```powershell
npm install
```

This restores all npm packages including Turbo, Next.js, React, TypeScript, and all shared package dependencies. The `node_modules/` folder is gitignored — this step must be done on every machine.

### Step 3 — Create and activate Python virtual environment

```powershell
python -m venv .venv
.venv\Scripts\activate
```

The `.venv/` folder is gitignored. Every developer creates their own local copy.

### Step 4 — Install Python packages

```powershell
pip install -r apps\backend\requirements.txt
pip install -r apps\ai-service\requirements.txt
```

Run both commands in the same terminal where `.venv` is active (prompt shows `(.venv)`).

### Step 5 — Install Flutter packages

```powershell
cd apps\mobile
flutter pub get
cd ..\..
```

`pubspec.lock` is committed to the repo — `flutter pub get` restores exact versions from it.

### Step 6 — Set up environment variables

```powershell
copy .env.example .env
```

Fill in the variables you need for the sprint you are working on. See the **Environment Variables Reference** table below for which sprint needs which keys.

### Step 7 — Verify your setup

```powershell
# Check npm workspace is wired up
npm ls --depth=0 2>$null | findstr arogyavault

# Check Python venv has packages
python -c "import fastapi, langchain, numpy; print('Python OK')"

# Check Flutter
flutter doctor
```

### Step 8 — Start the apps

```powershell
npm run dev
```

Open these URLs to confirm everything is running:

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| Backend API | http://localhost:8000/docs |
| AI service | http://localhost:8001/docs |
| Flutter | Open Android Studio → Run on emulator |

---

## Running the Apps Day-to-Day

### Start everything together (recommended)

```powershell
# Make sure .venv is active first
.venv\Scripts\activate

npm run dev
```

Turborepo starts all apps in parallel with hot reload on every save.

### Start apps individually (for focused development)

```powershell
# Web only
cd apps\web
npm run dev

# Backend only (activate venv first in this terminal)
.venv\Scripts\activate
cd apps\backend
uvicorn main:app --reload --port 8000

# AI service only (activate venv first in this terminal)
.venv\Scripts\activate
cd apps\ai-service
uvicorn main:app --reload --port 8001

# Mobile — open Android Studio, open apps\mobile as the project, run on emulator
```

---

## Verify All Services Are Running

| Service | URL | Expected response |
|---|---|---|
| Home page | http://localhost:3000 | ArogyaVault marketing homepage |
| Features | http://localhost:3000/features | Features page |
| How It Works | http://localhost:3000/how-it-works | How It Works page |
| Security | http://localhost:3000/security | Security & Privacy page |
| About | http://localhost:3000/about | About ArogyaVault page |
| FAQ | http://localhost:3000/faq | FAQ page |
| Contact | http://localhost:3000/contact | Contact page with form |
| Sign In | http://localhost:3000/sign-in | OTP login page (phone → OTP → /liveboard) |
| Liveboard | http://localhost:3000/liveboard | Home dashboard (post-login) |
| Records | http://localhost:3000/records | Document explorer |
| Ask AI | http://localhost:3000/ask-ai | AI chat interface |
| Groups | http://localhost:3000/groups | Groups & sharing |
| Profile | http://localhost:3000/profile | Settings & access log |
| Backend root | http://localhost:8000 | `{"status": "ArogyaVault backend running"}` |
| Backend API docs | http://localhost:8000/docs | FastAPI Swagger — 3 auth endpoints visible |
| AI service root | http://localhost:8001 | `{"status": "ArogyaVault AI service running"}` |
| AI service docs | http://localhost:8001/docs | FastAPI Swagger — health endpoint |

---

## 3-Layer Component Architecture

The web app uses a deliberate three-layer hierarchy. Never skip layers — always import from the appropriate level.

```
Layer 1 — core/primitives    Typed semantic HTML wrappers (typography, layout, surface)
     ↓
Layer 2 — core/ui            shadcn/ui component library (46 pre-built components)
     ↓
Layer 3 — components/        Composite sections and page-level components
```

### Layer 1: `src/core/primitives/`

Thin, typed wrappers around raw HTML that enforce consistent Tailwind defaults. Imported everywhere — sections, pages, layout.

| File | Exports |
|---|---|
| `typography.tsx` | `H1`, `H2`, `H3`, `H4`, `Text`, `Lead`, `Muted`, `Small`, `Large`, `Eyebrow`, `Highlight`, `InlineCode` |
| `layout.tsx` | `Container` (sm/default/lg/full), `Section`, `Stack`, `Row`, `Grid`, `Flex`, `Banner`, `Divider` |
| `surface.tsx` | `Surface` (variant + padding props), `GradientBadge`, `GlassCard` |
| `index.ts` | Barrel — `import { H2, Container, Surface } from "@/core/primitives"` |

### Layer 2: `src/core/ui/`

All 46 shadcn/ui components. Already committed — no CLI needed. Import via barrel or individual file.

```tsx
import { Button } from "@/core/ui/button";               // single
import { Button, Card, Badge, Input } from "@/core/ui";  // barrel
```

### Layer 3: `src/components/`

Composite components built on Layers 1 + 2. Split into three sub-folders:

| Sub-folder | Purpose |
|---|---|
| `components/layout/` | `Navbar`, `Footer`, `PageWrapper` |
| `components/ui/` | Reusable blocks: `SectionHeader`, `FeatureCard`, `StepCard`, `StatCard`, `TestimonialCard`, `FaqItem`, `PageHero` |
| `components/sections/` | Full-width page sections reused across all 7 marketing pages |

### Reusing section data across pages

Section components export both the component **and** the underlying data array. Import the data array directly when you only need a subset:

```tsx
import { FeaturesSection, ALL_FEATURES } from "@/components/sections/features-section";
import { FaqSection, ALL_FAQS } from "@/components/sections/faq-section";

// Use the full section
<FeaturesSection limit={6} />

// Or access the raw data
const firstThree = ALL_FEATURES.slice(0, 3);
```

---

## Static Marketing Pages

All 7 pages live in `src/app/(marketing)/` — a Next.js App Router route group. They share a single layout that wraps every page with `<Navbar>` and `<Footer>`.

| Route | File | Key sections |
|---|---|---|
| `/` | `(marketing)/page.tsx` | Hero → Stats → Features(6) → HowItWorks → Groups → Security → Testimonials → FAQ(4) → CTA |
| `/features` | `(marketing)/features/page.tsx` | PageHero → FeaturesSection → document type badges → CTA |
| `/how-it-works` | `(marketing)/how-it-works/page.tsx` | PageHero → HowItWorksSection → upload tips → GroupsSection → CTA |
| `/security` | `(marketing)/security/page.tsx` | PageHero → SecuritySection → compliance badges → privacy principles → CTA |
| `/about` | `(marketing)/about/page.tsx` | PageHero → mission + stats → 6 values → milestone timeline → team + hiring → Testimonials → CTA |
| `/faq` | `(marketing)/faq/page.tsx` | PageHero → category nav → FaqSection (all 8) → 4 additional FAQs → support contacts → CTA |
| `/contact` | `(marketing)/contact/page.tsx` | PageHero → 4 contact channel cards → ContactFormSection (react-hook-form + zod) → office info |

### Navigation links (Navbar)

Home · Features · How It Works · Security · About · FAQ · Contact + **Register** CTA button (primary)

### Adding a new marketing page

1. Create the folder: `src/app/(marketing)/your-page/`
2. Create `page.tsx` with `export const metadata` and `export default function YourPage()`
3. The `(marketing)/layout.tsx` automatically wraps it with Navbar + Footer
4. Add the nav link to `NAV_LINKS` in `src/components/layout/navbar.tsx` if needed

---

## shadcn/ui — Component Library Setup

All 46 shadcn/ui components live in `apps/web/src/core/ui/`. They are **already committed** — no CLI needed.

### How components are organised

| Path | Purpose |
|---|---|
| `src/core/ui/` | All 46 shadcn/ui components |
| `src/core/ui/index.ts` | Barrel export — import anything from `@/core/ui` |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/providers/theme-provider.tsx` | next-themes wrapper |
| `src/app/globals.css` | Tailwind v4 `@theme inline` + light/dark CSS vars |
| `components.json` | shadcn config (points to `src/core/ui`, style: new-york) |

### Dark / Light theme

Theme is controlled by `next-themes`. The `<ThemeProvider>` is in `layout.tsx`.

Default is `light`. Toggle with:

```tsx
import { useTheme } from "next-themes";
const { theme, setTheme } = useTheme();
setTheme(theme === "dark" ? "light" : "dark");
```

**CSS variables** are defined in `globals.css`:
- Light: `#0D3B5E` ArogyaVault navy as `--primary`
- Dark: lighter blue `oklch(0.65 0.12 242)` as `--primary`

### How to use components

```tsx
// Single import
import { Button } from "@/core/ui/button";

// Or barrel import (multiple at once)
import { Button, Card, CardHeader, Badge, Input } from "@/core/ui";
```

### Adding a new shadcn component (future)

If a new component ships in shadcn after this setup, you can add it via:

```powershell
# From apps/web directory
npx shadcn@latest add <component-name>
```

shadcn will detect `components.json` and place the file in `src/core/ui/` automatically. Then add it to `src/core/ui/index.ts`.

---

## What Each Package Contains

### `packages/shared-types`

TypeScript interfaces used by both `apps/web` and `packages/api-client`.

Key types: `User`, `UserRole`, `MedicalDocument`, `DocumentCategory`, `DocumentStatus`, `Group`, `GroupMember`, `LinkRequest`, `AuthTokens`, `OtpRequest`, `OtpVerify`, `ApiResponse<T>`

### `packages/api-client`

Typed fetch wrapper (`apiFetch<T>`) with base URL config. Sprint 3 will auto-generate this from the FastAPI OpenAPI spec.

### `packages/utils`

Shared helpers:
- `formatPhone(phone)` — formats `+919876543210` → `+91 98765 43210`
- `formatDate(dateString)` — formats to `28 Mar 2026`
- `truncate(text, maxLength)` — trims with ellipsis
- `titleCase(str)` — capitalises each word
- `categoryLabel(category)` — converts `lab_report` → `Lab Report`

---

## Sprint 0 Auth Endpoints (Placeholder)

Scaffolded and visible at `/docs`. Real implementation in Sprint 1.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/send-otp` | Trigger AWS Cognito → SMS OTP |
| POST | `/auth/verify-otp` | Verify OTP → create user if new → return JWT |
| POST | `/auth/refresh` | Silent token refresh |

---

## Environment Variables Reference

All keys are in `.env.example`. Copy to `.env` and fill in per sprint.

| Variable | Used by | Sprint needed |
|---|---|---|
| `AWS_REGION` | backend, ai-service | Sprint 1 |
| `COGNITO_USER_POOL_ID` | backend | Sprint 1 |
| `COGNITO_CLIENT_ID` | backend | Sprint 1 |
| `DATABASE_URL` | backend, ai-service | Sprint 1 |
| `REDIS_URL` | backend | Sprint 1 |
| `NEXT_PUBLIC_API_URL` | web | Sprint 1 |
| `S3_BUCKET_NAME` | backend, ai-service | Sprint 2 |
| `OPENAI_API_KEY` | ai-service | Sprint 2 |

---

## What Is and Is NOT in Git

| Path | In Git? | Why |
|---|---|---|
| `node_modules/` | ❌ No | Restored by `npm install` |
| `.venv/` | ❌ No | Recreated locally — OS-specific binaries |
| `.env` | ❌ No | Contains secrets — never commit |
| `.turbo/` | ❌ No | Local build cache |
| `apps/mobile/build/` | ❌ No | Generated Flutter build output |
| `apps/mobile/pubspec.lock` | ✅ Yes | Locks exact Flutter dependency versions |
| `package-lock.json` | ✅ Yes | Locks exact npm dependency versions |
| `apps/*/requirements.txt` | ✅ Yes | Defines Python dependencies |
| `.env.example` | ✅ Yes | Template with all keys (no real values) |
| All source code | ✅ Yes | |

---

## Common Issues & Fixes

| Problem | Fix |
|---|---|
| `pip install` installs to user folder, not venv | Make sure `.venv\Scripts\activate` is run first — prompt must show `(.venv)` |
| numpy build fails on Python 3.13 | Use `numpy>=2.0.0,<3.0.0` — numpy 1.x has no Python 3.13 Windows wheel |
| `langchain-openai` openai conflict | Requires `openai>=1.58.1` — do not pin `openai==1.52.0` or lower |
| Turbo not found | Run `npm install` from the repo root, not from inside an app folder |
| `flutter pub get` fails | Run `flutter doctor` to confirm Flutter SDK is correctly installed |
| Port already in use | Kill the process using the port: `netstat -ano \| findstr :3000`, then `taskkill /PID <pid> /F` |

---

## Sprint Progress

| Sprint | Status | What it adds |
|---|---|---|
| Sprint 0 — Monorepo Scaffolding | ✅ Done | Folder structure, Turborepo config, shared packages, Python apps, Flutter scaffold |
| Sprint 0 — shadcn/ui + Theme | ✅ Done | 46 shadcn/ui components in `core/ui/`, dark/light theme via next-themes, Tailwind v4 CSS vars |
| Sprint 0 — 3-Layer Components | ✅ Done | `core/primitives` (typography, layout, surface), `components/layout`, `components/ui`, `components/sections` |
| Sprint 0 — Static Marketing Site | ✅ Done | 7 pages: Home, Features, How It Works, Security, About, FAQ, Contact — all component-based |
| Sprint 0 — Auth + Liveboard UI | ✅ Done | Sign In (OTP flow), app shell (header/sidebar/bottom bar), 5 authenticated pages with dummy data |
| Sprint 1 — Auth + Database | ⬜ Next | AWS Cognito OTP, RDS PostgreSQL schema, JWT middleware |
| Sprint 2 — Document Upload + AI | ⬜ | S3 upload, GPT-4o extraction, vector embeddings |
| QA + CI/CD + Docker | ⬜ | Tests, containers, GitHub Actions pipeline |
| Sprint 3 — AI Q&A + Analytics | ⬜ | RAG pipeline, health analytics APIs |
| Sprint 4 — Web Portal (App) | ⬜ | Authenticated dashboard, document upload UI, AI Q&A chat |
| Sprint 5 — Flutter Mobile | ⬜ | Android + iOS app |
| Sprint 6 — Production Deploy | ⬜ | AWS ECS, CloudFront, Vercel |

---

## Pending / Deferred Items

| Item | Notes |
|---|---|
| QR / Patient Card print page | Explicitly deferred — build after Sprint 1 auth is wired up |
| `npm install` (new deps) | Run from repo root to install react-hook-form, zod, @hookform/resolvers, and all shadcn Radix peers |
| Python venv population | Run `pip install -r apps\backend\requirements.txt` and `pip install -r apps\ai-service\requirements.txt` after activating `.venv` |
| ABDM integration | Roadmap item — Sprint 4+ |
| Multi-language UI | Roadmap item — Hindi + regional languages |

---

*Say **"Start Sprint 1"** to begin the database schema and AWS Cognito authentication implementation.*
