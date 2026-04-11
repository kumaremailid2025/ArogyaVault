"use client";

/**
 * @file page.tsx  (/arogya-ai/companion)
 * @packageDocumentation
 * @category Pages
 *
 * ArogyaMitra companion page.
 *
 * Layout: two-column — {@link AiCompanionView} (flex-1) on the left,
 * {@link AiContextPanel} (360 px fixed) on the right, matching every
 * other tab in the ArogyaAI section.
 *
 * The video session overlay inside AiCompanionView uses `absolute inset-0`
 * scoped to its own column — it does not cover the right context panel.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { AiCompanionView } from "@/components/ai/ai-companion-view";
import { AiContextPanel } from "@/components/ai/ai-context-panel";

/**
 * AiCompanionPage
 * ───────────────
 * Two-column layout: ArogyaMitra companion (flex-1) + AiContextPanel (360px).
 *
 * `onAsk` from the context panel routes to the AI Chat tab with the
 * question pre-filled via `?q=`.
 */
const AiCompanionPage = (): React.ReactElement => {
  const router = useRouter();

  /**
   * Pre-fill the AI Chat input from the context panel.
   * @param question - Question text to pass as a `?q=` param.
   */
  const handleAsk = (question: string) => {
    router.push(`/arogya-ai?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="flex-1 overflow-hidden flex min-h-0">

      {/* ── LEFT — ArogyaMitra companion (flex-1) ───────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0 relative">
        <AiCompanionView />
      </div>

      {/* ── RIGHT — AI context panel (360px, matches other tabs) ── */}
      <div className="w-[360px] shrink-0 border-l border-border overflow-hidden">
        <AiContextPanel onAsk={handleAsk} />
      </div>

    </div>
  );
};

export default AiCompanionPage;
