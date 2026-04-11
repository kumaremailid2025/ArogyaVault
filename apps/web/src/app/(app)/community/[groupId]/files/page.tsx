"use client";

/**
 * Files Default Page — Invited Group
 * -----------------------------------
 * Displays "Recent Questions & Answers" across all files.
 * Rendered when no specific file is selected.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquareIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";

import { useFilesContext } from "@/app/(app)/community/_context/files-context";
import Typography from "@/components/ui/typography";

export default function GroupFilesDefaultPage() {
  const router = useRouter();
  const { recentFileQA, basePath } = useFilesContext();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <Typography variant="overline" color="muted">
        <MessageSquareIcon className="size-3 text-primary" />
        Recent Questions &amp; Answers
      </Typography>

      {/* QA Items */}
      <div className="space-y-3">
        {recentFileQA.map((item, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`${basePath}/files/${item.fileId}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push(`${basePath}/files/${item.fileId}`);
              }
            }}
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
                <Typography variant="micro" weight="semibold" as="span" className="text-violet-600">ArogyaAI</Typography>
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
  );
}
