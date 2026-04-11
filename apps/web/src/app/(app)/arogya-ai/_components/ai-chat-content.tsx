"use client";

/**
 * @file ai-chat-content.tsx
 * @packageDocumentation
 * @category Components
 *
 * AiChatContent — the AI Chat tab page content.
 *
 * Extracted from the old monolithic `ArogyaAiContainer` so the shell
 * layout and routing live separately. Handles:
 *  - Landing state (no conversation yet)
 *  - Active conversation with message bubbles
 *  - `?q=` deep-link from the app bottom bar
 *  - `?session=` deep-link from the sessions panel
 *  - Right-side AI context panel (360 px, always visible on this tab)
 *
 * All interactive elements use core UI primitives. No raw `<button>`.
 */

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BrainCircuitIcon,
  FileTextIcon,
  LoaderIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { ScrollArea } from "@/core/ui/scroll-area";
import Typography from "@/components/ui/typography";
import { SmartInput } from "@/components/shared/smart-input";
import { AskAiLanding } from "@/components/ai/ask-ai-landing";
import { AiContextPanel } from "@/components/ai/ai-context-panel";
import { useAiContext } from "@/data/ai-context-data";
import type { ConversationMessage, AiMessage } from "@/data/ai-conversations";
import type { SmartInputSubmitPayload } from "@/models/input";
import { useSendAiMessage } from "@/hooks/api";

/* ═══════════════════════════════════════════════════════════════════
   BUBBLE
═══════════════════════════════════════════════════════════════════ */

/**
 * Props for {@link Bubble}.
 * @category Types
 */
interface BubbleProps {
  /** Conversation message to render. */
  msg: ConversationMessage;
}

/**
 * Bubble
 * ──────
 * Renders a single message in the AI Chat thread.
 * User messages align right; AI messages align left with an icon avatar.
 *
 * @param props - {@link BubbleProps}
 */
