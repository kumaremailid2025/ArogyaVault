"use client";

/**
 * @file layout.tsx  (/arogya-ai)
 * @packageDocumentation
 * @category Layouts
 *
 * Root layout for all `/arogya-ai/*` routes.
 *
 * Wraps every page in {@link ArogyaAiShell} which provides:
 *  - Left sessions panel (260 px)
 *  - {@link ArogyaAiBanner} with Link-based tab navigation
 *  - `{children}` — the active route page
 *
 * Metadata is defined here so it applies to the entire ArogyaAI section.
 */

import * as React from "react";
import { ArogyaAiShell } from "./_components/arogya-ai-shell";

/**
 * Props for {@link ArogyaAiLayout}.
 * @category Types
 */
interface ArogyaAiLayoutProps {
  /** Active route page content. */
  children: React.ReactNode;
}

/**
 * ArogyaAiLayout
 * ──────────────
 * Root layout for the ArogyaAI section.
 * Renders {@link ArogyaAiShell} around all child route pages.
 *
 * @param props - {@link ArogyaAiLayoutProps}
 */
const ArogyaAiLayout = ({ children }: ArogyaAiLayoutProps): React.ReactElement => (
  <ArogyaAiShell>{children}</ArogyaAiShell>
);

export default ArogyaAiLayout;
