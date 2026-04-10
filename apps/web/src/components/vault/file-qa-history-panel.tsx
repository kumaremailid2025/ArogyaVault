"use client";

import * as React from "react";
import {
  MessageCircleQuestionIcon, BotIcon, UserIcon, FileTextIcon,
  ChevronDownIcon, ChevronUpIcon, ClipboardListIcon, ImageIcon,
  StethoscopeIcon, ShieldIcon, FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultHealth, type FileQAEntry } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   FILE Q&A HISTORY PANEL — default right panel when no file selected
   Shows all questions asked across files in chronological order,
   first entry expanded, rest collapsed.
═══════════════════════════════════════════════════════════════════ */

interface FileQAHistoryPanelProps {
  onFileClick: (fileId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  lab: <FileTextIcon className="size-3 text-blue-500" />,
  prescription: <ClipboardListIcon className="size-3 text-green-500" />,
  imaging: <ImageIcon className="size-3 text-purple-500" />,
  discharge: <StethoscopeIcon className="size-3 text-orange-500" />,
  insurance: <ShieldIcon className="size-3 text-teal-500" />,
  other: <FileIcon className="size-3 text-muted-foreground" />,
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const QACard = ({
  entry,
  expanded,
  onToggle,
  onFileClick,
}: {
  entry: FileQAEntry;
  expanded: boolean;
  onToggle: () => void;
  onFileClick: () => void;
}) => {
  return (
    <div className={cn(
      "rounded-xl border transition-all",
      expanded ? "border-primary/20 bg-background shadow-sm" : "border-border bg-background hover:border-primary/10",
    )}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 cursor-pointer"
      >
        <div className="flex items-start gap-2">
          <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <UserIcon className="size-2.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-xs font-medium leading-snug",
              expanded ? "" : "line-clamp-2"
            )}>
              {entry.question}
            </p>
            {/* File badge */}
            <button
              onClick={(e) => { e.stopPropagation(); onFileClick(); }}
              className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors cursor-pointer"
            >
              {CATEGORY_ICONS[entry.fileCategory]}
              <span className="truncate max-w-[160px]">{entry.fileName}</span>
            </button>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(entry.askedAt)}</span>
            {expanded
              ? <ChevronUpIcon className="size-3.5 text-muted-foreground" />
              : <ChevronDownIcon className="size-3.5 text-muted-foreground" />
            }
          </div>
        </div>
      </button>

      {/* Expanded — AI answer */}
      {expanded && (
        <div className="px-3 pb-3">
          <div className="ml-7 mt-1 flex items-start gap-2">
            <div className="size-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <BotIcon className="size-2.5 text-muted-foreground" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {entry.answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const FileQAHistoryPanel = ({ onFileClick }: FileQAHistoryPanelProps) => {
  const { FILE_QA_HISTORY } = useVaultHealth();
  // First entry expanded by default
  const [expandedId, setExpandedId] = React.useState<number | null>(
    FILE_QA_HISTORY.length > 0 ? FILE_QA_HISTORY[0].id : null
  );

  const toggleExpand = React.useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
        <MessageCircleQuestionIcon className="size-4 text-primary" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold">Recent Questions</h2>
          <p className="text-[10px] text-muted-foreground">Questions asked on your uploaded files</p>
        </div>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {FILE_QA_HISTORY.length}
        </span>
      </div>

      {/* Q&A list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {FILE_QA_HISTORY.map((entry) => (
          <QACard
            key={entry.id}
            entry={entry}
            expanded={expandedId === entry.id}
            onToggle={() => toggleExpand(entry.id)}
            onFileClick={() => onFileClick(entry.fileId)}
          />
        ))}

        {FILE_QA_HISTORY.length === 0 && (
          <div className="py-10 text-center">
            <MessageCircleQuestionIcon className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No questions asked yet.</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Select a file and ask a question to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
