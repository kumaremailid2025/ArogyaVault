"use client";

/**
 * @file page.tsx  (/arogya-ai/files/[fileId])
 * @packageDocumentation
 * @category Pages
 *
 * File detail page — shown when a specific vault file is selected.
 *
 * Renders {@link AiFileDetailPanel} which displays:
 *  - File metadata + category badge
 *  - AI summary card
 *  - Full Q&A thread for this file
 *  - Inline ask input (routes to `/arogya-ai?q=...`)
 *
 * If the file ID is invalid (not found in vault), falls back gracefully
 * to a "not found" state rather than crashing.
 */

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderOpenIcon } from "lucide-react";
import { AiFileDetailPanel } from "@/components/ai/ai-files-view";
import { useVaultHealth } from "@/data/vault-health-data";
import Typography from "@/components/ui/typography";
import { Button } from "@/core/ui/button";

/**
 * AiFileDetailPage
 * ────────────────
 * Detail view for a single vault file. Rendered in the right panel of
 * the two-column files layout when a file row is selected.
 *
 * Reads `params.fileId` from the URL, resolves it against `VAULT_FILES`,
 * and delegates rendering to {@link AiFileDetailPanel}.
 */
const AiFileDetailPage = (): React.ReactElement => {
  const params                           = useParams<{ fileId: string }>();
  const router                           = useRouter();
  const { VAULT_FILES, FILE_QA_HISTORY } = useVaultHealth();

  /** Resolve the file from the URL param. */
  const file = React.useMemo(
    () => VAULT_FILES.find((f) => f.id === Number(params.fileId)) ?? null,
    [VAULT_FILES, params.fileId]
  );

  /**
   * Route an ask-question action to the AI Chat tab.
   * @param question - Pre-filled question text.
   */
  const handleAsk = (question: string) => {
    router.push(`/arogya-ai?q=${encodeURIComponent(question)}`);
  };

  /* ── Fallback: file not found ─────────────────────────────────── */
  if (!file) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <FolderOpenIcon className="size-7 text-muted-foreground/40" />
        </div>
        <div>
          <Typography variant="h5" weight="semibold">File not found</Typography>
          <Typography variant="caption" color="muted" className="mt-1">
            This file may have been removed from your vault.
          </Typography>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/arogya-ai/files")}>
          Back to Files
        </Button>
      </div>
    );
  }

  return (
    <AiFileDetailPanel
      file={file}
      qaHistory={FILE_QA_HISTORY}
      onAsk={handleAsk}
    />
  );
};

export default AiFileDetailPage;
