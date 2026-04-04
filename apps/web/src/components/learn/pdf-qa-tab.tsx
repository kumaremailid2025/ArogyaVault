"use client";

import * as React from "react";
import {
  FileTextIcon, UploadCloudIcon, SendIcon,
  BrainCircuitIcon, LoaderIcon, ExternalLinkIcon,
  BookOpenIcon, XIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { getPdfAiResponse } from "@/lib/pdf-utils";
import type { PdfMessage } from "@/models/learn";

/* ═══════════════════════════════════════════════════════════════════
   PDF Q&A TAB — three-column layout
   Left: uploaded PDFs list | Center: chat | Right: citations & info
═══════════════════════════════════════════════════════════════════ */

type MockPdf = {
  name: string;
  pages: number;
  size: string;
  uploadedAt: string;
};

const MOCK_PDFS: MockPdf[] = [
  { name: "Blood_Report_Jan2026.pdf", pages: 8, size: "1.2 MB", uploadedAt: "2026-01-15" },
  { name: "Prescription_Dr_Sharma.pdf", pages: 3, size: "420 KB", uploadedAt: "2026-02-20" },
  { name: "Thyroid_Panel_Results.pdf", pages: 4, size: "680 KB", uploadedAt: "2026-03-10" },
  { name: "ECG_Report_Apollo.pdf", pages: 2, size: "1.5 MB", uploadedAt: "2026-03-25" },
];

const SUGGESTION_QUESTIONS = [
  "What is the dosage mentioned?",
  "Are there any side effects listed?",
  "Explain the mechanism of action",
  "List the contraindications",
  "Summarize key findings",
];

/* ── Left: PDF List ── */
const PdfListPanel = ({
  pdfs, activePdf, onSelect,
}: {
  pdfs: MockPdf[];
  activePdf: string | null;
  onSelect: (name: string) => void;
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Upload button */}
      <div className="px-2 pt-2 pb-1">
        <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs">
          <UploadCloudIcon className="size-3.5" />
          Upload PDF
        </Button>
      </div>

      <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t border-border mt-1">
        <FileTextIcon className="size-3" /> {pdfs.length} Documents
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5 pb-2">
        {pdfs.map((pdf) => (
          <button
            key={pdf.name}
            onClick={() => onSelect(pdf.name)}
            className={cn(
              "w-full text-left px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer",
              activePdf === pdf.name
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "hover:bg-muted/60"
            )}
          >
            <div className="flex items-start gap-2">
              <FileTextIcon className="size-3.5 mt-0.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{pdf.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                  <span>{pdf.pages} pages</span>
                  <span>·</span>
                  <span>{pdf.size}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Center: Chat ── */
const PdfChat = ({
  activePdf, messages, isTyping, onSend,
}: {
  activePdf: string | null;
  messages: PdfMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
}) => {
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  };

  if (!activePdf) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <FileTextIcon className="size-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold">PDF Q&A</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Select a PDF document from the left panel, then ask questions about its contents. AI will extract answers with page-level citations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-border flex items-center gap-2">
        <FileTextIcon className="size-4 text-primary shrink-0" />
        <span className="text-sm font-medium truncate">{activePdf}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 py-4">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <BrainCircuitIcon className="size-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Ask any question about this document
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTION_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => onSend(q)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "ai" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                  <BrainCircuitIcon className="size-3.5" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-[85%] text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted border border-border rounded-tl-sm"
                )}
              >
                <p className="leading-relaxed">{msg.text}</p>

                {msg.citations && (
                  <div className="mt-3 flex flex-col gap-1">
                    {msg.citations.map((c, j) => (
                      <span
                        key={j}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                      >
                        <FileTextIcon className="size-3 shrink-0" /> {c}
                      </span>
                    ))}
                  </div>
                )}

                {msg.related && (
                  <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                    <span className="text-[10px] font-medium text-muted-foreground">Related:</span>
                    {msg.related.map((r, j) => (
                      <span
                        key={j}
                        className="block text-[10px] text-primary/80 flex items-center gap-1"
                      >
                        <ExternalLinkIcon className="size-2.5 shrink-0" /> {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border mt-0.5 text-xs font-bold">
                  KU
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mt-0.5">
                <BrainCircuitIcon className="size-3.5" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted border border-border text-sm flex items-center gap-2 text-muted-foreground">
                <LoaderIcon className="size-3.5 animate-spin" />
                Analyzing document…
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-border">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:border-primary transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this document…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            />
          </div>
          <Button size="icon" className="size-9 shrink-0" disabled={!input.trim() || isTyping} onClick={handleSubmit}>
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ── Right: Citations & Info ── */
const PdfInfoPanel = ({
  activePdf, messages,
}: {
  activePdf: string | null;
  messages: PdfMessage[];
}) => {
  const allCitations = messages
    .filter((m) => m.role === "ai" && m.citations)
    .flatMap((m) => m.citations ?? []);

  const allRelated = messages
    .filter((m) => m.role === "ai" && m.related)
    .flatMap((m) => m.related ?? []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Document info */}
        {activePdf && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <FileTextIcon className="size-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Document</span>
            </div>
            <div className="rounded-lg border border-border p-2.5">
              <span className="text-xs font-medium">{activePdf}</span>
              {(() => {
                const pdf = MOCK_PDFS.find((p) => p.name === activePdf);
                return pdf ? (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{pdf.pages} pages</span>
                    <span>·</span>
                    <span>{pdf.size}</span>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Citations collected */}
        {allCitations.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <BookOpenIcon className="size-3 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Citations</span>
            </div>
            <div className="space-y-1">
              {[...new Set(allCitations)].map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/40 text-[11px]">
                  <FileTextIcon className="size-3 text-primary shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related research */}
        {allRelated.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <ExternalLinkIcon className="size-3 text-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Related Research</span>
            </div>
            <div className="space-y-1">
              {[...new Set(allRelated)].map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors text-[11px] text-primary/80">
                  <ExternalLinkIcon className="size-3 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestion questions */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <BrainCircuitIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Try Asking</span>
          </div>
          <div className="space-y-1">
            {SUGGESTION_QUESTIONS.map((q) => (
              <div key={q} className="px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground">
                {q}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Tab Component ── */
export const PdfQaTab = () => {
  const [activePdf, setActivePdf] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<PdfMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSelectPdf = (name: string) => {
    setActivePdf(name);
    setMessages([]);
  };

  const handleSend = (text: string) => {
    if (!activePdf) return;
    const userMsg: PdfMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg = getPdfAiResponse(text, activePdf);
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left */}
      <div className="w-[240px] shrink-0 border-r border-border overflow-hidden">
        <PdfListPanel pdfs={MOCK_PDFS} activePdf={activePdf} onSelect={handleSelectPdf} />
      </div>

      {/* Center */}
      <div className="flex-1 overflow-hidden">
        <PdfChat
          activePdf={activePdf}
          messages={messages}
          isTyping={isTyping}
          onSend={handleSend}
        />
      </div>

      {/* Right */}
      <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
        <PdfInfoPanel activePdf={activePdf} messages={messages} />
      </div>
    </div>
  );
};
