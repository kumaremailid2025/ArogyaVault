"use client";

/**
 * File Detail Page
 * ────────────────
 * Displays file details, AI summary, Q&A list, and compose box.
 * Accessed when a specific file is selected from the list.
 */

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  SparklesIcon, XIcon, HelpCircleIcon,
  FileTextIcon, FileSpreadsheetIcon, FileIcon, ImageIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";

import { ComposeBox } from "@/components/shared/compose-box";
import { FileQAAccordionList } from "@/components/containers/community/right-panel-shared";
import { useFilesContext } from "@/app/(app)/community/_context/files-context";
import Typography from "@/components/ui/typography";

/* ── Component ────────────────────────────────────────────────── */

export default function FileDetailPage() {
  const params = useParams();
  const fileId = parseInt(params.fileId as string, 10);
  const { files, handleAskFileQuestion, basePath } = useFilesContext();

  /* ── Find the file ── */
  const activeFile = React.useMemo(
    () => files.find((f) => f.id === fileId) ?? null,
    [files, fileId],
  );

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div>
          <FileTextIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
          <Typography variant="body" color="muted">File not found</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Pinned header ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <Typography variant="h4" as="span" className="flex-1 truncate">File Details</Typography>
          <Link href={`${basePath}/files`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Compact file info */}
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              activeFile.type === "pdf"
                ? "bg-red-50"
                : activeFile.type === "xlsx"
                  ? "bg-green-50"
                  : activeFile.type === "docx"
                    ? "bg-blue-50"
                    : "bg-amber-50",
            )}
          >
            {activeFile.type === "pdf" && <FileTextIcon className="size-4 text-red-500" />}
            {activeFile.type === "xlsx" && (
              <FileSpreadsheetIcon className="size-4 text-green-600" />
            )}
            {activeFile.type === "docx" && <FileIcon className="size-4 text-blue-500" />}
            {(activeFile.type === "jpg" || activeFile.type === "png") && (
              <ImageIcon className="size-4 text-amber-500" />
            )}
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
              <Typography variant="caption" weight="semibold" as="span" className="text-violet-700">AI Summary</Typography>
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
      <div className="shrink-0 border-t border-border px-4 pt-2 pb-3">
        <ComposeBox
          onSubmit={handleAskFileQuestion}
          placeholder="Ask a question about this file…"
          submitLabel="Ask"
          modes={["text"]}
        />
      </div>
    </div>
  );
}
