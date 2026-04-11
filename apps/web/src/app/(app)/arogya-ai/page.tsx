"use client";

/**
 * @file page.tsx  (/arogya-ai)
 * @packageDocumentation
 * @category Pages
 *
 * Root ArogyaAI page — the AI Chat tab.
 *
 * Renders {@link AiChatContent} which provides:
 *  - Landing state (no conversation)
 *  - Active conversation with message bubbles
 *  - `?q=` deep-link pre-fill from the app bottom bar
 *  - `?session=` deep-link to load a saved session
 *  - Right-side AI context panel (360 px)
 */

import * as React from "react";
import { AiChatContent } from "./_components/ai-chat-content";

/**
 * ArogyaAiPage
 * ────────────
 * Entry point for the AI Chat tab (`/arogya-ai`).
 * Wrapped by {@link ArogyaAiShell} via `layout.tsx`.
 */
const ArogyaAiPage = (): React.ReactElement => <AiChatContent />;

export default ArogyaAiPage;
