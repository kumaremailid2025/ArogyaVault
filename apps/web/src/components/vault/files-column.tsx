"use client";

import * as React from "react";
import {
  SearchIcon, UploadCloudIcon, FileTextIcon, ImageIcon,
  ClipboardListIcon, ShieldIcon, FileIcon, StethoscopeIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { useVaultHealth, type MedFile } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   FILES COLUMN — narrow right panel
   Searchable, filterable file list with upload button.
═══════════════════════════════════════════════════════════════════ */

interface FilesColumnProps {
  onFileClick?: (fileId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  lab: <FileTextIcon className="size-3.5 text-blue-500" />,
  prescription: <ClipboardListIcon className="size-3.5 text-green-500" />,
  imaging: <ImageIcon className="size-3.5 text-purple-500" />,
  discharge: <StethoscopeIcon className="size-3.5 text-orange-500" />,
  insurance: <ShieldIcon className="size-3.5 text-teal-500" />,
  other: <FileIcon className="size-3.5 text-muted-foreground" />,
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const FilesColumn = ({ onFileClick }: FilesColumnProps) => {
  const { VAULT_FILES, FILE_CATEGORIES } = useVaultHealth();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");

  const filtered = React.useMemo(() => {
    let files = VAULT_FILES;
    if (category !== "all") files = files.filter((f) => f.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      files = files.filter((f) => f.name.toLowerCase().includes(q));
    }
    return files;
  }, [search, category]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Files</span>
        <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 px-2">
          <UploadCloudIcon className="size-3" /> Upload
        </Button>
      </div>

      {/* Search */}
      <div className="relative px-2 pb-2">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-7 pl-7 pr-2 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1 px-2 pb-2">
        {FILE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer",
              category === c.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
        {filtered.map((file) => (
          <button
            key={file.id}
            onClick={() => onFileClick?.(file.id)}
            className="w-full flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left cursor-pointer"
          >
            <div className="mt-0.5 shrink-0">{CATEGORY_ICONS[file.category]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate leading-tight">{file.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {formatDate(file.date)} · {file.size}
              </div>
              {file.aiSummary && (
                <div className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2 leading-snug">
                  {file.aiSummary}
                </div>
              )}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No files match your search.
          </div>
        )}
      </div>

      {/* Count footer */}
      <div className="px-2 py-1.5 border-t border-border text-[10px] text-muted-foreground text-center">
        {filtered.length} of {VAULT_FILES.length} documents
      </div>
    </div>
  );
};
