import type { ReactNode } from "react";

/**
 * Shared types and constants for the community module.
 *
 * @packageDocumentation
 * @category Types
 *
 * @remarks
 * This file holds the "shape" contracts for the community module: the
 * tab / variant string unions, the right-panel state machine, and the
 * static group routing maps used by every community layout to resolve
 * a URL segment back to a canonical slug.
 *
 * Nothing in here performs side effects — it is safe to import from
 * both server components (layouts) and client components.
 */

/* ══════════════════════════════════════════════════════════════════════
   TABS & VARIANTS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Active tab in the community view.
 *
 * Matches the three nested route segments under `/community` — `feed` is
 * the default and has no URL segment of its own.
 *
 * @category Types
 */
export type CommunityTab = "feed" | "files" | "members";

/**
 * Community view variant: own community or invited group.
 *
 * Drives header copy and a handful of visibility toggles.
 *
 * @category Types
 */
export type CommunityVariant = "community" | "invited";

/* ══════════════════════════════════════════════════════════════════════
   RIGHT-PANEL STATE MACHINE
   ══════════════════════════════════════════════════════════════════════ */

/**
 * State machine for the community right-hand panel.
 *
 * Discriminated union describing every content state the right-hand panel
 * can be in. Each variant is tagged with a `view` literal so consumers can
 * narrow without type assertions.
 *
 * The panel is a state-first surface (not a route) because its content
 * must persist as the user navigates between the main feed / files /
 * members tabs on the left.
 *
 * @category Types
 */
export type PanelState =
  /** Nothing selected — shows the default marketing / trust panel. */
  | { view: "default" }
  /** AI summary of a specific post. */
  | { view: "summary"; postId: number }
  /** Threaded replies for a specific post. */
  | { view: "replies"; postId: number }
  /**
   * Preview step in the reply flow — user is choosing between their
   * original text and two AI rephrasings before sending.
   */
  | {
      view: "reply-preview";
      postId: number;
      original: string;
      rephrasings: [string, string];
    }
  /** File metadata / preview for a specific file in the group. */
  | { view: "file-detail"; fileId: number }
  /** Ask-a-question flow scoped to a specific file. */
  | { view: "file-qa"; fileId: number }
  /** Member profile card / shared records for a specific member. */
  | { view: "member-detail"; memberId: string };

/* ══════════════════════════════════════════════════════════════════════
   BANNER CONFIG
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Badge pill shown in the community banner.
 *
 * A small pill rendered in the community banner alongside the title
 * (e.g. "3 members", "Family"). Optional icon is rendered to the left
 * of the label.
 *
 * @category Types
 */
export interface Badge {
  label: string;
  icon?: ReactNode;
}

/**
 * Single tab descriptor for the banner's tab row.
 *
 * Marked `readonly` because tab lists are built from frozen tuples.
 *
 * @category Types
 */
export interface BannerTab {
  /** The stable tab identifier. */
  readonly key: CommunityTab;
  /** Human-readable label shown in the banner. */
  readonly label: string;
  /** Absolute URL the tab navigates to when clicked. */
  readonly href: string;
}

/**
 * Complete banner configuration for the community banner.
 *
 * Built once per render by the community wrapper and handed to
 * `<CommunityBanner>` for rendering.
 *
 * @category Types
 */
export interface BannerConfig {
  /** Icon rendered in the circular badge on the left of the banner. */
  icon: ReactNode;
  /** Primary heading text (e.g. group name). */
  title: string;
  /** Pills rendered under the title. */
  badges: Badge[];
  /** Longer description / tagline below the title. */
  description: ReactNode;
  /** Tab row — must contain exactly the three `CommunityTab` keys. */
  tabs: readonly BannerTab[];
  /** Which tab is currently active. */
  activeTab: CommunityTab;
}

/* ══════════════════════════════════════════════════════════════════════
   ROUTE MAPS
   ----------------------------------------------------------------------
   These are routing aliases — not entity mock data. They map stable
   human-readable slugs ("ravi", "sharma") to the UUIDs used in URLs.
   They are deliberately kept module-level (not hook-based) because
   Next.js server components (layouts, route handlers) cannot call
   React hooks, and the alias set is identical for every user at the
   UI-routing level.
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Canonical routing table: UUID → slug mapping.
 *
 * Maps the opaque group UUIDs used in the URL to the short, human-readable
 * slug that the community UI displays. Only includes the statically-seeded
 * groups — dynamically created invite groups are not listed here and are
 * resolved by the UUID-regex fallback in {@link resolveGroupSlug}.
 *
 * @category Constants
 */
export const GROUP_UUID_MAP: Record<string, string> = {
  "b3a1f5d2-7e4c-4a8b-9f6e-1c2d3e4f5a6b": "community",
  "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a": "ravi",
  "a1b2c3d4-5e6f-7a8b-9c0d-e1f2a3b4c5d6": "sharma",
  "f9e8d7c6-5b4a-3210-fedc-ba9876543210": "priya",
};

/**
 * Inverse mapping: slug → UUID.
 *
 * @category Constants
 */
export const GROUP_SLUG_TO_UUID: Record<string, string> = Object.fromEntries(
  Object.entries(GROUP_UUID_MAP).map(([uuid, slug]) => [slug, uuid]),
);

/**
 * Set of invited group slugs.
 *
 * Slugs that represent invited groups (not the user's own community).
 * Used as a quick membership check when deciding which `CommunityVariant` to render.
 *
 * @category Constants
 */
export const INVITED_SLUGS: ReadonlySet<string> = new Set([
  "ravi",
  "sharma",
  "priya",
]);

/**
 * Regular expression for UUID validation.
 *
 * Matches canonical v4 UUIDs. Used by {@link resolveGroupSlug} to decide
 * whether an unknown `groupId` is a dynamically-created invite group (UUID)
 * or simply invalid.
 *
 * @internal
 * @category Constants
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a route `groupId` param to its community slug.
 *
 * Static seeded groups use short slugs (`"ravi"`, `"sharma"`, ...)
 * that are mapped via `GROUP_UUID_MAP`. Dynamically-created invite
 * groups use the UUID itself as their slug, so when the `groupId` is
 * already a UUID but isn't in the static map, we return it as-is.
 *
 * @param groupId - The group identifier from the URL route.
 * @returns The community slug, or null if the identifier is invalid.
 *
 * @remarks
 * Returns `null` when the input is falsy or not a recognisable group
 * identifier — callers should treat `null` as "404" and render the
 * not-found state.
 *
 * @category Helpers
 */
export const resolveGroupSlug = (
  groupId: string | undefined,
): string | null => {
  if (!groupId) return null;
  const staticSlug = GROUP_UUID_MAP[groupId];
  if (staticSlug) return staticSlug;
  if (UUID_REGEX.test(groupId)) return groupId;
  return null;
};
