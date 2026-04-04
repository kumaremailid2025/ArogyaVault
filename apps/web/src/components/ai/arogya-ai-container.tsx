"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BrainCircuitIcon, FileTextIcon, LoaderIcon, SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartInput } from "@/components/shared/smart-input";
import { ArogyaAiBanner, type AiTab } from "@/components/ai/arogya-ai-banner";
import { ChatSessionsPanel } from "@/components/ai/chat-sessions-panel";
import { AiContextPanel } from "@/components/ai/ai-context-panel";
import { AskAiLanding } from "@/components/ai/ask-ai-landing";
import { mockAiResponse } from "@/data/ai-conversations";
import { CHAT_SESSIONS, SMART_SUGGESTIONS } from "@/data/ai-context-data";
import type { ConversationMessage } from "@/data/ai-conversations";
import type { SmartInputSubmitPayload } from "@/models/input";

/* ═══════════════════════════════════════════════════════════════════
   BUBBLE — conversation message
═══════════════════════════════════════════════════════════════════ */

function Bubble({ msg }: { msg: ConversationMessage }) {
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
        <p className="leading-relaxed">{msg.text}</p>
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
          <p className="mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2 italic">
            {msg.note}
          </p>
        )}
      </div>
      {isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border mt-0.5 text-xs font-bold">
          KU
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HISTORY VIEW — full-width list of past conversations
═══════════════════════════════════════════════════════════════════ */

function HistoryView({ onSelectSession }: { onSelectSession: (id: string) => void }) {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-2">
      <h2 className="text-sm font-semibold px-1 mb-3">All Conversations</h2>
      {CHAT_SESSIONS.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelectSession(session.id)}
          className="w-full text-left rounded-xl border border-border p-4 hover:border-primary/20 hover:shadow-sm transition-all bg-background cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium">{session.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{session.preview}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {session.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] text-muted-foreground">
                {new Date(session.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{session.messageCount} messages</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN CONTAINER — orchestrates banner, three-column layout
═══════════════════════════════════════════════════════════════════ */

export function ArogyaAiContainer() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [activeTab, setActiveTab]           = React.useState<AiTab>("chat");
  const [messages, setMessages]             = React.useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping]             = React.useState(false);
  const [inputText, setInputText]           = React.useState("");
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);

  const hasConversation = messages.length > 0;
  const bottomRef  = React.useRef<HTMLDivElement>(null);
  const processedQ = React.useRef("");

  /* ── Handle ?q= from bottom bar ─────────────────────────────────── */
  const incomingQ = searchParams.get("q") ?? "";

  React.useEffect(() => {
    if (incomingQ && incomingQ !== processedQ.current) {
      processedQ.current = incomingQ;
      setActiveTab("chat");
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
  function addToConversation(text: string) {
    const userMsg: ConversationMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, mockAiResponse(text)]);
      setIsTyping(false);
    }, 1400);
  }

  function handleInputSubmit(payload: SmartInputSubmitPayload) {
    const text = payload.text.trim();
    if (!text) return;
    addToConversation(text);
    setInputText("");
  }

  function handleNewChat() {
    setMessages([]);
    setIsTyping(false);
    setInputText("");
    setActiveSessionId(null);
    setActiveTab("chat");
  }

  function handleSelectSession(sessionId: string) {
    // In production this would load the session's messages from the backend
    const session = CHAT_SESSIONS.find((s) => s.id === sessionId);
    if (!session) return;
    setActiveSessionId(sessionId);
    setActiveTab("chat");
    // Mock: start the session with its preview as a loaded conversation
    setMessages([
      { role: "user", text: session.preview },
      mockAiResponse(session.preview),
    ]);
  }

  function handleTabChange(tab: AiTab) {
    setActiveTab(tab);
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Banner */}
      <ArogyaAiBanner
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sessionCount={CHAT_SESSIONS.length}
      />

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "history" ? (
          /* ─── HISTORY TAB ─── */
          <div className="h-full overflow-y-auto px-5 lg:px-6">
            <HistoryView onSelectSession={handleSelectSession} />
          </div>
        ) : (
          /* ─── CHAT TAB — three-column layout ─── */
          <div className="h-full flex overflow-hidden">
            {/* Left — Chat sessions (narrow) */}
            <div className="w-[240px] shrink-0 border-r border-border overflow-hidden">
              <ChatSessionsPanel
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
              />
            </div>

            {/* Center — Chat or Landing (flexible) */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {!hasConversation ? (
                /* Landing state */
                <>
                  <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
                    <AskAiLanding onAsk={addToConversation} />
                  </div>
                  <div className="shrink-0 px-4 pb-3">
                    <div className="max-w-3xl mx-auto">
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
                  </div>
                </>
              ) : (
                /* Conversation state */
                <>
                  <div className="flex-1 overflow-y-auto px-4">
                    <div className="max-w-3xl mx-auto flex flex-col gap-4 py-4">
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

                  {/* Suggestions + input */}
                  <div className="shrink-0 px-4 pb-3 space-y-2">
                    <div className="max-w-3xl mx-auto">
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
                  </div>
                </>
              )}
            </div>

            {/* Right — Context panel (narrow) */}
            <div className="w-[280px] shrink-0 border-l border-border overflow-hidden">
              <AiContextPanel onAsk={addToConversation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
