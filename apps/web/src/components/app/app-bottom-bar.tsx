"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SendIcon, UploadCloudIcon, XIcon,
  FileTextIcon, CheckCircle2Icon, LoaderIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { cn } from "@/lib/utils";

type UploadFile = { name: string; size: string; status: "uploading" | "done" };

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export const AppBottomBar = () => {
  const pathname = usePathname();
  const router   = useRouter();
  const isAskAI  = pathname === "/arogya-ai";

  /* All hooks must be called before any conditional return */
  const [query, setQuery] = React.useState("");
  const [uploads, setUploads] = React.useState<UploadFile[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const inputRef     = React.useRef<HTMLInputElement>(null);

  /* Hide on pages that have their own input areas */
  const isCommunity = pathname.startsWith("/community");
  const isLearn     = pathname.startsWith("/learn");
  const isArogyaAi  = pathname.startsWith("/arogya-ai");
  if (isCommunity || isLearn || isArogyaAi) return null;

  /* ── Send query ───────────────────────────────────────────────── */
  const handleSend = () => {
    const q = query.trim();
    if (!q) return;
    setQuery("");
    /* Navigate to arogya-ai with the query as a param */
    router.push("/arogya-ai?q=" + encodeURIComponent(q));
  };

  /* ── Upload ───────────────────────────────────────────────────── */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newUploads: UploadFile[] = files.map((f) => ({
      name:   f.name,
      size:   formatSize(f.size),
      status: "uploading" as const,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    /* Simulate upload: mark done after 1.8s per file */
    newUploads.forEach((_, i) => {
      setTimeout(() => {
        setUploads((prev) =>
          prev.map((u, idx) => {
            /* Mark the newly added ones as done */
            const offset = prev.length - newUploads.length + i;
            return idx === offset ? { ...u, status: "done" } : u;
          })
        );
      }, 1800 + i * 400);
    });

    /* Clear input so the same file can be re-selected */
    e.target.value = "";
  };

  const dismissUpload = (name: string) => {
    setUploads((prev) => prev.filter((u) => u.name !== name));
  };

  return (
    <div className="shrink-0 border-t border-border bg-background">
      {/* Upload status strip */}
      {uploads.length > 0 && (
        <div className="px-4 pt-2.5 flex flex-col gap-1.5">
          {uploads.map((u) => (
            <div
              key={u.name}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs border",
                u.status === "done"
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-muted/40"
              )}
            >
              {u.status === "uploading" ? (
                <LoaderIcon className="size-3.5 animate-spin text-muted-foreground shrink-0" />
              ) : (
                <CheckCircle2Icon className="size-3.5 text-primary shrink-0" />
              )}
              <FileTextIcon className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate flex-1 font-medium">{u.name}</span>
              <span className="text-muted-foreground shrink-0">{u.size}</span>
              {u.status === "done" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => dismissUpload(u.name)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="px-4 py-3 flex items-center gap-2">
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={handleFilesSelected}
        />

        {/* Upload button */}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 text-muted-foreground hover:text-primary"
          onClick={handleUploadClick}
          title="Upload documents"
        >
          <UploadCloudIcon className="size-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>

        {/* AI search input */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:border-primary transition-colors">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAskAI
                ? "Ask a follow-up question…"
                : "Ask anything about your health records…"
            }
            className="flex-1 border-0 shadow-none bg-transparent h-auto py-0 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* Send */}
        <Button
          size="icon"
          className="size-9 shrink-0"
          disabled={!query.trim()}
          onClick={handleSend}
          title="Send to ArogyaAI"
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
