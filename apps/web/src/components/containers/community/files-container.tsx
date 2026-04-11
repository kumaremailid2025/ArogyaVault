"use client";

/**
 * Left panel container for the files tab.
 *
 * @packageDocumentation
 * @category Containers
 */

import * as React from "react";
import { SearchIcon, FileUpIcon, FolderOpenIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { FileCard } from "@/components/community/file-card";
import { useCommunityFiles } from "@/data/community-files-data";
import type { FileCategory } from "@/data/community-files-data";
import type { CommunityFile } from "@/models/community";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props for the files container component.
 *
 * @category Types
 */
interface FilesContainerProps {
  /** Header title. */
  title: string;
  /** List of files to display. */
  files: CommunityFile[];
  /** Currently selected file ID. */
  selectedFileId: number | null;
  /** Handler when a file is selected. */
  onSelectFile: (fileId: number) => void;
  /** Handler to view AI summary for a file. */
  onAiSummary: (fileId: number) => void;
  /** Handler to open Q&A for a file. */
  onQA: (fileId: number) => void;
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the left panel for the files tab with list, search, and filters.
 *
 * @param props - Component props.
 * @param props.title - Header title.
 * @param props.files - Files to display.
 * @param props.selectedFileId - Currently selected file ID.
 * @param props.onSelectFile - Callback when file is selected.
 * @param props.onAiSummary - Callback to view file summary.
 * @param props.onQA - Callback to open file Q&A.
 * @returns The rendered container.
 *
 * @category Containers
 */
export const FilesContainer = ({
  title,
  files,
  selectedFileId,
  onSelectFile,
  onAiSummary,
  onQA,
}: FilesContainerProps): React.ReactElement => {
  const { FILE_CATEGORIES } = useCommunityFiles();
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
  }, [files, FILE_CATEGORIES]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">

      {/* ── Pinned header: title + upload + search + filters ── */}
      <div className="shrink-0 px-5 pt-4 pb-2 lg:px-6 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h4" as="h2">{title}</Typography>
            <Typography variant="caption" color="muted" as="span">
              {files.length} {files.length === 1 ? "file" : "files"}
            </Typography>
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
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full h-6 px-3 py-0 text-[11px] font-medium",
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable file list ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpenIcon className="size-10 text-muted-foreground/40 mb-3" />
            <Typography variant="body" weight="medium" color="muted">No files found</Typography>
            <Typography variant="caption" color="muted" className="/70 mt-1">
              {search.trim()
                ? "Try adjusting your search or filter."
                : "No files have been uploaded yet."}
            </Typography>
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
};
