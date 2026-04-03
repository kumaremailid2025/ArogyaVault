"use client";

import * as React from "react";
import {
  SparklesIcon, XIcon, MessageSquareIcon,
  FileTextIcon, FileSpreadsheetIcon, FileIcon, ImageIcon,
  HelpCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";

import { ComposeBox } from "@/components/shared/compose-box";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityFile } from "@/models/community";
import type { PanelState } from "./types";
import type { RecentFileQA } from "@/data/community-files-data";
import { FileQAAccordionList } from "./right-panel-shared";

/* ═══════════════════════════════════════════════════════════════════
   FILES RIGHT PANEL — handles: file-detail, file-qa,
   and the files-default view (recent Q&A across all files).
═══════════════════════════════════════════════════════════════════ */

interface FilesRightPanelProps {
  panelState: PanelState;
  activeFile: CommunityFile | null;
  recentFileQA: RecentFileQA[];
  onClosePanel: () => void;
  onAskFileQuestion?: (payload: ComposeSubmitPayload) => void;
  onSelectFileFromQA?: (fileId: number) => void;
}

/* ── Component ──────────────────────────────────────────────────── */

export const FilesRightPanel = React.memo(
  ({
    panelState,
    activeFile,
    recentFileQA,
    onClosePanel,
    onAskFileQuestion,
    onSelectFileFromQA,
  }: FilesRightPanelProps) => {
    return (
      <div className="w-[360px] shrink-0 flex flex-col overflow-hidden">

        {/* ══════════════ FILE DETAIL — AI Summary + Q&A ══════════════ */}
        {panelState.view === "file-detail" && activeFile && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Pinned header ── */}
            <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex-1 truncate">File Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClosePanel}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              {/* Compact file info */}
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  activeFile.type === "pdf" ? "bg-red-50" :
                  activeFile.type === "xlsx" ? "bg-green-50" :
                  activeFile.type === "docx" ? "bg-blue-50" : "bg-amber-50",
                )}>
                  {activeFile.type === "pdf" && <FileTextIcon className="size-4 text-red-500" />}
                  {activeFile.type === "xlsx" && <FileSpreadsheetIcon className="size-4 text-green-600" />}
                  {activeFile.type === "docx" && <FileIcon className="size-4 text-blue-500" />}
                  {(activeFile.type === "jpg" || activeFile.type === "png") && <ImageIcon className="size-4 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{activeFile.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {activeFile.size} · {activeFile.type.toUpperCase()} · {activeFile.uploadedBy}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-4 py-3 space-y-4">
                {/* AI Summary */}
                <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-violet-100">
                      <SparklesIcon className="size-3 text-violet-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-violet-700">AI Summary</span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">{activeFile.aiSummary}</p>
                </div>

                {/* Q&A Section */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircleIcon className="size-3 text-primary" />
                    Questions &amp; Answers
                    {activeFile.qaCount > 0 && (
                      <Badge variant="secondary" className="text-[9px] ml-auto">
                        {activeFile.qaCount}
                      </Badge>
                    )}
                  </p>

                  <FileQAAccordionList questions={activeFile.questions} />
                </div>
              </div>
            </div>

            {/* ── Pinned compose at bottom ── */}
            {onAskFileQuestion && (
              <div className="shrink-0 border-t border-border px-4 pt-2 pb-3">
                <ComposeBox
                  onSubmit={onAskFileQuestion}
                  placeholder="Ask a question about this file…"
                  submitLabel="Ask"
                  modes={["text"]}
                />
              </div>
            )}
          </div>
        )}

        {/* ══════════════ FILE Q&A ONLY (from card button) ══════════════ */}
        {panelState.view === "file-qa" && activeFile && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Pinned header ── */}
            <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <HelpCircleIcon className="size-4 text-primary" />
                  <span className="text-sm font-semibold">Q&amp;A</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClosePanel}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              {/* Compact file reference */}
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {activeFile.name}
              </p>
            </div>

            {/* ── Scrollable Q&A list ── */}
            <div className="flex-1 overflow-y-auto px-4 min-h-0">
              <div className="py-3">
                <FileQAAccordionList questions={activeFile.questions} />
              </div>
            </div>

            {/* ── Pinned compose at bottom ── */}
            {onAskFileQuestion && (
              <div className="shrink-0 border-t border-border px-4 pt-2 pb-3">
                <ComposeBox
                  onSubmit={onAskFileQuestion}
                  placeholder="Ask a question about this file…"
                  submitLabel="Ask"
                  modes={["text"]}
                />
              </div>
            )}
          </div>
        )}

        {/* ══════════════ FILES DEFAULT — Recent Q&A across all files ══════════════ */}
        {panelState.view === "default" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquareIcon className="size-3 text-primary" />
              Recent Questions &amp; Answers
            </p>

            <div className="space-y-3">
              {recentFileQA.map((item, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectFileFromQA?.(item.fileId)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectFileFromQA?.(item.fileId); }}
                  className="rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-primary/20 hover:bg-muted/30 transition-colors space-y-2"
                >
                  {/* File reference */}
                  <div className="flex items-center gap-1.5">
                    <FileTextIcon className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] text-muted-foreground truncate">{item.fileName}</span>
                    <Badge variant="outline" className="text-[9px] border-primary/20 text-primary ml-auto shrink-0">
                      {item.fileCategory}
                    </Badge>
                  </div>
                  {/* Question */}
                  <div className="flex gap-2">
                    <Avatar className="size-5 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                        {item.askedByInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold">{item.askedBy}</span>
                      <p className="text-xs leading-relaxed font-medium mt-0.5">{item.question}</p>
                    </div>
                  </div>
                  {/* Truncated answer */}
                  <div className="ml-7 rounded-md bg-violet-50/50 border border-violet-100 px-2.5 py-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <SparklesIcon className="size-2.5 text-violet-500" />
                      <span className="text-[9px] font-semibold text-violet-600">ArogyaAI</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-foreground/70 line-clamp-2">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
              <FileTextIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground leading-snug">
                Select any file to see its AI summary, ask questions, and view existing Q&amp;A threads.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

FilesRightPanel.displayName = "FilesRightPanel";
