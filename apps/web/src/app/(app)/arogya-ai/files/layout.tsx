"use client";

/**
 * @file layout.tsx  (/arogya-ai/files)
 * @packageDocumentation
 * @category Layouts
 *
 * Layout for all `/arogya-ai/files/*` routes.
 *
 * Wraps `{children}` with {@link AiFilesLayoutContent} which provides
 * the permanent left-panel file list (260 px) plus a flex-1 right panel
 * driven by the active sub-route.
 */

import * as React from "react";
import { AiFilesLayoutContent } from "../_components/ai-files-layout-content";

/**
 * Props for {@link AiFilesLayout}.
 * @category Types
 */
interface AiFilesLayoutProps {
  /** Active sub-route page rendered in the right panel. */
  children: React.ReactNode;
}

/**
 * AiFilesLayout
 * ─────────────
 * Shared layout for the Files section of ArogyaAI.
 * Renders {@link AiFilesLayoutContent} (left file list + right children).
 *
 * @param props - {@link AiFilesLayoutProps}
 */
const AiFilesLayout = ({ children }: AiFilesLayoutProps): React.ReactElement => (
  <AiFilesLayoutContent>{children}</AiFilesLayoutContent>
);

export default AiFilesLayout;
