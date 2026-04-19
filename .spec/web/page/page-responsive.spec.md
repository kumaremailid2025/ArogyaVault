# Page Responsive Spec

**Status:** Active
**Applies to:** Every authenticated route under `apps/web/src/app/(app)/**`
**Owner:** Web platform
**Last updated:** 2026-04-19

> Companion specs:
> - `.spec/web/page/page-layout.spec.md` — the four regions this spec rearranges.
> - `.spec/web/page/page-loader.spec.md` — loader skeletons must match the breakpoint being rendered.

---

## 1. Purpose

The four regions defined in `page-layout.spec.md` — **Header**, **Left Panel**,
**Main Content**, **Right Panel** — adapt to viewport width. This spec defines
the three responsive states, the navigation affordances that appear / disappear
with them (hamburger, back arrow, hover-reveal), and the rules that keep
behaviour predictable across pages.

Regions are always named by role, never by screen position. A region can slide,
stack, or overlay at smaller widths, but its **source of truth and data
contract do not change**.

---

## 2. Breakpoints

Tailwind's default breakpoints are used. Three layout states:

| State       | Breakpoint     | What is visible by default                         |
|-------------|----------------|----------------------------------------------------|
| **Desktop** | `≥ lg`         | All four regions visible side by side.             |
| **Medium**  | `md` to `< lg` | Header + Main Content + Right Panel. Left Panel is hidden; revealed by hamburger + hover. |
| **Small**   | `< md`         | Header + **one** of Main Content *or* Right Panel at a time. Left Panel is hidden behind the hamburger. |

### 2.1 Desktop (`≥ lg`)

- All four regions rendered in their canonical positions.
- Left Panel: fixed width (e.g. `w-60`).
- Right Panel: fixed width (e.g. `w-[360px]`).
- Main Content: `flex-1 min-w-0`.
- **No hamburger button.** The Left Panel is already on screen.
- **No back arrows** in Main Content or Right Panel headers.

### 2.2 Medium (`md` to `< lg`)

- Left Panel is hidden by default.
- A **hamburger button** appears in the Header at the far left.
- Hovering the hamburger (or the left edge of the viewport) **reveals the
  Left Panel as an overlay** that slides in from the left, on top of the
  Main Content. Moving the pointer away collapses it again.
- Clicking the hamburger **latches** the Left Panel open until the user
  clicks outside it or selects an item. (Selecting an item updates the URL
  and auto-closes the overlay.)
- Main Content + Right Panel remain side by side, unchanged.
- The Main Content header MUST include a **`←` (left-arrow) button** that
  opens the Left Panel overlay — this is the keyboard- and touch-friendly
  equivalent of the hover reveal. On desktop (`lg+`) this arrow is hidden.
- **While the Left Panel overlay is open, the hamburger is hidden** — the
  user is already in the Left Panel. Closing the overlay restores the
  hamburger.

### 2.3 Small (`< md`)

- Only **one** of Main Content or Right Panel is on screen at a time.
- Default view is **Main Content**.
- Clicking a card in Main Content navigates (URL push) to the card-detail
  route; the view swaps to **Right Panel full-screen**.
- Right Panel renders a **`←` (back-arrow) button at the top** that returns
  to Main Content (URL pop / replace to the selection-less route).
- Main Content still includes the `←` arrow to open the Left Panel (same
  as medium state). When the Left Panel overlay is open, the hamburger is
  hidden, per §2.2.
- Left Panel overlay, when opened, covers the full viewport (minus the
  Header). Selecting an item updates the URL, closes the overlay, and the
  Main Content renders for that selection.

---

## 3. Navigation affordances

The three affordances that appear/disappear responsively:

| Affordance                   | Shown when                                      | Action                                                  |
|------------------------------|-------------------------------------------------|---------------------------------------------------------|
| Hamburger button (Header)    | `< lg` **and** Left Panel overlay is CLOSED     | Click: latch Left Panel open. Hover: reveal overlay.    |
| `←` in Main Content header   | `< lg`                                          | Open the Left Panel overlay.                            |
| `←` in Right Panel header    | `< md` **and** Right Panel is rendering a card-detail view | Navigate back to Main Content (URL → selection-less). |

### 3.1 Rules

- The hamburger and the Left Panel overlay are **mutually exclusive** —
  exactly one is on screen in the medium/small states.
