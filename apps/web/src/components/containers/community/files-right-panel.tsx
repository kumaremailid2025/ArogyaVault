"use client";

/**
 * Right panel for the files tab with file-detail, file-qa, and files-default views.
 *
 * @packageDocumentation
 * @category Containers
 *
 * @remarks
 * Handles file-detail (AI summary and Q&A), file-qa (ask question about a file),
 * and files-default (recent Q&A across all files) views. Component is memoized
 * to prevent unnecessary re-renders.
 */

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
import Typography from "@/components/ui/typography";

/* Files panel props */

/**
 * Props for {@link FilesRightPanel}.
 *
 * @category Types
 */
interface FilesRightPanelProps {
  /** Current panel state (which view to render). */
  panelState: PanelState;
  /** The currently active file (null if no file selected). */
  activeFile: CommunityFile | null;
  /** Recent Q&A across all files. */
  recentFileQA: RecentFileQA[];
  /** Handler to close the panel. */
  onClosePanel: () => void;
  /** Handler to submit a question about a file. */
  onAskFileQuestion?: (payload: ComposeSubmitPayload) => void;
  /** Handler to select a file from the recent Q&A list. */
  onSelectFileFromQA?: (fileId: number) => void;
}

/**
 * Render the right panel for the files tab.
 *
 * @param props - Component props.
 * @returns The rendered files right panel.
 *
 * @category Containers
 */
export const FilesRightPanel = React.memo(
  ({
    panelState,
    activeFile,
    recentFileQA,
    onClosePanel,
    onAskFileQuestion,
    onSelectFileFromQA,
  }: FilesRightPanelProps): React.ReactElement => {
    return (
      <div className="w-[360px] shrink-0 flex flex-col overflow-hidden">

        {/* ══════════════ FILE DETAIL — AI Summary + Q&A ══════════════ */}
        {panelState.view === "file-detail" && activeFile && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Pinned header ── */}
            <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="h4" as="span" className="flex-1 truncate">File Details</Typography>
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
                  <Typography variant="caption" weight="medium" truncate={true}>{activeFile.name}</Typography>
                  <Typography variant="micro" color="muted">
                    {activeFile.size} · {activeFile.type.toUpperCase()} · {activeFile.uploadedBy}
                  </Typography>
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
                  <Typography variant="caption" className="text-foreground/80">{activeFile.aiSummary}</Typography>
                </div>

                {/* Q&A Section */}
                <div>
                  <Typography variant="overline" color="muted">
                    <HelpCircleIcon className="size-3 text-primary" />
                    Questions &amp; Answers
                    {activeFile.qaCount > 0 && (
                      <Badge variant="secondary" className="text-[9px] ml-auto">
                        {activeFile.qaCount}
                      </Badge>
                    )}
                  </Typography>

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
                  <Typography variant="h4" as="span">Q&amp;A</Typography>
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
              <Typography variant="caption" color="muted" className="mt-1.5 truncate">
                {activeFile.name}
              </Typography>
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
            <Typography variant="overline" color="muted">
              <MessageSquareIcon className="size-3 text-primary" />
              Recent Questions &amp; Answers
            </Typography>

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
                    <Typography variant="micro" color="muted" as="span" truncate={true}>{item.fileName}</Typography>
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
                      <Typography variant="h5" weight="semibold" as="span" className="!text-[11px]">{item.askedBy}</Typography>
                      <Typography variant="caption" className="font-medium mt-0.5">{item.question}</Typography>
                    </div>
                  </div>
                  {/* Truncated answer */}
                  <div className="ml-7 rounded-md bg-violet-50/50 border border-violet-100 px-2.5 py-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <SparklesIcon className="size-2.5 text-violet-500" />
                      <span className="text-[9px] font-semibold text-violet-600">ArogyaAI</span>
                    </div>
                    <Typography variant="micro" className="text-foreground/70 line-clamp-2">{item.answer}</Typography>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
              <FileTextIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
              <Typography variant="caption" color="muted">
                Select any file to see its AI summary, ask questions, and view existing Q&amp;A threads.
              </Typography>
            </div>
          </div>
        )}
      </div>
    );
  },
);

FilesRightPanel.displayName = "FilesRightPanel";
