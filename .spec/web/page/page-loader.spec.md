# Page Loader Spec

**Status:** Active
**Applies to:** Every authenticated route under `apps/web/src/app/(app)/**`
**Owner:** Web platform
**Last updated:** 2026-04-19

> Companion specs:
> - `.spec/web/page/page-layout.spec.md` — the four-region layout this loader reproduces.
> - `.spec/web/page/page-responsive.spec.md` — the breakpoint behaviour the loader must match.

---

## 1. Purpose

When the user navigates to a new route or sub-route, **something must appear
on screen immediately** so the user knows the new view is loading. We do not
wait for data; we paint a structural skeleton of the destination page in its
final shape, on the very first frame after the URL changes.

This spec governs:

1. **When** a loader is shown — every URL change inside `(app)/`.
2. **What** the loader looks like — the same four-region grid the destination
   page will render.
3. **How** the loader is wired — Next.js `loading.tsx` per route segment.

Why this matters: a loader that matches the four-region grid eliminates layout
shift at the segment boundary and makes navigation feel instant even when the
underlying data is still in flight. A generic centered spinner, by contrast,
collapses the layout and flashes content into place — a noticeable regression
the user will feel on every click.

---

## 2. Trigger — show the loader IMMEDIATELY on URL change

The loader MUST appear on the **first frame** after a URL change, before any
data fetch begins. This is the contract:

- Any navigation that crosses a route boundary inside `(app)/` MUST render the
  destination segment's `loading.tsx` until the matching server component
  resolves. This is Next.js' default behaviour for `loading.tsx`; this spec
  forbids defeating it.
- "URL change" includes:
  - Top-level page navigation (e.g. `/community` → `/records`).
  - Left Panel selection changes (e.g. `/community` → `/community/<groupId>`).
  - Main Content card selection (e.g. `/community/<g>/post/42`).
  - Tab switches inside a feature (e.g. `/community` → `/community/files`).
- The loader MUST NOT wait on data, settings, or auth — it is purely
  structural.
- The loader MUST NOT use a global "page loading" spinner. Each region
  signals its own pending state via its own skeleton inside the loader.

### 2.1 Forbidden patterns

- ❌ Suspending the whole page on a single network call so the previous page
  stays on screen.
- ❌ Centered spinners that occupy the entire viewport.
- ❌ Returning `null` from `loading.tsx`.
- ❌ Conditional loaders that depend on cache hit / miss before rendering.

---

## 3. Per-segment loader — `loading.tsx`

Every route segment under `(app)/` MUST ship a `loading.tsx` whose skeleton
**reproduces the same four-region layout the live page will render**.

### 3.1 Where loaders live

A `loading.tsx` MUST be present at every route level that fetches data or
renders a new region. For a feature with the URL shape

```
/<feature>/[leftSelection]/<mainResource>/[cardId]
```

the canonical loader files are:

```
(app)/<feature>/loading.tsx                               — feature shell + default Main
(app)/<feature>/<mainResource>/loading.tsx                — section list + default Right
(app)/<feature>/<mainResource>/[cardId]/loading.tsx       — card-detail Right Panel skeleton
(app)/<feature>/[leftSelection]/loading.tsx               — same set, scoped to a Left selection
(app)/<feature>/[leftSelection]/<mainResource>/loading.tsx
(app)/<feature>/[leftSelection]/<mainResource>/[cardId]/loading.tsx
```

A new feature MUST add the equivalent set. If a segment renders no new
region (e.g. a passthrough group), the loader can fall through to the parent.

### 3.2 What the loader contains

The loader's outer shell MUST match the live page's region grid at the
breakpoint it is rendered at. At desktop widths, that means Header on top,
Left Panel on the left, Main Content in the middle, Right Panel on the right
— even if some of those regions are provided by parent layouts and so only
need their *slots* sized correctly.

Each region inside the loader renders a **region-specific skeleton**:

- **Header** — skeleton bars matching the title / banner shape (only when the
  loader is at the level that owns the header — usually a parent layout).
- **Left Panel** — a fixed-count list of skeleton rows (e.g., 6 rows) sized
  to the real item.
- **Main Content** — card-shaped skeletons matching the card height used by
  that section (post card, file card, member card).
- **Right Panel** — skeleton matching the **default** right-panel view for
  that section (not the selected-card detail view), unless the loader is
  specifically for a card-detail route.

### 3.3 Authoring rules

- Loaders MUST NOT fetch data.
- Loaders MUST NOT import containers, providers, or anything client-only.
- Loaders are plain Server Components — no `"use client"`, no hooks.
- Loaders MUST respect the same `overflow-hidden` / internal-scroll rules
  as the live page (see `page-layout.spec.md` and
  `page-responsive.spec.md`).
- Skeletons use Tailwind's `animate-pulse` + `bg-muted` tones. No spinners
  inside a loader page.
- Keep each loader under ~80 lines; if it grows, factor shared skeletons
  into `components/shared/skeletons/*.tsx`.

### 3.4 Reference shape

```tsx
// apps/web/src/app/(app)/<feature>/loading.tsx
export default function Loading(): React.ReactElement {
  return (
    <div className="h-full flex min-h-0 overflow-hidden">
      {/* Left Panel skeleton (visible at lg+; see page-responsive.spec.md) */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-border p-3 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
        ))}
      </aside>

      {/* Main Content skeleton */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </main>

      {/* Right Panel skeleton — matches the DEFAULT view, not a detail */}
      <aside className="hidden lg:flex w-[360px] shrink-0 border-l border-border p-4 flex-col gap-3">
        <div className="h-6 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-40 rounded-lg bg-muted animate-pulse" />
      </aside>
    </div>
  );
}
```

---

## 4. Loader-vs-region-loading split

There are two distinct kinds of "loading" in the app — do not conflate them:

| Kind                    | When it shows                                | Where it lives                          |
|-------------------------|----------------------------------------------|------------------------------------------|
| **Navigation loader**   | URL change → before the server segment paints | `loading.tsx` at the segment boundary    |
| **In-region skeleton**  | A region's data refetches inside a stable URL | Inside the container component itself    |

Both use the same skeleton building blocks; the difference is *who renders
them*. Navigation loaders are owned by route segments; in-region skeletons are
owned by the region's container.

A page that has just been navigated to therefore renders, in order:

1. The `loading.tsx` (navigation loader) — frame 1.
2. The page's server component once it resolves — replaces the loader.
3. Inside that page, individual containers may render their own
   in-region skeletons while their queries are pending.

---

## 5. Checklist for a new loader

Before opening a PR that adds a new route segment under `(app)/`, confirm:

- [ ] A `loading.tsx` exists at the new segment.
- [ ] The loader's outer grid matches the live page at the same breakpoint.
- [ ] Each region renders its own region-specific skeleton (no shared
      generic spinner).
- [ ] The Right Panel skeleton matches the **default** view, unless the
      route is a card-detail route.
- [ ] No data fetching, no hooks, no `"use client"` in the loader.
- [ ] `animate-pulse` + `bg-muted` only — no spinners.
- [ ] Loader is under ~80 lines; shared skeletons factored out if not.