const Bubble = ({ msg }: BubbleProps) => {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
          <BrainCircuitIcon className="size-3.5" />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted border border-border rounded-tl-sm"
        )}
      >
        <Typography variant="body" color={isUser ? "inverse" : "default"}>
          {msg.text}
        </Typography>

        {/* Bullet list (AI messages only) */}
        {"list" in msg && msg.list && (
          <ul className="mt-2 space-y-1">
            {msg.list.map((item, j) => (
              <li key={j} className="flex items-start gap-1.5">
                <Typography variant="body" as="span" color={isUser ? "inverse" : "primary"}>•</Typography>
                <Typography variant="body" as="span" color={isUser ? "inverse" : "default"}>{item}</Typography>
              </li>
            ))}
          </ul>
        )}

        {/* Source document citations */}
        {"citations" in msg && msg.citations && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {msg.citations.map((c, j) => (
              <Badge
                key={j}
                variant="outline"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <FileTextIcon className="size-3 shrink-0" />{c}
              </Badge>
            ))}
          </div>
        )}

        {/* Footnote / disclaimer */}
        {"note" in msg && msg.note && (
          <Typography
            variant="caption"
            color="muted"
            className="border-t border-border/50 pt-2 mt-2 italic"
          >
            {msg.note}
          </Typography>
        )}
      </div>
      {isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border mt-0.5">
          <Typography variant="micro" weight="bold" as="span">KU</Typography>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */

/**
 * AiChatContent
 * ─────────────
 * AI Chat tab — landing + conversation view + right context panel.
 *
 * Reads two URL params on mount:
 * - `?q=` — pre-fill and submit a question (from the app bottom bar).
 * - `?session=` — load a saved session (from the sessions panel).
 *
 * @example
 * ```tsx
 * // Rendered by /arogya-ai/page.tsx
 * <AiChatContent />
 * ```
 */
export const AiChatContent = () => {
  const { CHAT_SESSIONS, SMART_SUGGESTIONS } = useAiContext();
  const askAi        = useSendAiMessage();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [messages, setMessages]   = React.useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = React.useState("");
  const isTyping = askAi.isPending;

  const hasConversation = messages.length > 0;
  const bottomRef       = React.useRef<HTMLDivElement>(null);
  const processedQ      = React.useRef("");
  const processedSess   = React.useRef("");

  /* Auto-scroll ─────────────────────────────────────────────────── */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Core send helper ──────────────────────────────────────────── */

  /**
   * Append a user message and request an AI reply.
   * @param text - The user's message text.
   */
  const addToConversation = React.useCallback((text: string) => {
    const userMsg: ConversationMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    askAi.mutate(
      { query: text },
      {
        onSuccess: (res) => {
          const aiMsg: AiMessage = {
            role: "ai",
            text: res.text,
            list: res.list,
            citations: res.citations,
            note: res.note,
          };
          setMessages((prev) => [...prev, aiMsg]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: "Sorry, I couldn't process that. Please try again." },
          ]);
        },
      }
    );
  }, [askAi]);

  /* ── ?q= deep-link (from bottom bar) ──────────────────────────── */
  const incomingQ = searchParams.get("q") ?? "";
  React.useEffect(() => {
    if (incomingQ && incomingQ !== processedQ.current) {
      processedQ.current = incomingQ;
      addToConversation(incomingQ);
      router.replace("/arogya-ai");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQ]);

  /* ── ?session= deep-link (from sessions panel) ─────────────────── */
  const incomingSession = searchParams.get("session") ?? "";
  React.useEffect(() => {
    if (incomingSession && incomingSession !== processedSess.current) {
      processedSess.current = incomingSession;
      const session = CHAT_SESSIONS.find((s) => s.id === incomingSession);
      if (!session) return;
      setMessages([{ role: "user", text: session.preview }]);
      askAi.mutate(
        { query: session.preview },
        {
          onSuccess: (res) => {
            const aiMsg: AiMessage = {
              role: "ai",
              text: res.text,
              list: res.list,
              citations: res.citations,
              note: res.note,
            };
            setMessages((prev) => [...prev, aiMsg]);
          },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingSession]);

  /** Handles SmartInput form submission. */
  const handleInputSubmit = (payload: SmartInputSubmitPayload) => {
    const text = payload.text.trim();
    if (!text) return;
    addToConversation(text);
    setInputText("");
  };

  return (
    <div className="flex-1 overflow-hidden flex min-h-0">

      {/* ── CHAT COLUMN (flex-1) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {!hasConversation ? (
          /* Landing state */
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 pt-2 pb-4">
                <AskAiLanding onAsk={addToConversation} />
              </div>
            </ScrollArea>
            <div className="shrink-0 px-4 pb-3">
              <SmartInput
                value={inputText}
                onChange={setInputText}
                onSubmit={handleInputSubmit}
                placeholder="Ask ArogyaAI about your health records…"
                submitLabel="Ask"
                disabled={isTyping}
                modes={["text", "voice", "image", "attach"]}
                autoFocus
                maxRows={4}
                layout="chat"
              />
            </div>
          </>
        ) : (
          /* Conversation state */
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="max-w-2xl mx-auto flex flex-col gap-4 py-4 px-4">
                {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                      <BrainCircuitIcon className="size-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted border border-border flex items-center gap-2 text-muted-foreground">
                      <LoaderIcon className="size-3.5 animate-spin" />
                      <Typography variant="body" color="muted">ArogyaAI is thinking…</Typography>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="shrink-0 px-4 pb-3">
              {!isTyping && messages.length <= 4 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SMART_SUGGESTIONS.slice(0, 4).map((s) => (
                    <Button
                      key={s.text}
                      variant="outline"
                      size="sm"
                      onClick={() => addToConversation(s.text)}
                      className="rounded-full h-auto py-1 text-[11px] text-muted-foreground"
                    >
                      {s.text}
                    </Button>
                  ))}
                </div>
              )}
              <SmartInput
                value={inputText}
                onChange={setInputText}
                onSubmit={handleInputSubmit}
                placeholder="Ask a follow-up question…"
                submitLabel="Ask"
                disabled={isTyping}
                modes={["text", "voice", "image", "attach"]}
                autoFocus={false}
                maxRows={5}
                layout="chat"
              />
            </div>
          </>
        )}
      </div>

      {/* ── RIGHT — AI context panel (360 px, chat tab only) ───── */}
      <div className="w-[360px] shrink-0 border-l border-border overflow-hidden">
        <AiContextPanel onAsk={addToConversation} />
      </div>
    </div>
  );
};
