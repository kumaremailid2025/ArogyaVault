# Page Layout Spec

**Status:** Active
**Applies to:** Every authenticated route under `apps/web/src/app/(app)/**`
**Owner:** Web platform
**Last updated:** 2026-04-19

> Companion specs:
> - `.spec/web/page/page-loader.spec.md` — `loading.tsx` contract (per-route, immediate-on-navigation skeletons that reproduce this layout).
> - `.spec/web/page/page-responsive.spec.md` — how the four regions adapt across breakpoints (hamburger + hover, single-region small-screen, back arrows).

---

## 1. Purpose

Every page in the authenticated app follows the same four-region layout and the
same progressive load sequence. This spec is the single source of truth for how
those regions relate, what data each one owns, and in what order they paint.
It exists so that:

- Users get a fast first paint (header is always on-screen instantly).
- Navigation state is URL-driven, deep-linkable, and shareable.
- Page behaviour is predictable — learning one page teaches you all of them.

This spec does **not** replace `apps/web/ARCHITECTURE.md` (the Page → Container
→ Component → Core UI layering). It sits on top of it. Layering tells you
*where code lives*; this spec tells you *how a page is composed and loads*.

---

## 2. Four regions

Every page is composed of four regions. Regions are named by role, not by
screen position — their position can rearrange at smaller breakpoints
(see `page-responsive.spec.md`). Names are canonical and MUST be used in
code and docs.

| Region           | Role                                                                 | Source of truth                     |
|------------------|----------------------------------------------------------------------|-------------------------------------|
| **Header**       | Global app chrome. User info, global nav, page title / banner.       | Auth/session cache (no network).    |
| **Left Panel**   | The page's primary *list* — scoped nav / items to choose from.       | Server data, keyed on user/session. |
| **Main Content** | The cards / rows / detail for whichever Left Panel item is selected. | URL param from Left Panel.          |
| **Right Panel**  | Detail / contextual info for whichever Main Content card is selected — OR a sensible default tied to the Left Panel selection if no card is chosen yet. | URL param from Main Content (falls back to default). |

### 2.1 What goes where — checklist

A piece of UI belongs in the region whose **source of truth** matches its data:

- Needs user identity only → **Header**.
- Needs "what is the user looking at right now" (a group, a tab, a folder) →
  **Left Panel**.
- Needs "what list / grid does that selection produce" → **Main Content**.
- Needs "what are the details of the item the user just clicked in Main" →
  **Right Panel**.

If a piece of UI needs data from two regions, it lives in the *upper* region
(closer to Header) and passes data down via URL or context.

---

## 3. Load sequence

The page paints in **four phases**. Phases are strict: phase N MUST NOT block
phase N-1, and MUST NOT start its own network work until the selection input
from phase N-1 is resolved.

```
t=0   Header paints             (no network — auth cache)
t=1   Left Panel fetches        → auto-select / restore → URL update
t=2   Main Content fetches      (keyed by Left Panel selection)
       + Right Panel renders its default for that selection
t=3   User clicks a card        → URL update → Right Panel swaps to detail
```

### 3.1 Phase 0 — Header (instant)

- Rendered from the session/user cache that is written at sign-in. MUST NOT
  block on any fetch.
- If user identity is missing, the auth guard redirects before this layout
  ever mounts. The Header therefore assumes `user` is defined.

### 3.2 Phase 1 — Left Panel (fast)

- Left Panel fires exactly one primary query on mount. While pending, it
  shows a skeleton sized to the final layout (no layout shift).
- On resolve:
  1. If the URL already names a valid selection → keep it.
  2. Else if a **last-selected** value exists (see §5) and is still valid →
     restore it and `router.replace` the URL.
  3. Else → pick the first item and `router.replace` the URL.
- Use `replace` not `push` for auto-selection so the back button doesn't
  bounce the user to a selection-less URL.

### 3.3 Phase 2 — Main Content + Right Panel default

- Main Content reads the selection from the URL and fires its own query
  (scoped to that selection).
- Right Panel, in parallel, renders its **default view** for the same
  selection — e.g., "nothing selected yet — here's a summary / tips /
  empty state". It MUST NOT require a Main Content card to be selected.
