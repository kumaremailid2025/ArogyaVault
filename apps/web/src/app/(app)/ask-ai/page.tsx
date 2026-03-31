"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BrainCircuitIcon,
  FileTextIcon,
  SparklesIcon,
  LoaderIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { SmartInput } from "@/components/shared/smart-input";
import {
  SEED_CONVERSATION,
  SUGGESTED_QUESTIONS,
  mockAiResponse,
} from "@/data/ai-conversations";
import type { ConversationMessage } from "@/data/ai-conversations";
import type { SmartInputSubmitPayload } from "@/models/input";

/* ── Message bubble ──────────────────────────────────────────────── */
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
                <span className={isUser ? "text-primary-foreground/70" : "text-primary"}>
                  •
                </span>
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
                <FileTextIcon className="size-3 shrink-0" />
                {c}
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

/* ── Page ────────────────────────────────────────────────────────── */
export default function AskAiPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [messages, setMessages] = React.useState<ConversationMessage[]>(SEED_CONVERSATION);
  const [isTyping, setIsTyping]  = React.useState(false);
  const [inputText, setInputText] = React.useState("");

  const bottomRef    = React.useRef<HTMLDivElement>(null);
  const processedQ   = React.useRef("");

  /* ── Handle ?q= from bottom bar / shortcuts ─────────────────────── */
  const incomingQ = searchParams.get("q") ?? "";

  React.useEffect(() => {
    if (incomingQ && incomingQ !== processedQ.current) {
      processedQ.current = incomingQ;
      addToConversation(incomingQ);
      router.replace("/ask-ai");
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

  /* ── SmartInput submit handler ───────────────────────────────────── */
  function handleInputSubmit(payload: SmartInputSubmitPayload) {
    const text = payload.text.trim();
    if (!text) return;
    addToConversation(text);
    setInputText("");
  }

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Sticky header */}
      <div className="shrink-0 px-5 pt-5 pb-3 lg:px-7 lg:pt-7">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <BrainCircuitIcon className="size-5 text-primary" />
            <h1 className="text-xl font-bold">Ask AI</h1>
            <Badge variant="outline" className="text-xs">GPT-4o · RAG</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ask anything about your health records. Answers are drawn only from your
            uploaded documents.
          </p>
        </div>
      </div>

      {/* Scrollable conversation */}
      <div className="flex-1 overflow-y-auto px-5 lg:px-7">
        <div className="max-w-3xl flex flex-col gap-4 pb-4">
          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} />
          ))}

          {/* Typing indicator */}
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

      {/* Sticky bottom — suggestions + SmartInput */}
      <div className="shrink-0 px-5 pb-4 lg:px-7 lg:pb-5 space-y-3">
        <div className="max-w-3xl">

          {/* Suggested questions */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <SparklesIcon className="size-3" />
              Suggested questions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  onClick={() => addToConversation(q)}
                  disabled={isTyping}
                  className="rounded-full border-border h-auto px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          {/* SmartInput — the unified input bar */}
          <SmartInput
            value={inputText}
            onChange={setInputText}
            onSubmit={handleInputSubmit}
            placeholder="Ask ArogyaAI about your health records…"
            submitLabel="Ask"
            disabled={isTyping}
            modes={["text", "voice", "image", "attach"]}
            autoFocus={false}
            maxRows={5}
            layout="chat"
          />
        </div>
      </div>
    </div>
  );
}
