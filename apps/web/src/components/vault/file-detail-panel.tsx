"use client";

import * as React from "react";
import {
  XIcon, SparklesIcon, CalendarIcon, HardDriveIcon,
  TagIcon, FileTextIcon, SendIcon, BotIcon, UserIcon,
  ClipboardListIcon, ImageIcon, StethoscopeIcon, ShieldIcon, FileIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { VAULT_FILES, type MedFile } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   FILE DETAIL PANEL — right sidebar when a file card is clicked
   Shows: file info, AI summary, and a compose input for Q&A.
═══════════════════════════════════════════════════════════════════ */

interface FileDetailPanelProps {
  fileId: number;
  onClose: () => void;
}

interface QAMessage {
  id: number;
  role: "user" | "ai";
  text: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  lab: <FileTextIcon className="size-4 text-blue-500" />,
  prescription: <ClipboardListIcon className="size-4 text-green-500" />,
  imaging: <ImageIcon className="size-4 text-purple-500" />,
  discharge: <StethoscopeIcon className="size-4 text-orange-500" />,
  insurance: <ShieldIcon className="size-4 text-teal-500" />,
  other: <FileIcon className="size-4 text-muted-foreground" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  lab: "Lab Report",
  prescription: "Prescription",
  imaging: "Imaging",
  discharge: "Discharge Summary",
  insurance: "Insurance",
  other: "Other",
};

/** Mock AI answers based on file content */
function getMockAnswer(question: string, file: MedFile): string {
  const q = question.toLowerCase();
  if (q.includes("normal") || q.includes("range")) {
    return `Based on "${file.name}", most values fall within or near normal ranges. ${file.aiSummary || "No additional AI analysis available."}`;
  }
  if (q.includes("concern") || q.includes("worry") || q.includes("risk")) {
    return `Looking at this report, the key areas to discuss with your doctor would be any values flagged outside the reference range. ${file.aiSummary || ""}`;
  }
  if (q.includes("summary") || q.includes("summarize") || q.includes("explain")) {
    return file.aiSummary || "No AI summary is available for this document yet.";
  }
  if (q.includes("medication") || q.includes("medicine") || q.includes("drug")) {
    return `This document ${file.category === "prescription" ? "contains medication details" : "may reference medications related to the findings"}. Please consult your physician for medication-related decisions.`;
  }
  return `Based on my analysis of "${file.name}": ${file.aiSummary || "This document has been uploaded to your vault. I can help answer specific questions about its contents."}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function FileDetailPanel({ fileId, onClose }: FileDetailPanelProps) {
  const file = VAULT_FILES.find((f) => f.id === fileId);
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<QAMessage[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const nextIdRef = React.useRef(1);

  // Reset conversation when file changes
  React.useEffect(() => {
    setMessages([]);
    setQuestion("");
    nextIdRef.current = 1;
  }, [fileId]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <FileIcon className="size-8 text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">File not found.</p>
        <button onClick={onClose} className="mt-2 text-xs text-primary hover:underline cursor-pointer">Close</button>
      </div>
    );
  }

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMsg: QAMessage = { id: nextIdRef.current++, role: "user", text: trimmed };
    const aiMsg: QAMessage = { id: nextIdRef.current++, role: "ai", text: getMockAnswer(trimmed, file) };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setQuestion("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    "Summarize this report",
    "Are all values normal?",
    "Any concerns here?",
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start gap-2 p-3 border-b border-border shrink-0">
        <div className="mt-0.5 shrink-0">{CATEGORY_ICONS[file.category]}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold leading-tight truncate">{file.name}</h2>
          <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[file.category] || file.category}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-md cursor-pointer shrink-0">
          <XIcon className="size-4" />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* File metadata */}
        <div className="p-3 space-y-2.5 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="size-3" />
            <span>{formatDate(file.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HardDriveIcon className="size-3" />
            <span>{file.size}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TagIcon className="size-3" />
            <span className="capitalize">{file.category}</span>
          </div>
        </div>

        {/* AI Summary */}
        {file.aiSummary && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <SparklesIcon className="size-3.5 text-primary" />
              <span className="text-xs font-semibold">AI Summary</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {file.aiSummary}
            </p>
          </div>
        )}

        {/* Q&A Conversation */}
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BotIcon className="size-3.5 text-primary" />
            <span className="text-xs font-semibold">Ask about this file</span>
          </div>

          {/* Suggestion chips (show when no messages yet) */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuestion(s);
                    // Auto-submit after a tick
                    setTimeout(() => {
                      const userMsg: QAMessage = { id: nextIdRef.current++, role: "user", text: s };
                      const aiMsg: QAMessage = { id: nextIdRef.current++, role: "ai", text: getMockAnswer(s, file) };
                      setMessages((prev) => [...prev, userMsg, aiMsg]);
                      setQuestion("");
                    }, 100);
                  }}
                  className="px-2.5 py-1 rounded-full border border-border text-[11px] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-2",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "user" ? "bg-primary/10" : "bg-muted"
              )}>
                {msg.role === "user"
                  ? <UserIcon className="size-3 text-primary" />
                  : <BotIcon className="size-3 text-muted-foreground" />
                }
              </div>
              <div className={cn(
                "rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%]",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Compose input (pinned to bottom) ── */}
      <div className="shrink-0 border-t border-border p-2">
        <div className="flex items-end gap-1.5">
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this file…"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 max-h-[80px]"
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!question.trim()}
            className="h-8 w-8 p-0 shrink-0"
          >
            <SendIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