- Main Content and Right Panel queries run in parallel; Right Panel MUST
  NOT wait on Main Content.

### 3.4 Phase 3 — Main Content card selected

- User clicks a card in Main Content → handler `router.push`es the
  card-scoped URL.
- Right Panel observes the URL and swaps from default → card detail.
- Main Content keeps its current scroll position and highlights the active
  card via the `isActive` prop.
- Clicking the same card again is a **toggle**: URL goes back to the
  selection-less form, Right Panel returns to default.

---

## 4. URL as the source of truth

The URL is the canonical state for both the Left Panel selection and the
Main Content card selection. State in React context / stores is a
**derivation** of the URL, never the other way round.

### 4.1 URL shape

```
/<feature>/[leftSelection]/[mainResource]/[cardId]
```

### 4.2 Rules

- The left-panel selection MUST appear before the main-resource segment.
- Card segments MUST be nested under the main-resource segment, never the
  other way around.
- Changing a higher segment MUST `replace`/`push` a new URL; lower-level
  state (card id) MUST NOT leak across higher-level changes.

---

## 5. Last-selected retention

When the user returns to a page without a selection in the URL, we restore
their previous selection.

- Storage: `localStorage` under the key `arogyavault.lastSelected.<feature>`.
- Write: every successful phase-1 URL resolution writes the new selection.
- Read: phase 1 reads this before falling back to "first item".
- Invalidation: if the stored value no longer exists in the phase-1 query
  result, fall back to first item and clear the stored value.
- SSR: guard all reads behind `typeof window !== "undefined"`.

This mechanism is page-scoped. It intentionally does NOT sync across tabs
or devices — URL sharing remains the primary mechanism for cross-surface
handoff.

---

## 6. Loading, empty, and error states

Each region owns its own loading / empty / error states.

- **Loading:** skeleton that preserves final layout size. No spinners
  inside the region's content area — spinners are only for background
  refreshes triggered by user action. (For navigation-triggered loaders,
  see `page-loader.spec.md`.)
- **Empty:** friendly illustration or hint text + a single clear
  call-to-action.
- **Error:** inline error card with retry. Never crash the whole page;
  never throw up to the global error boundary unless the region is
  entirely unrecoverable.

A region's error MUST NOT break the regions below it in the load
sequence. If Main Content fails, Right Panel still renders its default.
If Left Panel fails, Main Content shows a "Select something on the
left" empty state.

---

## 7. Checklist for a new page

Before opening a PR for a new page under `(app)/`, confirm all of:

- [ ] Page file is thin — only layout wiring and route-step state. No
      business logic, no forms, no hooks beyond `useParams` /
      `usePathname` / minor UI state. (Per `ARCHITECTURE.md`.)
- [ ] Header is rendered by `(app)/layout.tsx` — no per-page duplication.
- [ ] Left Panel renders a skeleton (not a spinner, not nothing) while
      loading.
- [ ] On load, Left Panel auto-selects per §3.2 and `router.replace`s the
      URL.
- [ ] Main Content reads its selection exclusively from the URL.
- [ ] Right Panel renders a default for the current Left Panel selection
      even when no Main card is selected.
- [ ] Clicking a Main card calls `router.push`, not a local `useState`.
- [ ] Clicking the same Main card again toggles back to the default URL.
- [ ] Each region owns its own loading / empty / error UI (§6).
- [ ] Last-selected retention wired per §5 where applicable.
- [ ] A `loading.tsx` exists at the segment level per
      `page-loader.spec.md`.
- [ ] Responsive behaviour matches `page-responsive.spec.md`; no
      viewport-size branching in the page component.
- [ ] `apps/web/ARCHITECTURE.md` layering is respected (Page → Container
      → Component → Core UI).

---

## 8. Glossary

- **Page** — Next.js route file under `src/app/**/page.tsx`. Thin.
- **Layout** — Next.js layout file that wraps child routes. Renders the
  Header and (when stable across sub-routes) the Left Panel.
- **Region** — One of Header / Left Panel / Main Content / Right Panel.
- **Phase** — One of the four load phases in §3.
- **Selection** — The URL-encoded choice that drives the region below it
  (Left selection → Main; Main card → Right).
