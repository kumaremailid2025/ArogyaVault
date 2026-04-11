"use client";

import * as React from "react";
import {
  SearchIcon, UploadCloudIcon, FileTextIcon, ImageIcon,
  ClipboardListIcon, ShieldIcon, FileIcon, StethoscopeIcon,
  CalendarIcon, SparklesIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { useVaultHealth, type MedFile } from "@/data/vault-health-data";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   FILES FULL VIEW — shown when "Files" tab is active in banner
   Full-width file browser with larger cards.
═══════════════════════════════════════════════════════════════════ */

interface FilesFullViewProps {
  onFileClick?: (fileId: number) => void;
  selectedFileId?: number | null;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  lab: <FileTextIcon className="size-4 text-blue-500" />,
  prescription: <ClipboardListIcon className="size-4 text-green-500" />,
  imaging: <ImageIcon className="size-4 text-purple-500" />,
  discharge: <StethoscopeIcon className="size-4 text-orange-500" />,
  insurance: <ShieldIcon className="size-4 text-teal-500" />,
  other: <FileIcon className="size-4 text-muted-foreground" />,
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const FilesFullView = ({ onFileClick, selectedFileId }: FilesFullViewProps) => {
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
    <div className="max-w-4xl space-y-4 pb-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Button size="sm" className="gap-1.5">
          <UploadCloudIcon className="size-4" /> Upload Document
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        {FILE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
              category === c.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* File cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((file) => (
          <div
            key={file.id}
            onClick={() => onFileClick?.(file.id)}
            className={cn(
              "rounded-xl border p-4 transition-all bg-background cursor-pointer",
              selectedFileId === file.id
                ? "border-primary/40 ring-2 ring-primary/20 shadow-sm"
                : "border-border hover:border-primary/20 hover:shadow-sm"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{CATEGORY_ICONS[file.category]}</div>
              <div className="flex-1 min-w-0">
                <Typography variant="body" weight="medium" as="h4" truncate={true}>{file.name}</Typography>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <CalendarIcon className="size-3" />
                  <span>{formatDate(file.date)}</span>
                  <span>·</span>
                  <span>{file.size}</span>
                  <span className="capitalize px-1.5 py-0.5 rounded bg-muted text-[10px]">{file.category}</span>
                </div>
                {file.aiSummary && (
                  <div className="mt-2 flex items-start gap-1.5">
                    <SparklesIcon className="size-3 text-primary mt-0.5 shrink-0" />
                    <Typography variant="caption" color="muted" className="leading-relaxed line-clamp-2">
                      {file.aiSummary}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <FileIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
          <Typography variant="body" color="muted">No documents match your search.</Typography>
        </div>
      )}

      {/* Footer count */}
      <Typography variant="caption" color="muted" className="text-center">
        Showing {filtered.length} of {VAULT_FILES.length} documents
      </Typography>
    </div>
  );
};
