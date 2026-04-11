"use client";

/**
 * @file arogya-ai-shell.tsx
 * @packageDocumentation
 * @category Containers
 *
 * ArogyaAiShell — layout wrapper for all `/arogya-ai` routes.
 *
 * Mirrors `CommunityShell` in structure:
 *  - Derives the active tab from `usePathname()` — no prop needed.
 *  - Renders the sessions sidebar (260 px, matches community sidebar width).
 *  - Renders `ArogyaAiBanner` with Link-based tab navigation.
 *  - Renders `{children}` (the active route page) below the banner.
 *
 * Session interactions (new chat, select session) use URL params so the
 * chat page can read them via `useSearchParams` without shared state.
 */

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAiContext } from "@/data/ai-context-data";
import { ArogyaAiBanner, type AiTab } from "@/components/ai/arogya-ai-banner";
import { ChatSessionsPanel } from "@/components/ai/chat-sessions-panel";

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════ */

/**
 * Derive the active {@link AiTab} from the current pathname.
 * Falls back to `"ai-chat"` for the root `/arogya-ai` route.
 *
 * @param pathname - Value from `usePathname()`.
 * @returns The matching `AiTab` key.
 *
 * @example
 * deriveAiTab("/arogya-ai/files/3") // → "files"
 * deriveAiTab("/arogya-ai")         // → "ai-chat"
 */
const deriveAiTab = (pathname: string): AiTab => {
  if (/\/files(\/|$)/.test(pathname))     return "files";
  if (/\/history(\/|$)/.test(pathname))   return "history";
  if (/\/companion(\/|$)/.test(pathname)) return "companion";
  return "ai-chat";
};

/* ═══════════════════════════════════════════════════════════════════
   PROPS
═══════════════════════════════════════════════════════════════════ */

/**
 * Props for {@link ArogyaAiShell}.
 * @category Types
 */
interface ArogyaAiShellProps {
  /** Nested route content rendered below the banner. */
  children: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */

/**
 * ArogyaAiShell
 * ─────────────
 * Root layout shell for all `/arogya-ai/*` routes.
 *
 * Layout:
 * ```
 * ┌──────────────────────────────────────────────────┐
 * │  Sessions (260px)  │  Banner (full width)         │
 * │                    │──────────────────────────────│
 * │                    │  {children} (active route)   │
 * └──────────────────────────────────────────────────┘
 * ```
 *
 * @param props - {@link ArogyaAiShellProps}
 */
export const ArogyaAiShell = ({ children }: ArogyaAiShellProps): React.ReactElement => {
  const pathname = usePathname();
  const router   = useRouter();
  const { CHAT_SESSIONS } = useAiContext();

  const activeTab = deriveAiTab(pathname);

  /**
   * Navigate to the AI Chat tab with the chosen session pre-loaded.
   * The chat page reads the `?session=` param on mount.
   *
   * @param sessionId - ID of the session to resume.
   */
  const handleSelectSession = (sessionId: string) => {
    router.push(`/arogya-ai?session=${sessionId}`);
  };

  /**
   * Navigate to the AI Chat tab with no session pre-loaded (fresh chat).
   */
  const handleNewChat = () => {
    router.push("/arogya-ai");
  };

  /**
   * Resolve the currently active session ID from the URL.
   * Only relevant when on the `/arogya-ai` route.
   */
  const activeSessionId: string | null = React.useMemo(() => {
    if (activeTab !== "ai-chat") return null;
    const match = pathname.match(/[?&]session=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }, [pathname, activeTab]);

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── LEFT — Sessions panel (260px, matches community sidebar) ── */}
      <div className="w-[260px] shrink-0 border-r border-border overflow-hidden flex flex-col">
        <ChatSessionsPanel
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
        />
      </div>

      {/* ── CONTENT — Banner + active-route children ─────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Banner spans the full content area */}
        <ArogyaAiBanner
          activeTab={activeTab}
          sessionCount={CHAT_SESSIONS.length}
        />

        {/* Below-banner: active route fills the remaining height */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};
