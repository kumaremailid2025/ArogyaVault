"use client";

import { FileTextIcon, FileUpIcon } from "lucide-react";
import { Button } from "@/core/ui/button";

/* ── Types ──────────────────────────────────────────────────────── */

export interface FileItem {
  name: string;
  size: string;
  date: string;
}

interface FilesContainerProps {
  /** Heading shown above the list — e.g. "Community Files" or "Ravi Kumar's Shared Files" */
  title: string;
  /** Files to display; falls back to placeholder data when omitted */
  files?: FileItem[];
}

/* ── Defaults ───────────────────────────────────────────────────── */

const DEFAULT_COMMUNITY_FILES: FileItem[] = [
  { name: "Community Guidelines.pdf",    size: "245 KB", date: "Mar 28, 2026" },
  { name: "Health Tips Collection.pdf",  size: "1.2 MB", date: "Mar 25, 2026" },
  { name: "Weekly Newsletter #42.pdf",   size: "890 KB", date: "Mar 22, 2026" },
  { name: "Diet Plan Template.xlsx",     size: "56 KB",  date: "Mar 18, 2026" },
  { name: "Exercise Routine Guide.pdf",  size: "3.4 MB", date: "Mar 15, 2026" },
];

/* ── Component ──────────────────────────────────────────────────── */

export function FilesContainer({ title, files }: FilesContainerProps) {
  const items = files ?? DEFAULT_COMMUNITY_FILES;

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6 pt-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileUpIcon className="size-3.5" /> Upload
          </Button>
        </div>

        {/* File list */}
        {items.map((f) => (
          <div
            key={f.name}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/20 hover:bg-muted/30 cursor-pointer transition-colors"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileTextIcon className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{f.name}</p>
              <p className="text-xs text-muted-foreground">
                {f.size} · {f.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
