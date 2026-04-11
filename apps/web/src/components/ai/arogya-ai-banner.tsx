"use client";

/**
 * @file arogya-ai-banner.tsx
 * @packageDocumentation
 * @category Components
 *
 * Banner for all `/arogya-ai` routes.
 * Mirrors the community `CommunityBanner` pattern — tabs are `<Link>` elements
 * so navigation is handled by the router rather than component state.
 * The active tab is derived by the parent shell from `usePathname()` and
 * passed in as a prop.
 */

import * as React from "react";
import Link from "next/link";
import { BotIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { useVaultHealth } from "@/data/vault-health-data";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

/**
 * Discriminated union of all ArogyaAI tab keys.
 * Each key maps 1-to-1 to a URL segment under `/arogya-ai`.
 *
 * @category Types
 */
export type AiTab = "ai-chat" | "files" | "history" | "companion";

/**
 * Tab descriptor — key, label, and the href rendered as a `<Link>`.
 *
 * @category Types
 */
interface AiTabDef {
  /** Tab key matching {@link AiTab}. */
  readonly key: AiTab;
  /** Display label shown in the banner. */
  readonly label: string;
  /** Next.js href for `<Link>`. */
  readonly href: string;
}

/**
 * Props for {@link ArogyaAiBanner}.
 *
 * @category Types
 */
interface ArogyaAiBannerProps {
  /**
   * The currently active tab, derived from `usePathname()` by the shell.
   * Used only to apply the active pill style — navigation is handled by the router.
   */
  activeTab: AiTab;
  /** Number of saved chat sessions; shown as a badge when > 0. */
  sessionCount: number;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════ */

/**
 * Ordered tab definitions.
 * Each `href` corresponds to a Next.js App Router route under `/arogya-ai`.
 */
const TABS: readonly AiTabDef[] = [
  { key: "ai-chat",   label: "AI Chat",     href: "/arogya-ai"           },
  { key: "files",     label: "Files",       href: "/arogya-ai/files"     },
  { key: "history",   label: "History",     href: "/arogya-ai/history"   },
  { key: "companion", label: "ArogyaMitra", href: "/arogya-ai/companion" },
];

/**
 * Description copy shown on the second banner row, keyed by active tab.
 */
const TAB_DESCRIPTION: Record<AiTab, string> = {
  "ai-chat":   "Your personal health AI — ask anything about your medical records, lab results, and medications.",
  "files":     "Explore your uploaded health documents and get AI-powered answers from each file.",
  "history":   "Browse your past conversations and pick up where you left off.",
  "companion": "ArogyaMitra — your trusted companion for wellness, emotional support, and personal growth.",
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */

/**
 * ArogyaAiBanner
 * ──────────────
 * Full-width banner rendered at the top of the ArogyaAI content area.
 * Contains icon, title, document/session badges, and Link-based tab pills.
 *
 * @param props - {@link ArogyaAiBannerProps}
 *
 * @example
 * ```tsx
 * <ArogyaAiBanner activeTab={activeTab} sessionCount={3} />
 * ```
 */
export const ArogyaAiBanner = React.memo(
  ({ activeTab, sessionCount }: ArogyaAiBannerProps) => {
    const { VAULT_FILES } = useVaultHealth();

    return (
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">

          {/* Row 1 — Icon · Title · Badges · Tab pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <BotIcon className="size-5" />
            <Typography variant="h5" as="span" color="inverse" className="font-bold">ArogyaAI</Typography>

            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              {VAULT_FILES.length} documents analyzed
            </Badge>
            {sessionCount > 0 && (
              <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
                {sessionCount} conversations
              </Badge>
            )}

            {/* Link-based tab pills — right-aligned */}
            <div className="ml-auto flex items-center gap-0.5">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={t.href}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    activeTab === t.key
                      ? "bg-white/25 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground"
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Row 2 — Contextual description */}
          <Typography variant="body" color="inverse" className="mt-2 opacity-80">
            {TAB_DESCRIPTION[activeTab]}
          </Typography>
        </div>
      </div>
    );
  }
);

ArogyaAiBanner.displayName = "ArogyaAiBanner";
