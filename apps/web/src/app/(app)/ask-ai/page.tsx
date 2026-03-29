"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BrainCircuitIcon, FileTextIcon, SparklesIcon, LoaderIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";

/* ── Message types ───────────────────────────────────────────────── */
type AiMessage = {
  role: "ai";
  text: string;
  list?: string[];
  citations?: string[];
  note?: string;
};
type UserMessage = { role: "user"; text: string };
type Message = UserMessage | AiMessage;

/* ── Seed conversation ───────────────────────────────────────────── */
const SEED: Message[] = [
  { role: "user", text: "What medications am I currently on?" },
  {
    role: "ai",
    text: "Based on your uploaded records, you are currently on the following medications:",
    list: [
      "Metformin 500mg — twice daily (morning & evening with meals)",
      "Amlodipine 5mg — once daily (morning)",
    ],
    citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    note: "Always consult your doctor before making any changes to your medication.",
  },
  { role: "user", text: "Is my blood sugar improving?" },
  {
    role: "ai",
    text: "Your HbA1c trend based on available records shows controlled levels:",
    list: [
      "HbA1c 7.4% — 01 Mar 2026 (latest)",
      "Target range: below 7.0% for well-controlled Type 2 Diabetes",
    ],
    citations: [
      "Lab Report · HbA1c & Lipid Profile · 01 Mar 2026",
      "Prescription · Dr. Suresh Reddy · 10 Mar 2026",
    ],
    note: "Your HbA1c is slightly above target. Your doctor may review Metformin dosage at the next visit.",
  },
];

const SUGGESTED = [
  "When is my next follow-up?",
  "Do I have any flagged lab values?",
  "What was my last diagnosis?",
  "Summarise my records for a new doctor",
];

/* ── Smart mock response ─────────────────────────────────────────── */
function mockResponse(q: string): AiMessage {
  const lq = q.toLowerCase();
  if (lq.includes("medication") || lq.includes("medicine") || lq.includes("drug")) {
    return {
      role: "ai",
      text: "Your current medications based on uploaded records:",
      list: ["Metformin 500mg — twice daily", "Amlodipine 5mg — once daily"],
      citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    };
  }
  if (lq.includes("blood sugar") || lq.includes("hba1c") || lq.includes("sugar") || lq.includes("diabetes")) {
    return {
      role: "ai",
      text: "Your latest HbA1c is 7.4% (01 Mar 2026), which is slightly above the target of <7.0% for controlled Type 2 Diabetes. Your trend shows improvement over the past 6 months.",
      citations: ["Lab Report · HbA1c & Lipid Profile · 01 Mar 2026"],
    };
  }
  if (lq.includes("flag") || lq.includes("abnormal") || lq.includes("alert")) {
    return {
      role: "ai",
      text: "I found 2 flagged values in your recent records:",
      list: [
        "Haemoglobin 11.2 g/dL (low) — CBC · 15 Mar 2026",
        "HbA1c 7.4% (above target) — Lab · 01 Mar 2026",
      ],
      citations: [
        "Lab Report · CBC · 15 Mar 2026",
        "Lab Report · HbA1c & Lipid Profile · 01 Mar 2026",
      ],
      note: "Please discuss these with your doctor at your next visit.",
    };
  }
  if (lq.includes("follow") || lq.includes("appointment") || lq.includes("visit")) {
    return {
      role: "ai",
      text: "Based on your prescription from Dr. Suresh Reddy (10 Mar 2026), a review was recommended in 4 weeks — that would be around 07 April 2026.",
      citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    };
  }
  if (lq.includes("diagnos") || lq.includes("condition")) {
    return {
      role: "ai",
      text: "Your records indicate the following active conditions:",
      list: ["Type 2 Diabetes Mellitus (managed with Metformin)", "Hypertension (managed with Amlodipine)", "Iron deficiency anaemia (mild)"],
      citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026", "Lab Report · CBC · 15 Mar 2026"],
    };
  }
  if (lq.includes("summar") || lq.includes("new doctor") || lq.includes("specialist")) {
    return {
      role: "ai",
      text: "Here is a brief summary suitable for a new doctor:",
      list: [
        "Patient: Kumar, Male",
        "Known conditions: Type 2 DM, Hypertension, mild Iron-deficiency anaemia",
        "Current medications: Metformin 500mg BD, Amlodipine 5mg OD",
        "Last HbA1c: 7.4% (Mar 2026) — borderline",
        "Last CBC: mild anaemia flagged",
      ],
      citations: [
        "Prescription · 10 Mar 2026",
        "Lab Report · 01 Mar 2026",
        "Lab Report · 15 Mar 2026",
      ],
      note: "Share this summary along with the original documents for the best clinical picture.",
    };
  }
  return {
    role: "ai",
    text: "I searched through your uploaded documents. I didn't find a specific match for that question yet — please upload more records or rephrase to get a precise answer.",
    note: "Use the Upload button in the toolbar below to add more documents.",
  };
}

/* ── Message bubble ──────────────────────────────────────────────── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
          <BrainCircuitIcon className="size-3.5" />
        </div>
      )}
      <div className={cn(
        "rounded-2xl px-4 py-3 max-w-[85%] text-sm",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-muted border border-border rounded-tl-sm"
      )}>
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
              <span key={j} className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                <FileTextIcon className="size-3 shrink-0" /> {c}
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

  const [messages, setMessages] = React.useState<Message[]>(SEED);
  const [isTyping, setIsTyping]  = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const processedQ = React.useRef("");

  /* Process incoming ?q= from bottom bar */
  const incomingQ = searchParams.get("q") ?? "";

  React.useEffect(() => {
    if (incomingQ && incomingQ !== processedQ.current) {
      processedQ.current = incomingQ;
      addToConversation(incomingQ);
      /* Clear ?q from URL without navigation */
      router.replace("/ask-ai");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQ]);

  /* Auto-scroll to bottom */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function addToConversation(text: string) {
    const userMsg: UserMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, mockResponse(text)]);
      setIsTyping(false);
    }, 1400);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Sticky header — never scrolls */}
      <div className="shrink-0 px-5 pt-5 pb-3 lg:px-7 lg:pt-7">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <BrainCircuitIcon className="size-5 text-primary" />
            <h1 className="text-xl font-bold">Ask AI</h1>
            <Badge variant="outline" className="text-xs">GPT-4o · RAG</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ask anything about your health records. Answers are drawn only from your uploaded documents.
          </p>
        </div>
      </div>

      {/* Full-width scroll container — scrollbar at right edge of column */}
      <div className="flex-1 overflow-y-auto px-5 lg:px-7">
        <div className="max-w-3xl flex flex-col gap-4 pb-4">
          {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}

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

      {/* Sticky suggested questions — never scrolls */}
      <div className="shrink-0 px-5 pb-4 lg:px-7 lg:pb-5">
        <div className="max-w-3xl">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <SparklesIcon className="size-3" /> Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => addToConversation(q)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
