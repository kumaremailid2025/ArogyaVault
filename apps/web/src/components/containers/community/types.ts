import type { ReactNode } from "react";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";

/* ═══════════════════════════════════════════════════════════════════
   SHARED TYPES & CONSTANTS — community wrapper
═══════════════════════════════════════════════════════════════════ */

/** Which tab is active in the community view */
export type CommunityTab = "feed" | "files" | "members";

/** Whether this is the main community or an invited group */
export type CommunityVariant = "community" | "invited";

/** Panel state machine — drives the right sidebar content */
export type PanelState =
  | { view: "default" }
  | { view: "summary"; postId: number }
  | { view: "replies"; postId: number }
  | { view: "reply-preview"; postId: number; original: string; rephrasings: [string, string] };

/** Banner configuration — built by the wrapper, rendered by CommunityBanner */
export interface BannerConfig {
  icon: ReactNode;
  title: string;
  badges: { label: string; icon?: ReactNode }[];
  description: ReactNode;
  tabs: readonly { readonly key: CommunityTab; readonly label: string; readonly href: string }[];
  activeTab: CommunityTab;
}

/* ── Route maps ────────────────────────────────────────────────── */

export const GROUP_UUID_MAP: Record<string, string> = {
  "b3a1f5d2-7e4c-4a8b-9f6e-1c2d3e4f5a6b": "community",
  "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a": "ravi",
  "a1b2c3d4-5e6f-7a8b-9c0d-e1f2a3b4c5d6": "sharma",
  "f9e8d7c6-5b4a-3210-fedc-ba9876543210": "priya",
};

export const GROUP_SLUG_TO_UUID: Record<string, string> = Object.fromEntries(
  Object.entries(GROUP_UUID_MAP).map(([uuid, slug]) => [slug, uuid]),
);

export const INVITED_SLUGS = new Set(["ravi", "sharma", "priya"]);
