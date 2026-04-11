"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BrainCircuitIcon, FileTextIcon, LoaderIcon, SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartInput } from "@/components/shared/smart-input";
import { ArogyaAiBanner, type AiTab } from "@/components/ai/arogya-ai-banner";
import Typography from "@/components/ui/typography";
import { AskAiLanding } from "@/components/ai/ask-ai-landing";
import { useAiContext } from "@/data/ai-context-data";
import type { ChatSession } from "@/data/ai-context-data";
import type { ConversationMessage, AiMessage } from "@/data/ai-conversations";
import type { SmartInputSubmitPayload } from "@/models/input";
import { useSendAiMessage } from "@/hooks/api";

/* ── Sidebar panels — always visible in chat tab, static import ──── */
import { ChatSessionsPanel } from "@/components/ai/chat-sessions-panel";
import { AiContextPanel } from "@/components/ai/ai-context-panel";
import { AiFilesView } from "@/components/ai/ai-files-view";
import { AiCompanionView } from "@/components/ai/ai-companion-view";

/* ═══════════════════════════════════════════════════════════════════
   BUBBLE — conversation message
═══════════════════════════════════════════════════════════════════ */

const Bubble = ({ msg }: { msg: ConversationMessage }) => {
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
          "rounded-2xl px-4 py-3 max-w-[85%] text-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted border border-border rounded-tl-sm"
        )}
      >
        <Typography variant="body" color={isUser ? "inverse" : "default"}>{msg.text}</Typography>
        {"list" in msg && msg.list && (
          <ul className="mt-2 space-y-1">
            {msg.list.map((item, j) => (
              <li key={j} className="flex items-start gap-1.5 text-sm">
                <span className={isUser ? "text-primary-foreground/70" : "text-primary"}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {"citations" in msg && msg.citations && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {msg.citations.map((c, j) => (
              <span
                key={j}
                className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <FileTextIcon className="size-3 shrink-0" />{c}
              </span>
            ))}
          </div>
        )}
        {"note" in msg && msg.note && (
          <Typography variant="caption" color="muted" className="border-t border-border/50 pt-2 italic">
            {msg.note}
          </Typography>
        )}
      </div>
      {isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border mt-0.5 text-xs font-bold">
          KU
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   HISTORY VIEW — full-width list of past conversations
═══════════════════════════════════════════════════════════════════ */

const HistoryView = ({
  sessions,
  onSelectSession,
}: {
  sessions: ChatSession[];
  onSelectSession: (id: string) => void;
}) => {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-2">
      <Typography variant="h4" as="h2" className="px-1 mb-3">All Conversations</Typography>
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className="w-full text-left rounded-xl border border-border p-4 hover:border-primary/20 hover:shadow-sm transition-all bg-background cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Typography variant="body" weight="medium" as="h3">{session.title}</Typography>
              <Typography variant="caption" color="muted" truncate={true} className="mt-0.5">{session.preview}</Typography>
              <div className="flex items-center gap-1.5 mt-2">
                {session.tags.map((tag) => (
                  <Typography key={tag} variant="micro" color="muted" as="span" className="px-1.5 py-0.5 rounded-full bg-muted">
                    {tag}
                  </Typography>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <Typography variant="micro" color="muted" as="div">
                {new Date(session.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </Typography>
              <Typography variant="micro" color="muted" as="div" className="mt-0.5">{session.messageCount} messages</Typography>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN CONTAINER — orchestrates banner, three-column layout
═══════════════════════════════════════════════════════════════════ */

export const ArogyaAiContainer = () => {
  const { CHAT_SESSIONS, SMART_SUGGESTIONS } = useAiContext();
  const askAi = useSendAiMessage();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [activeTab, setActiveTab]           = React.useState<AiTab>("ai-chat");
  const [messages, setMessages]             = React.useState<ConversationMessage[]>([]);
  const [inputText, setInputText]           = React.useState("");
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const isTyping = askAi.isPending;

  const hasConversation = messages.length > 0;
  const bottomRef  = React.useRef<HTMLDivElement>(null);
  const processedQ = React.useRef("");

  /* ── Handle ?q= from bottom bar ─────────────────────────────────── */
  const incomingQ = searchParams.get("q") ?? "";

  React.useEffect(() => {
    if (incomingQ && incomingQ !== processedQ.current) {
      processedQ.current = incomingQ;
      setActiveTab("ai-chat");
      addToConversation(incomingQ);
      router.replace("/arogya-ai");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQ]);

  /* ── Auto-scroll ─────────────────────────────────────────────────── */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ── Conversation logic ──────────────────────────────────────────── */
  const addToConversation = (text: string) => {
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
            { role: "ai", text: "Sorry, I couldn't process that right now. Please try again." },
          ]);
        },
      }
    );
  };

  const handleInputSubmit = (payload: SmartInputSubmitPayload) => {
    const text = payload.text.trim();
    if (!text) return;
    addToConversation(text);
    setInputText("");
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText("");
    setActiveSessionId(null);
    setActiveTab("ai-chat");
  };

  const handleSelectSession = (sessionId: string) => {
    // In production this would load the session's messages from the backend
    const session = CHAT_SESSIONS.find((s) => s.id === sessionId);
    if (!session) return;
    setActiveSessionId(sessionId);
    setActiveTab("ai-chat");
    /* Load the session with the preview as the user message, then fetch
       the AI reply from the backend. */
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
  };

  const handleTabChange = (tab: AiTab) => {
    setActiveTab(tab);
  };

  /* ── Render ──────────────────────────────────────────────────────── */
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

      {/* ── CONTENT AREA — Banner spans full width, then (chat | context) below ── */}
      {/* Mirrors community-shell: flex-col → [Banner] [flex-1 flex row → content + right panel] */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Banner — full width of content area (sessions panel excluded) */}
        <ArogyaAiBanner
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sessionCount={CHAT_SESSIONS.length}
        />

        {/* Below-banner row: chat/history (flex-1) + context panel (360px) */}
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* ── CHAT / HISTORY / FILES / COMPANION ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {activeTab === "history" ? (
              /* ─── HISTORY TAB ─── */
              <div className="h-full overflow-y-auto px-5 lg:px-6">
                <HistoryView sessions={CHAT_SESSIONS} onSelectSession={handleSelectSession} />
              </div>
            ) : activeTab === "files" ? (
              /* ─── FILES TAB ─── */
              <AiFilesView onAsk={(q) => { addToConversation(q); setActiveTab("ai-chat"); }} />
            ) : activeTab === "companion" ? (
              /* ─── COMPANION TAB ─── */
              <AiCompanionView />
            ) : !hasConversation ? (
              /* ─── AI CHAT TAB — Landing state ─── */
              <>
                <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
                  <AskAiLanding onAsk={addToConversation} />
                </div>
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
              /* ─── AI CHAT TAB — Conversation state ─── */
              <>
                <div className="flex-1 overflow-y-auto px-4">
                  <div className="max-w-2xl mx-auto flex flex-col gap-4 py-4">
                    {messages.map((msg, i) => (
                      <Bubble key={i} msg={msg} />
                    ))}
                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                          <BrainCircuitIcon className="size-3.5" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted border border-border text-sm flex items-center gap-2 text-muted-foreground">
                          <LoaderIcon className="size-3.5 animate-spin" />
                          ArogyaAI is thinking…
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
                <div className="shrink-0 px-4 pb-3">
                  {!isTyping && messages.length <= 4 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {SMART_SUGGESTIONS.slice(0, 4).map((s) => (
                        <button
                          key={s.text}
                          onClick={() => addToConversation(s.text)}
                          className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
                        >
                          {s.text}
                        </button>
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

          {/* ── RIGHT — Context panel (360px, matches community right panel) ── */}
          {/* Hidden for Files and Companion tabs which are full-width experiences */}
          {activeTab !== "files" && activeTab !== "companion" && (
            <div className="w-[360px] shrink-0 border-l border-border overflow-hidden">
              <AiContextPanel onAsk={addToConversation} />
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
