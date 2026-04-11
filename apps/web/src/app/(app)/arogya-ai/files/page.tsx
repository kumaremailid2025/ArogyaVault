"use client";

/**
 * @file page.tsx  (/arogya-ai/files)
 * @packageDocumentation
 * @category Pages
 *
 * The default "Files" overview page — shown when no file is selected.
 *
 * Renders {@link AiFilesOverviewPanel} inside a `h-full` wrapper so the
 * internal `ScrollArea` fills the 360 px right panel correctly.
 *
 * Selecting a file navigates to `/arogya-ai/files/[fileId]`.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { AiFilesOverviewPanel } from "@/components/ai/ai-files-view";
import { useVaultHealth } from "@/data/vault-health-data";

/**
 * AiFilesPage
 * ───────────
 * Overview of all vault files rendered in the right panel of the
 * two-column files layout when no specific file is selected.
 */
const AiFilesPage = (): React.ReactElement => {
  const router                           = useRouter();
  const { VAULT_FILES, FILE_QA_HISTORY } = useVaultHealth();

  /**
   * Navigate to the selected file's detail route.
   * @param id - Numeric file ID.
   */
  const handleSelectFile = (id: number) => {
    router.push(`/arogya-ai/files/${id}`);
  };

  return (
    /* h-full ensures ScrollArea inside AiFilesOverviewPanel fills the panel */
    <div className="h-full overflow-hidden">
      <AiFilesOverviewPanel
        files={VAULT_FILES}
        qaHistory={FILE_QA_HISTORY}
        onSelectFile={handleSelectFile}
      />
    </div>
  );
};

export default AiFilesPage;
