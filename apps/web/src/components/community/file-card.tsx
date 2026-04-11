"use client";

/**
 * Card component for displaying a community file.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Displays a single community file with metadata (size, category, uploader),
 * type-specific icon, and action buttons (AI summary, Q&A). Memoized for performance.
 */

import * as React from "react";
import {
  FileTextIcon, FileSpreadsheetIcon, FileIcon, ImageIcon,
  SparklesIcon, MessageSquareIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import type { CommunityFile } from "@/models/community";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Map of file type to icon, color, and background CSS classes.
 */
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

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props for the file card component.
 *
 * @category Types
 */
interface FileCardProps {
  /** File to display. */
  file: CommunityFile;
  /** Whether this file is currently selected. */
  isActive: boolean;
  /** Handler when the file card is clicked. */
  onSelect: (fileId: number) => void;
  /** Handler to view AI summary for the file. */
  onAiSummary: (fileId: number) => void;
  /** Handler to open Q&A for the file. */
  onQA: (fileId: number) => void;
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render a community file card with metadata and action buttons.
 *
 * @param props - Component props.
 * @param props.file - File to display.
 * @param props.isActive - Whether the file is selected.
 * @param props.onSelect - Callback when file is selected.
 * @param props.onAiSummary - Callback to view AI summary.
 * @param props.onQA - Callback to open Q&A.
 * @returns The rendered file card.
 *
 * @category Components
 */
export const FileCard = React.memo(
  ({ file, isActive, onSelect, onAiSummary, onQA }: FileCardProps): React.ReactElement => {
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
                <Typography variant="body" weight="medium" className="truncate">{file.name}</Typography>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[10px] text-primary border-primary/30"
                  >
                    {file.category}
                  </Badge>
                  <Typography variant="micro" color="muted" as="span">
                    {file.size}
                  </Typography>
                  <Typography variant="micro" color="muted" as="span">
                    · {file.type.toUpperCase()}
                  </Typography>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAiSummary(file.id);
                      }}
                      className="text-muted-foreground hover:text-violet-600 hover:bg-violet-50 px-1.5"
                    >
                      <SparklesIcon className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">AI Summary</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQA(file.id);
                      }}
                      className="gap-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 px-1.5"
                    >
                      <MessageSquareIcon className="size-3.5" />
                      {file.qaCount > 0 && (
                        <span>{file.qaCount}</span>
                      )}
                    </Button>
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
              <Typography variant="micro" color="muted" as="span">
                {file.uploadedBy} · {file.uploadedAt}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

FileCard.displayName = "FileCard";
