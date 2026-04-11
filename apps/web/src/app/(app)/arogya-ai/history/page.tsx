"use client";

/**
 * @file page.tsx  (/arogya-ai/history)
 * @packageDocumentation
 * @category Pages
 *
 * History page — full list of past ArogyaAI conversations.
 *
 * Layout: two-column — scrollable conversation list (flex-1) on the left,
 * {@link AiContextPanel} (360 px fixed) on the right, matching the chat tab.
 *
 * Clicking a session card navigates to `/arogya-ai?session=[id]`, which
 * causes {@link AiChatContent} to load and replay that session.
 *
 * All interactive elements use core UI primitives. No raw `<button>`.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquareIcon, ClockIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { ScrollArea } from "@/core/ui/scroll-area";
import Typography from "@/components/ui/typography";
import { AiContextPanel } from "@/components/ai/ai-context-panel";
import { useAiContext } from "@/data/ai-context-data";
import type { ChatSession } from "@/data/ai-context-data";

/* ═══════════════════════════════════════════════════════════════════
   SESSION CARD
═══════════════════════════════════════════════════════════════════ */

/**
 * Props for {@link SessionCard}.
 * @category Types
 */
interface SessionCardProps {
  /** The chat session to render. */
  session: ChatSession;
  /** Called when the user taps this card. */
  onClick: () => void;
}

/**
 * SessionCard
 * ───────────
 * Renders a single past-conversation row in the History list.
 *
 * Displays: title, preview snippet, topic tags, date, and message count.
 *
 * @param props - {@link SessionCardProps}
 */
const SessionCard = ({ session, onClick }: SessionCardProps): React.ReactElement => {
  const formattedDate = new Date(session.date).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="h-auto w-full flex-col items-stretch gap-0 rounded-xl border border-border bg-background p-4 text-left hover:border-primary/25 hover:shadow-sm transition-all"
    >
      {/* Row 1 — title + date */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <Typography variant="body" weight="medium" as="h3" className="flex-1 min-w-0 line-clamp-1">
          {session.title}
        </Typography>
        <Typography variant="micro" color="muted" as="span" className="shrink-0 flex items-center gap-1">
          <ClockIcon className="size-3" />
          {formattedDate}
        </Typography>
      </div>

      {/* Row 2 — preview */}
      <Typography variant="caption" color="muted" className="line-clamp-2 mb-2">
        {session.preview}
      </Typography>

      {/* Row 3 — tags + message count */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {session.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground">
            {tag}
          </Badge>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <MessageSquareIcon className="size-3 text-muted-foreground/60" />
          <Typography variant="micro" color="muted" as="span">
            {session.messageCount} messages
          </Typography>
        </span>
      </div>
    </Button>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */

/**
 * AiHistoryPage
 * ─────────────
 * Two-column layout: scrollable session list (flex-1) + AiContextPanel (360px).
 *
 * Tapping a {@link SessionCard} routes to `/arogya-ai?session=[id]`
 * which {@link AiChatContent} reads on mount to replay the session.
 */
const AiHistoryPage = (): React.ReactElement => {
  const router            = useRouter();
  const { CHAT_SESSIONS } = useAiContext();

  /**
   * Navigate to the AI Chat tab and load the selected session.
   * @param sessionId - ID of the session to resume.
   */
  const handleSelectSession = (sessionId: string) => {
    router.push(`/arogya-ai?session=${sessionId}`);
  };

  /**
   * Pre-fill the AI Chat input from the context panel.
   * @param question - Question text to pass as a `?q=` param.
   */
  const handleAsk = (question: string) => {
    router.push(`/arogya-ai?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="flex-1 overflow-hidden flex min-h-0">

      {/* ── LEFT — session list (flex-1) ────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto py-5 px-4 space-y-3">

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <Typography variant="h4" as="h2">All Conversations</Typography>
              {CHAT_SESSIONS.length > 0 && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {CHAT_SESSIONS.length}
                </Badge>
              )}
            </div>

            {/* Session list */}
            {CHAT_SESSIONS.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquareIcon className="size-7 text-muted-foreground/40" />
                </div>
                <div>
                  <Typography variant="h5" weight="semibold">No conversations yet</Typography>
                  <Typography variant="caption" color="muted" className="mt-1">
                    Start chatting with ArogyaAI and your conversations will appear here.
                  </Typography>
                </div>
              </div>
            ) : (
              CHAT_SESSIONS.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => handleSelectSession(session.id)}
                />
              ))
            )}

          </div>
        </ScrollArea>
      </div>

      {/* ── RIGHT — AI context panel (360px, matches chat tab) ───── */}
      <div className="w-[360px] shrink-0 border-l border-border overflow-hidden">
        <AiContextPanel onAsk={handleAsk} />
      </div>

    </div>
  );
};

export default AiHistoryPage;
