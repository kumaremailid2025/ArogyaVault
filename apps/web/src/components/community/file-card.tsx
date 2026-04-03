"use client";

import * as React from "react";
import {
  FileTextIcon, FileSpreadsheetIcon, FileIcon, ImageIcon,
  SparklesIcon, MessageSquareIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CommunityFile } from "@/models/community";

/* ── File type icon/color map ──────────────────────────────────── */

const FILE_TYPE_CONFIG: Record<
  CommunityFile["type"],
  { icon: typeof FileTextIcon; color: string; bg: string }
> = {
  pdf:  { icon: FileTextIcon,        color: "text-red-500",    bg: "bg-red-50" },
  xlsx: { icon: FileSpreadsheetIcon, color: "text-green-600",  bg: "bg-green-50" },
  docx: { icon: FileIcon,            color: "text-blue-500",   bg: "bg-blue-50" },
  jpg:  { icon: ImageIcon,           color: "text-amber-500",  bg: "bg-amber-50" },
  png:  { icon: ImageIcon,           color: "text-amber-500",  bg: "bg-amber-50" },
};

/* ── Props ─────────────────────────────────────────────────────── */

interface FileCardProps {
  file: CommunityFile;
  isActive: boolean;
  onSelect: (fileId: number) => void;
  onAiSummary: (fileId: number) => void;
  onQA: (fileId: number) => void;
}

/* ── Component ─────────────────────────────────────────────────── */

export const FileCard = React.memo(
  ({ file, isActive, onSelect, onAiSummary, onQA }: FileCardProps) => {
    const typeConfig = FILE_TYPE_CONFIG[file.type];
    const TypeIcon = typeConfig.icon;

    return (
      <div
        onClick={() => onSelect(file.id)}
        className={cn(
          "rounded-xl border bg-background px-4 py-3 cursor-pointer transition-colors",
          isActive
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/20 hover:bg-muted/30",
        )}
      >
        <div className="flex items-start gap-3">
          {/* File type icon */}
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              typeConfig.bg,
            )}
          >
            <TypeIcon className={cn("size-5", typeConfig.color)} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Row 1 — File name + actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-primary border-primary/30"
                  >
                    {file.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {file.size}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    · {file.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAiSummary(file.id);
                      }}
                      className="inline-flex items-center justify-center h-7 px-1.5 rounded-md text-muted-foreground transition-colors hover:text-violet-600 hover:bg-violet-50"
                    >
                      <SparklesIcon className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">AI Summary</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQA(file.id);
                      }}
                      className="inline-flex items-center justify-center h-7 px-1.5 rounded-md gap-1 text-xs text-muted-foreground transition-colors hover:text-primary hover:bg-primary/5"
                    >
                      <MessageSquareIcon className="size-3.5" />
                      {file.qaCount > 0 && (
                        <span>{file.qaCount}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {file.qaCount === 0
                      ? "Ask a question"
                      : file.qaCount === 1
                        ? "1 question"
                        : `${file.qaCount} questions`}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Row 2 — Uploader + date */}
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="size-5 shrink-0">
                <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                  {file.uploadedByInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground">
                {file.uploadedBy} · {file.uploadedAt}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

FileCard.displayName = "FileCard";
