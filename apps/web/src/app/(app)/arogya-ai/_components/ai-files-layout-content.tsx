"use client";

/**
 * @file ai-files-layout-content.tsx
 * @packageDocumentation
 * @category Containers
 *
 * AiFilesLayoutContent — two-column layout shell for all `/arogya-ai/files/*` routes.
 *
 * Mirrors `FilesLayoutContent` from the community section:
 *  - **Left panel (260 px)** — {@link AiFilesListPanel} with search + file list.
 *    Selection state is derived from `usePathname()` so the active file is
 *    always in sync with the URL.
 *  - **Right panel (flex-1)** — `{children}` rendered by the active sub-route
 *    (`/files` → overview, `/files/[fileId]` → detail).
 *
 * Navigation is URL-driven:
 *  - Clicking a file calls `router.push('/arogya-ai/files/${id}')`.
 *  - Navigating away clears the selection automatically (via pathname).
 */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AiFilesListPanel } from "@/components/ai/ai-files-view";

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */

/**
 * Extract the selected file ID from the current pathname.
 * Returns `null` when on the root `/arogya-ai/files` route.
 *
 * @param pathname - Value from `usePathname()`.
 * @returns The numeric file ID, or `null` if no file is selected.
 *
 * @example
 * deriveSelectedFileId("/arogya-ai/files/3") // → 3
 * deriveSelectedFileId("/arogya-ai/files")   // → null
 */
const deriveSelectedFileId = (pathname: string): number | null => {
  const match = pathname.match(/\/files\/(\d+)/);
  return match ? Number(match[1]) : null;
};

/* ═══════════════════════════════════════════════════════════════════
   PROPS
═══════════════════════════════════════════════════════════════════ */

/**
 * Props for {@link AiFilesLayoutContent}.
 * @category Types
 */
interface AiFilesLayoutContentProps {
  /** Nested route content rendered in the right panel. */
  children: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */

/**
 * AiFilesLayoutContent
 * ────────────────────
 * Two-column layout for `/arogya-ai/files/*` routes.
 *
 * Layout:
 * ```
 * ┌──────────────────────────────────────────────────────────┐
 * │  AiFilesListPanel (260px) │  {children} (flex-1)          │
 * └──────────────────────────────────────────────────────────┘
 * ```
 *
 * @param props - {@link AiFilesLayoutContentProps}
 *
 * @example
 * ```tsx
 * // Used in files/layout.tsx
 * <AiFilesLayoutContent>{children}</AiFilesLayoutContent>
 * ```
 */
export const AiFilesLayoutContent = ({ children }: AiFilesLayoutContentProps): React.ReactElement => {
  const pathname      = usePathname();
  const router        = useRouter();
  const selectedFileId = deriveSelectedFileId(pathname);

  /**
   * Navigate to the file detail route.
   * @param id - Numeric ID of the file to open.
   */
  const handleSelectFile = (id: number) => {
    router.push(`/arogya-ai/files/${id}`);
  };

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── LEFT — file list (flex-1, matches community pattern) ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <AiFilesListPanel
          selectedFileId={selectedFileId}
          onSelectFile={handleSelectFile}
        />
      </div>

      {/* ── Vertical divider ─────────────────────────────────────── */}
      <div className="w-px bg-border shrink-0" />

      {/* ── RIGHT — sub-route content (360px fixed, matches community) */}
      <div className="w-[360px] shrink-0 border-l border-border overflow-hidden flex flex-col">
        {children}
      </div>

    </div>
  );
};
