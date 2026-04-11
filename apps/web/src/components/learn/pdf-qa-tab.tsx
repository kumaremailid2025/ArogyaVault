"use client";

import * as React from "react";
import {
  FileTextIcon, UploadCloudIcon, SendIcon,
  BrainCircuitIcon, LoaderIcon, ExternalLinkIcon,
  BookOpenIcon, XIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { usePdfLibrary, type PdfLibraryEntry } from "@/data/pdf-library-data";
import { useSendPdfQuestion } from "@/hooks/api";
import type { PdfMessage } from "@/models/learn";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   PDF Q&A TAB — three-column layout
   Left: uploaded PDFs list | Center: chat | Right: citations & info
═══════════════════════════════════════════════════════════════════ */

type MockPdf = PdfLibraryEntry;

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
                <Typography variant="caption" weight="medium" as="h4">{pdf.name}</Typography>
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
  activePdf, messages, isTyping, onSend, suggestionQuestions,
}: {
  activePdf: string | null;
  messages: PdfMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
  suggestionQuestions: string[];
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
        <Typography variant="h2" as="h2">PDF Q&A</Typography>
        <Typography variant="body" color="muted" className="mt-2 max-w-md">
          Select a PDF document from the left panel, then ask questions about its contents. AI will extract answers with page-level citations.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 py-2 border-b border-border flex items-center gap-2">
        <FileTextIcon className="size-4 text-primary shrink-0" />
        <Typography variant="body" weight="medium" as="span" truncate={true}>{activePdf}</Typography>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 py-4">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <BrainCircuitIcon className="size-8 mx-auto text-muted-foreground/30 mb-3" />
              <Typography variant="body" color="muted" className="mb-4">
                Ask any question about this document
              </Typography>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {suggestionQuestions.map((q) => (
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
                <Typography variant="body" color={msg.role === "user" ? "inverse" : "default"}>{msg.text}</Typography>

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
                    <Typography variant="micro" weight="medium" color="muted" as="span">Related:</Typography>
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
  activePdf, messages, pdfs, suggestionQuestions,
}: {
  activePdf: string | null;
  messages: PdfMessage[];
  pdfs: MockPdf[];
  suggestionQuestions: string[];
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
              <Typography variant="overline" color="muted" as="span">Document</Typography>
            </div>
            <div className="rounded-lg border border-border p-2.5">
              <Typography variant="caption" weight="medium" as="span">{activePdf}</Typography>
              {(() => {
                const pdf = pdfs.find((p) => p.name === activePdf);
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
              <Typography variant="overline" color="muted" as="span">Citations</Typography>
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
              <Typography variant="overline" color="muted" as="span">Related Research</Typography>
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
            <Typography variant="overline" color="muted" as="span">Try Asking</Typography>
          </div>
          <div className="space-y-1">
            {suggestionQuestions.map((q) => (
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
  const { MOCK_PDFS, SUGGESTION_QUESTIONS } = usePdfLibrary();
  const askPdf = useSendPdfQuestion();
  const [activePdf, setActivePdf] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<PdfMessage[]>([]);
  const isTyping = askPdf.isPending;

  /* Auto-select the first PDF once the library loads */
  React.useEffect(() => {
    if (!activePdf && MOCK_PDFS.length > 0) {
      setActivePdf(MOCK_PDFS[0].name);
    }
  }, [MOCK_PDFS, activePdf]);

  const handleSelectPdf = (name: string) => {
    setActivePdf(name);
    setMessages([]);
  };

  const handleSend = (text: string) => {
    if (!activePdf) return;
    const userMsg: PdfMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    askPdf.mutate(
      { question: text, docName: activePdf },
      {
        onSuccess: (res) => {
          const aiMsg: PdfMessage = {
            role: "ai",
            text: res.text,
            citations: res.citations,
            related: res.related,
          };
          setMessages((prev) => [...prev, aiMsg]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              text: "Sorry, I couldn't process that question. Please try again.",
            },
          ]);
        },
      }
    );
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
          suggestionQuestions={SUGGESTION_QUESTIONS}
        />
      </div>

      {/* Right */}
      <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
        <PdfInfoPanel
          activePdf={activePdf}
          messages={messages}
          pdfs={MOCK_PDFS}
          suggestionQuestions={SUGGESTION_QUESTIONS}
        />
      </div>
    </div>
  );
};
