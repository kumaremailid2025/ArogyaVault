# ArogyaVault Web — Frontend Architecture

This document defines the layered component architecture used across the
ArogyaVault web application. **Every code change must follow this pattern.**

---

## Layer Model

```
Page  →  Container  →  Component  →  Core UI
```

| Layer         | Location                                    | Responsibility                                                                 |
|---------------|---------------------------------------------|--------------------------------------------------------------------------------|
| **Page**      | `src/app/**/page.tsx`                       | Route entry point. Layout shell only — imports and renders Containers and shared Components. **No business logic, no forms, no hooks beyond minimal step/routing state.** |
| **Container** | `src/components/containers/<feature>/*.tsx`  | Owns **all** business logic for a feature slice — state, effects, form handling, API calls, derived values. Composes Components and Core UI elements into a working form / view. Each container is a self-contained unit that receives callbacks from the page (e.g. `onSuccess`, `onStepChange`). Containers are grouped by feature in sub-folders. |
| **Component** | `src/components/shared/*.tsx`               | Reusable, **stateless** (or locally-stateful) presentational building blocks — `InputGroup`, `StepIndicator`, `SearchBar`, etc. They know nothing about the business domain. Can be used by any page or container. |
| **Core UI**   | `src/core/ui/*.tsx`                         | Lowest-level design-system primitives — `Button`, `Input`, `Label`, `Dialog`, `Form*`, etc. Thin wrappers around Radix UI / shadcn. Never import from upper layers. |

### Visual example (Sign-In flow)

```
src/app/(auth)/sign-in/page.tsx                        ← Page (layout + step routing)
  │
  ├─ components/containers/sign-in/
  │    ├─ trust-panel.tsx                               ← Container (trust panel content)
  │    ├─ mobile-number-container.tsx                   ← Container (phone form logic)
  │    └─ otp-container.tsx                             ← Container (OTP form logic)
  │
  ├─ components/shared/
  │    ├─ step-indicator.tsx                            ← Component (generic multi-step dots)
  │    └─ input-group.tsx                               ← Component (left-input-right pattern)
  │
  └─ core/ui/
       ├─ button.tsx                                    ← Core UI
       ├─ input.tsx                                     ← Core UI
       ├─ form.tsx                                      ← Core UI
       └─ input-otp.tsx                                 ← Core UI
```

---

## Rules

1. **Pages never own logic.** If you need `useState`, `useEffect`, `useForm`,
   or an API call, it belongs in a Container — not the page. The page's only
   state is for step/route switching.

2. **Containers are feature-scoped and grouped by feature.** Place them in
   `src/components/containers/<feature>/` (e.g. `containers/sign-in/`,
   `containers/records/`). They communicate upward via callback props
   (`onSuccess`, `onBack`, etc.).

3. **Components are domain-agnostic.** A `<StepIndicator>` or `<InputGroup>`
   should work equally well for sign-in, onboarding, or checkout. If it knows
   about "phone numbers" or "OTPs", it's a Container, not a Component.

4. **Core UI is the design system.** These are the shadcn/Radix primitives.
   They never import from `components/` or `app/`.

5. **Data & config live in `lib/`.** Validation schemas, country configs,
   API helpers, and utilities go in `src/lib/` (e.g. `countries.ts`,
   `utils.ts`).

---

## Adding a new feature — checklist

1. Create a **feature folder** under `src/components/containers/<feature>/`.
2. Add one or more **Containers** in that folder, each owning a slice of logic.
3. If the container needs a reusable visual pattern, create (or reuse) a
   **Component** in `src/components/shared/`.
4. Wire the containers into the **Page** via props / callbacks.
5. Keep **Core UI** changes rare — only when the design system itself evolves.

---

## Folder structure

```
src/
├── app/                              # Next.js App Router (pages & layouts)
│   └── (auth)/sign-in/page.tsx       # Page — thin wrapper
│
├── components/
│   ├── containers/                   # Feature-scoped containers
│   │   └── sign-in/
│   │       ├── mobile-number-container.tsx
│   │       ├── otp-container.tsx
│   │       └── trust-panel.tsx
│   │
│   └── shared/                       # Reusable domain-agnostic components
│       ├── input-group.tsx
│       ├── step-indicator.tsx
│       ├── search-bar.tsx
│       └── smart-input.tsx
│
├── core/ui/                          # Design-system primitives (shadcn)
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   └── ...
│
└── lib/                              # Utilities, config, schemas
    ├── countries.ts
    └── utils.ts
```

---

## File naming

| Layer     | Convention                         | Example                              |
|-----------|------------------------------------|--------------------------------------|
| Page      | `page.tsx` (Next.js)               | `sign-in/page.tsx`                   |
| Container | `kebab-case-container.tsx`         | `mobile-number-container.tsx`        |
| Container | `kebab-case.tsx` (non-logic panel) | `trust-panel.tsx`                    |
| Component | `kebab-case.tsx`                   | `step-indicator.tsx`                 |
| Core UI   | `kebab-case.tsx`                   | `input-otp.tsx`                      |
| Lib       | `kebab-case.ts`                    | `countries.ts`                       |

---

*Last updated: 2026-04-03*
