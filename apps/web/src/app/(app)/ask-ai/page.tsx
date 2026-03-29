import type { Metadata } from "next";
import { BrainCircuitIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { ContentTabs } from "@/components/app/content-tabs";

export const metadata: Metadata = { title: "Ask AI | ArogyaVault" };

/* ── Dummy conversation ──────────────────────────────────────────── */
const MESSAGES = [
  {
    role: "user" as const,
    text: "What medications am I currently on?",
  },
  {
    role: "ai" as const,
    text: "Based on your uploaded records, you are currently on the following medications:",
    list: [
      "Metformin 500mg — twice daily (morning & evening with meals)",
      "Amlodipine 5mg — once daily (morning)",
    ],
    citations: ["Prescription · Dr. Suresh Reddy · 10 Mar 2026"],
    note: "Always consult your doctor before making any changes to your medication.",
  },
  {
    role: "user" as const,
    text: "Is my blood sugar improving?",
  },
  {
    role: "ai" as const,
    text: "Your HbA1c trend based on available records shows controlled levels:",
    list: [
      "HbA1c 7.4% — 01 Mar 2026 (latest)",
      "Target range: below 7.0% for well-controlled Type 2 Diabetes",
    ],
    citations: [
      "Lab Report · HbA1c & Lipid Profile · 01 Mar 2026",
      "Prescription · Dr. Suresh Reddy · 10 Mar 2026",
    ],
    note: "Your HbA1c is slightly above the target. Your doctor may review your Metformin dosage at the next visit.",
  },
];

const SUGGESTED = [
  "When is my next follow-up?",
  "Do I have any flagged lab values?",
  "What was my last diagnosis?",
  "Summarise my records for a new doctor",
];

export default function AskAiPage() {
  return (
    <div className="flex flex-col h-full p-5 lg:p-6 gap-4 max-w-3xl">

      {/* Content tabs */}
      <ContentTabs active="ask-ai" />

      {/* Header */}
      <div className="flex items-center gap-2">
        <BrainCircuitIcon className="size-5 text-primary" />
        <h1 className="text-xl font-bold">Ask AI</h1>
        <Badge variant="outline" className="text-xs">GPT-4o · RAG</Badge>
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        Ask anything about your health records. Answers are drawn only from your uploaded documents.
      </p>

      {/* Conversation */}
      <div className="flex flex-col gap-4 flex-1">
        {MESSAGES.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "ai" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                <BrainCircuitIcon className="size-3.5" />
              </div>
            )}

            <div className={cn(
              "rounded-2xl px-4 py-3 max-w-[85%] text-sm",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted border border-border rounded-tl-sm"
            )}>
              <p className="leading-relaxed">{msg.text}</p>

              {msg.role === "ai" && msg.list && (
                <ul className="mt-2 space-y-1">
                  {msg.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {msg.role === "ai" && msg.citations && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {msg.citations.map((c, j) => (
                    <span key={j} className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      <FileTextIcon className="size-3 shrink-0" /> {c}
                    </span>
                  ))}
                </div>
              )}

              {msg.role === "ai" && msg.note && (
                <p className="mt-2 text-xs text-muted-foreground border-t border-border/50 pt-2 italic">
                  {msg.note}
                </p>
              )}
            </div>

            {msg.role === "user" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border mt-0.5 text-xs font-bold">
                KU
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <SparklesIcon className="size-3" /> Suggested questions
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Note: actual input is in the persistent bottom bar */}
      <p className="text-center text-xs text-muted-foreground">
        Type your question in the bar below ↓
      </p>
    </div>
  );
}
