"use client";

import * as React from "react";
import { SearchIcon, FileUpIcon, FolderOpenIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { FileCard } from "@/components/community/file-card";
import { FILE_CATEGORIES } from "@/data/community-files-data";
import type { FileCategory } from "@/data/community-files-data";
import type { CommunityFile } from "@/models/community";

/* ── Props ─────────────────────────────────────────────────────── */

interface FilesContainerProps {
  title: string;
  files: CommunityFile[];
  selectedFileId: number | null;
  onSelectFile: (fileId: number) => void;
  onAiSummary: (fileId: number) => void;
  onQA: (fileId: number) => void;
}

/* ── Component ─────────────────────────────────────────────────── */

export function FilesContainer({
  title,
  files,
  selectedFileId,
  onSelectFile,
  onAiSummary,
  onQA,
}: FilesContainerProps) {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<FileCategory>("All");

  /* ── Filtered files ── */
  const filtered = React.useMemo(() => {
    let result = files;
    if (activeCategory !== "All") {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.uploadedBy.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [files, activeCategory, search]);

  /* ── Categories present in current file set ── */
  const availableCategories = React.useMemo(() => {
    const cats = new Set(files.map((f) => f.category));
    return FILE_CATEGORIES.filter((c) => c === "All" || cats.has(c));
  }, [files]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">

      {/* ── Pinned header: title + upload + search + filters ── */}
      <div className="shrink-0 px-5 pt-4 pb-2 lg:px-6 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">{title}</h2>
            <span className="text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileUpIcon className="size-3.5" /> Upload
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files by name, uploader, or category…"
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Category filter chips */}
        {availableCategories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors border",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable file list ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpenIcon className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No files found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {search.trim()
                ? "Try adjusting your search or filter."
                : "No files have been uploaded yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {filtered.map((f) => (
              <FileCard
                key={f.id}
                file={f}
                isActive={selectedFileId === f.id}
                onSelect={onSelectFile}
                onAiSummary={onAiSummary}
                onQA={onQA}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
