# ArogyaVault — Agent Guide

A Turborepo monorepo for ArogyaVault, a health records platform.

## Workspaces

- `apps/web` — Next.js (App Router, TypeScript) — primary user surface.
- `apps/backend` — FastAPI (Python) — main API. Routers for auth, groups,
  community, invite, vault, appdata, mocks. Redis-backed sessions.
- `apps/ai-service` — FastAPI (Python) — document OCR + RAG Q&A pipeline.
  A `services_new/` directory exists alongside `services/` — mid-refactor;
  confirm with the user before editing either.
- `apps/mobile` — Flutter (scaffold only).
- `packages/api-client`, `packages/shared-types`, `packages/utils` —
  shared TS packages.

## Architecture docs — READ BEFORE EDITING

These are the authoritative specs for how the codebase is organised. Any
non-trivial change MUST conform to them.

- **`apps/web/ARCHITECTURE.md`** — Frontend layering: Page → Container →
  Component → Core UI. Enforces where logic lives, file naming, and
  feature-folder structure.
- **`.spec/web/page/page-layout.spec.md`** — Four-region page contract
  (Header / Left Panel / Main Content / Right Panel) used across
  **every** authenticated route under `apps/web/src/app/(app)/**`.
  Defines the four-phase load sequence, URL-as-source-of-truth, and
  last-selected retention.
- **`.spec/web/page/page-loader.spec.md`** — `loading.tsx` contract:
  a skeleton matching the four-region grid MUST paint on the first
  frame after any URL change inside `(app)/`. Per-segment loaders, no
  spinners, no data fetching.
- **`.spec/web/page/page-responsive.spec.md`** — Breakpoint behaviour:
  desktop (all regions visible) / medium (hamburger + hover-reveal of
  Left Panel) / small (single-region, back arrows). The hamburger is
  hidden while the Left Panel overlay is latched.

Consult these three specs before designing a new page or retouching an
existing one.

## Spec folder

`.spec/` holds cross-cutting contracts that are too broad to live inside
any single feature folder. Add new specs here when the decision applies
to multiple features or sets an app-wide convention. Specs are grouped
by surface (`.spec/web/…`, `.spec/mobile/…`) and then by concern
(`.spec/web/page/…`). Each spec is a `<topic>.spec.md` file.

Current specs:

- `.spec/web/page/page-layout.spec.md` — four regions, load phases, URL
  source of truth, last-selected retention.
- `.spec/web/page/page-loader.spec.md` — per-segment `loading.tsx`
  contract; immediate-on-navigation skeletons.
- `.spec/web/page/page-responsive.spec.md` — breakpoint behaviour,
  hamburger + hover-reveal, single-region small-screen navigation.

## Conventions cheat sheet

- Frontend pages are thin (`src/app/**/page.tsx`). Business logic lives
  in feature-scoped containers under
  `apps/web/src/components/containers/<feature>/`.
- URL is the source of truth for left-panel and main-card selection —
  never mirror it into independent state.
- Every `(app)/` route segment ships a `loading.tsx` whose skeleton
  reproduces the four-region grid. Loaders do NOT fetch data.
- Python services use FastAPI; config via Pydantic settings in
  `apps/<service>/app/core/config.py`.
- Environment variables are documented in `.env.example` at the repo
  root.

## Running locally

- `npm run dev` — Turbo runs all workspaces in parallel.
- `docker-compose up` — spins up the backend + Redis locally.
- Env: copy `.env.example` → `.env` at the repo root.
