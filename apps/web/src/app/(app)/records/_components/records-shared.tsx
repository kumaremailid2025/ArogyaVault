"use client";

/**
 * Records page shared types + UI helpers.
 *
 * All mock data (CATEGORIES, CATEGORY_COLOR, MY_DOCS, GROUP_DOCS, GROUP_NAMES)
 * now lives in the backend bundle — consume it via `useRecords()` from
 * `@/data/records-data`.
 */

import * as React from "react";
import { FileTextIcon, CalendarIcon, UserIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import type { Doc } from "@/data/records-data";

export type { Category, Doc } from "@/data/records-data";
export { useRecords } from "@/data/records-data";

interface DocCardProps {
  doc: Doc;
  categoryColor?: Record<string, string>;
}

export const DocCard = ({ doc, categoryColor }: DocCardProps) => {
  const colors = categoryColor ?? {};
  return (
    <div className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            colors[doc.type] ?? "bg-muted text-muted-foreground"
          )}
        >
          <FileTextIcon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{doc.title}</span>
            <Badge
              variant="outline"
              className={cn("text-[10px]", colors[doc.type])}
            >
              {doc.type}
            </Badge>
            {doc.flag && (
              <Badge className="text-[10px] bg-rose-100 text-rose-700 border-0">
                Warning Flagged
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {doc.summary}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              {doc.date}
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="size-3" />
              {doc.doctor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