- The Main Content `←` arrow is **always visible** below `lg`, regardless of
  whether the Left Panel overlay is open (because Main Content is the
  "home" view the user returns to after selecting from the Left Panel or
  closing the Right Panel).
- The Right Panel `←` arrow is **only visible at `< md`**, and only when
  the Right Panel is showing a selected-card detail (not the default
  view).

---

## 4. Interaction contracts

### 4.1 Hover-reveal of the Left Panel

- The Left Panel overlay animates in from the left (`translate-x` +
  opacity). Transition duration ~150 ms. Respect
  `prefers-reduced-motion`.
- Hover hit area: the hamburger button **plus** a narrow strip along the
  left edge of the viewport (~8 px). Both dismiss on `pointerleave` from
  the overlay.
- Click (not hover) latches. Latched state is cleared by:
  - Clicking outside the overlay.
  - Selecting an item (URL changes).
  - Pressing `Esc`.
- On touch devices (no hover), only the click/tap path applies — the
  hamburger toggles the overlay.

### 4.2 Card click → Right Panel

- Card click ALWAYS goes through `router.push` to the card-scoped URL, per
  `page-layout.spec.md` §3.4. Responsive behaviour is CSS + conditional
  affordances only.
- At `< md`, the Right Panel uses `absolute inset-0` (or a dedicated
  full-screen treatment) to occupy the Main Content slot. The Main
  Content beneath it MAY stay mounted (preserve scroll position) or
  unmount — choose per feature based on data cost.
- The `←` back arrow in the Right Panel MUST call `router.back()` or
  `router.push` the selection-less URL — whichever leaves a cleaner
  history. Prefer the selection-less URL so repeated back presses don't
  bounce through intermediate card states.

### 4.3 State ownership

- None of the responsive states (overlay open/closed, latched/hovered,
  Main-or-Right on small screens) are mirrored into React state that
  survives a route change. Overlay open/close MAY live in a local
  `useState`; the selected card MUST remain URL-driven.
- The page component NEVER owns viewport-size-branching logic via
  `window.innerWidth`. Regions adapt via CSS (Tailwind responsive
  classes). Only navigation affordances (the hamburger, the back arrows)
  are conditionally rendered with Tailwind utility classes
  (`lg:hidden`, `md:hidden`, etc.).

---

## 5. Layout-shift rules

- All four regions MUST handle `overflow-hidden` + their own internal
  scroll; the page root MUST NOT produce a page-level scrollbar.
- Switching between the desktop / medium / small states MUST NOT cause
  content to reflow vertically. Widths change; heights do not.
- The Header height is stable across all breakpoints.
- The Left Panel overlay (medium/small) sits **on top of** Main Content;
  Main Content does not shrink when the overlay opens.

---

## 6. Accessibility

- The hamburger button has `aria-label="Open menu"` when closed,
  `aria-label="Close menu"` when the overlay is latched.
- The Left Panel overlay has `role="dialog"` with `aria-modal="true"`
  when latched. Focus is trapped inside while latched; `Esc` closes.
- The `←` arrows have an `aria-label` describing the destination
  (`"Back to list"`, `"Open menu"`).
- The overlay MUST be reachable by keyboard: `Tab` into the hamburger,
  `Enter` to open, `Tab` through items, `Esc` to close.

---

## 7. Checklist for a new page

Before opening a PR for a new page under `(app)/`, confirm all of:

- [ ] At `≥ lg`, all four regions render side by side with no hamburger
      and no back arrows.
- [ ] At `md`–`< lg`, the Left Panel is hidden; a hamburger in the Header
      opens it (hover-reveal + click-latch); a `←` in the Main Content
      header does the same; the hamburger is hidden while the overlay is
      latched.
- [ ] At `< md`, only Main Content *or* Right Panel is on screen; card
      click swaps to Right Panel with a `←` back arrow at the top; the
      Main Content still offers its `←` for the Left Panel.
- [ ] All responsive behaviour comes from Tailwind classes, not
      `window.innerWidth`.
- [ ] No page-level scrollbar at any breakpoint.
- [ ] Keyboard + screen reader behaviour matches §6.
- [ ] Loader skeletons (`page-loader.spec.md`) match the live page at
      the current breakpoint.
