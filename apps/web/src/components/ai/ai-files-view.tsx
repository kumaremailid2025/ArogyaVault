"use client";

/**
 * @file ai-files-view.tsx
 * @packageDocumentation
 * @category Components
 *
 * AiFilesView — the "Files" tab inside the ArogyaAI section.
 *
 * Two-panel layout:
 *  - **Left panel (280 px)** — searchable file list + recent Q&A strip.
 *  - **Right panel (flex-1)** — switches between:
 *      - {@link FilesOverviewPanel} when no file is selected (shows a vault
 *        summary: category breakdown, recently added files, recent Q&A).
 *      - {@link FileDetailPanel} when a file row is clicked (AI summary,
 *        full Q&A thread, inline ask input).
 *
 * All interactive elements use project core UI primitives (`Button`, `Input`,
 * `Badge`, `ScrollArea`). No raw `<button>` or `<input>` elements.
 */

import * as React from "react";
import {
  MessageSquareIcon,
  FileTextIcon,
  SparklesIcon,
  FolderOpenIcon,
  SearchIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  PillIcon,
  ScanIcon,
  ClipboardListIcon,
  ShieldIcon,
  FileIcon,
  ArrowRightIcon,
  InfoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Badge } from "@/core/ui/badge";
import { ScrollArea } from "@/core/ui/scroll-area";
import Typography from "@/components/ui/typography";
import { useVaultHealth } from "@/data/vault-health-data";
import type { MedFile, FileQAEntry } from "@/data/vault-health-data";

/* ─────────────────────────────────────────────────────────────────────
   CATEGORY MAPS
───────────────────────────────────────────────────────────────────── */

/**
 * Human-readable label for each {@link MedFile} category key.
 * @category Constants
 */
const CATEGORY_LABEL: Record<MedFile["category"], string> = {
  lab:          "Lab Report",
  prescription: "Prescription",
  imaging:      "Imaging",
  discharge:    "Discharge",
  insurance:    "Insurance",
  other:        "Other",
};

/**
 * Tailwind colour utility classes for each file category badge / card.
 * @category Constants
 */
const CATEGORY_COLOR: Record<MedFile["category"], string> = {
  lab:          "bg-blue-50 text-blue-700 border-blue-200",
  prescription: "bg-emerald-50 text-emerald-700 border-emerald-200",
  imaging:      "bg-violet-50 text-violet-700 border-violet-200",
  discharge:    "bg-amber-50 text-amber-700 border-amber-200",
  insurance:    "bg-slate-50 text-slate-600 border-slate-200",
  other:        "bg-muted text-muted-foreground border-border",
};

/**
 * Lucide icon component for each file category.
 * @category Constants
 */
const CATEGORY_ICON: Record<MedFile["category"], React.FC<React.SVGProps<SVGSVGElement>>> = {
  lab:          FlaskConicalIcon,
  prescription: PillIcon,
  imaging:      ScanIcon,
  discharge:    ClipboardListIcon,
  insurance:    ShieldIcon,
  other:        FileIcon,
};

/* ─────────────────────────────────────────────────────────────────────
   FILE LIST ITEM  (left panel)
───────────────────────────────────────────────────────────────────── */

/**
 * Props for {@link FileListItem}.
 * @category Types
 */
interface FileListItemProps {
  /** The vault file to render. */
  file: MedFile;
  /** Whether this file is currently selected in the right panel. */
  isSelected: boolean;
  /** Called when the user taps this file row. */
  onClick: () => void;
}

/**
 * FileListItem
 * ────────────
 * A single row inside the left file-browser panel.
 * Highlights the active selection and shows a category badge.
 *
 * @param props - {@link FileListItemProps}
 */
const FileListItem = ({ file, isSelected, onClick }: FileListItemProps) => {
  const Icon = CATEGORY_ICON[file.category];
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-auto w-full justify-start gap-2.5 rounded-lg border px-3 py-2",
        isSelected
          ? "border-primary/30 bg-primary/8"
          : "border-transparent hover:border-border hover:bg-muted/40"
      )}
    >
      <div className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border",
        CATEGORY_COLOR[file.category]
      )}>
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <Typography
          variant="caption"
          weight="medium"
          truncate={true}
          color={isSelected ? "primary" : "default"}
        >
          {file.name}
        </Typography>
        <Typography variant="micro" color="muted" as="span">{file.date}</Typography>
      </div>
      <ChevronRightIcon className={cn(
        "size-3.5 shrink-0",
        isSelected ? "text-primary" : "text-muted-foreground/40"
      )} />
    </Button>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   FILES OVERVIEW PANEL  (right panel — no file selected)
───────────────────────────────────────────────────────────────────── */

/**
 * Props for {@link AiFilesOverviewPanel}.
 * @category Types
 */
export interface AiFilesOverviewPanelProps {
  /** All vault files. */
  files: MedFile[];
  /** All Q&A history entries. */
  qaHistory: FileQAEntry[];
  /** Called when the user clicks a file from the overview. */
  onSelectFile: (id: number) => void;
}

/**
 * AiFilesOverviewPanel
 * ────────────────────
 * Shown in the right panel when no file is selected.
 * Displays a health-vault summary: category breakdown, recently added
 * documents, and the latest Q&A entries across all files.
 *
 * Can be used standalone in a route page — `onSelectFile` typically calls
 * `router.push('/arogya-ai/files/${id}')`.
 *
 * @param props - {@link AiFilesOverviewPanelProps}
 */
export const AiFilesOverviewPanel = ({ files, qaHistory, onSelectFile }: AiFilesOverviewPanelProps) => {

  /* Category breakdown counts */
  const categoryCount = React.useMemo(() => {
    const counts: Partial<Record<MedFile["category"], number>> = {};
    files.forEach((f) => { counts[f.category] = (counts[f.category] ?? 0) + 1; });
    return counts;
  }, [files]);

  /** Categories that have at least one file, sorted by count descending. */
  const activeCategories = (Object.entries(categoryCount) as [MedFile["category"], number][])
    .sort((a, b) => b[1] - a[1]);

  /** Three most recently added files (assumes array is already sorted by date desc). */
  const recentFiles = files.slice(0, 3);

  /** Five most recent Q&A entries. */
  const recentQA = qaHistory.slice(0, 4);

  return (
    <ScrollArea className="h-full">
      <div className="px-4 py-4 space-y-5">

        {/* ── Vault summary header ─────────────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
              <FolderOpenIcon className="size-4.5 text-primary" />
            </div>
            <div>
              <Typography variant="h4" as="p">Health Document Vault</Typography>
              <Typography variant="micro" color="muted">
                {files.length} document{files.length !== 1 ? "s" : ""} · AI-indexed
              </Typography>
            </div>
          </div>
          <Typography variant="caption" color="muted" className="leading-snug">
            ArogyaAI has analyzed all your uploaded health documents. Select any file to
            view its AI summary and ask specific questions.
          </Typography>
        </div>

        {/* ── Category breakdown ───────────────────────────────── */}
        {activeCategories.length > 0 && (
          <section className="space-y-2">
            <Typography variant="overline" color="muted">By Category</Typography>
            <div className="grid grid-cols-2 gap-2">
              {activeCategories.map(([cat, count]) => {
                const Icon = CATEGORY_ICON[cat];
                return (
                  <div
                    key={cat}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2.5",
                      CATEGORY_COLOR[cat]
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
                    <div className="min-w-0">
                      <Typography variant="micro" weight="semibold" as="span" className="block">
                        {CATEGORY_LABEL[cat]}
                      </Typography>
                      <Typography variant="micro" as="span" className="opacity-70">
                        {count} file{count !== 1 ? "s" : ""}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Recently added files ─────────────────────────────── */}
        {recentFiles.length > 0 && (
          <section className="space-y-2">
            <Typography variant="overline" color="muted">Recently Added</Typography>
            <div className="space-y-1.5">
              {recentFiles.map((file) => {
                const Icon = CATEGORY_ICON[file.category];
                return (
                  <Button
                    key={file.id}
                    variant="ghost"
                    onClick={() => onSelectFile(file.id)}
                    className="h-auto w-full justify-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 hover:border-primary/20 hover:bg-muted/30"
                  >
                    <div className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border",
                      CATEGORY_COLOR[file.category]
                    )}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <Typography variant="caption" weight="medium" truncate={true}>
                        {file.name}
                      </Typography>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] border", CATEGORY_COLOR[file.category])}
                        >
                          {CATEGORY_LABEL[file.category]}
                        </Badge>
                        <Typography variant="micro" color="muted" as="span">{file.date}</Typography>
                      </div>
                    </div>
                    <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground/50" />
                  </Button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Recent Q&A ───────────────────────────────────────── */}
        {recentQA.length > 0 && (
          <section className="space-y-2">
            <Typography variant="overline" color="muted" className="flex items-center gap-1.5">
              <MessageSquareIcon className="size-3 text-primary" />
              Recent Q&amp;A
            </Typography>
            <div className="space-y-2">
              {recentQA.map((entry) => (
                <Button
                  key={entry.id}
                  variant="ghost"
                  onClick={() => onSelectFile(entry.fileId)}
                  className="h-auto w-full flex-col items-stretch gap-2 rounded-lg border border-border bg-background p-3 hover:border-primary/20 hover:bg-muted/30"
                >
                  {/* File ref */}
                  <div className="flex items-center gap-1.5">
                    <FileTextIcon className="size-3 text-muted-foreground shrink-0" />
                    <Typography variant="micro" color="muted" as="span" truncate={true}>{entry.fileName}</Typography>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] ml-auto shrink-0", CATEGORY_COLOR[entry.fileCategory])}
                    >
                      {CATEGORY_LABEL[entry.fileCategory]}
                    </Badge>
                  </div>
                  {/* Question */}
                  <Typography variant="caption" className="font-medium text-left line-clamp-2">
                    {entry.question}
                  </Typography>
                  {/* AI answer snippet */}
                  <div className="rounded-md bg-violet-50/60 border border-violet-100 px-2.5 py-1.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      <SparklesIcon className="size-2.5 text-violet-500" />
                      <Typography variant="micro" weight="semibold" as="span" className="text-violet-600">ArogyaAI</Typography>
                      <Typography variant="micro" color="muted" as="span" className="ml-auto">{entry.askedAt}</Typography>
                    </div>
                    <Typography variant="micro" className="text-foreground/70 line-clamp-2 text-left">{entry.answer}</Typography>
                  </div>
                </Button>
              ))}
            </div>
          </section>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <FolderOpenIcon className="size-7 text-muted-foreground/50" />
            </div>
            <div>
              <Typography variant="h5" weight="semibold">No documents yet</Typography>
              <Typography variant="caption" color="muted" className="mt-1">
                Upload your health records to the vault and ArogyaAI will analyse them instantly.
              </Typography>
            </div>
          </div>
        )}

        {/* ── Select-a-file tip ─────────────────────────────────── */}
        {files.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3">
            <InfoIcon className="size-4 shrink-0 text-primary/60 mt-0.5" />
            <Typography variant="caption" color="muted">
              Select any document from the list to view its full AI summary, ask questions, and explore past Q&amp;A threads.
            </Typography>
          </div>
        )}

      </div>
    </ScrollArea>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   FILE DETAIL PANEL  (right panel — file selected)
───────────────────────────────────────────────────────────────────── */

/**
 * Props for {@link AiFileDetailPanel}.
 * @category Types
 */
export interface AiFileDetailPanelProps {
  /** The currently selected vault file. */
  file: MedFile;
  /** Full vault Q&A history; filtered locally to this file. */
  qaHistory: FileQAEntry[];
  /** Called when the user asks a question; routes to the main AI Chat tab. */
  onAsk: (question: string) => void;
}

/**
 * AiFileDetailPanel
 * ─────────────────
 * Right-panel content shown when a file is selected.
 *
 * Displays:
 *  - File metadata + category badge
 *  - AI summary card (if the file has one)
 *  - Full Q&A thread for this file
 *  - Inline ask-question input that routes to AI Chat
 *
 * Can be used standalone in a route page — `onAsk` typically calls
 * `router.push('/arogya-ai?q='+encodeURIComponent(question))`.
 *
 * @param props - {@link AiFileDetailPanelProps}
 */
export const AiFileDetailPanel = ({ file, qaHistory, onAsk }: AiFileDetailPanelProps) => {
  const [input, setInput] = React.useState("");
  const Icon = CATEGORY_ICON[file.category];

  /** Submits the typed question via `onAsk` and clears the input. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    onAsk(q);
    setInput("");
  };

  const fileHistory = qaHistory.filter((q) => q.fileId === file.id);

  return (
    <div className="h-full flex flex-col">

      {/* Header ──────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            CATEGORY_COLOR[file.category]
          )}>
            <Icon className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <Typography variant="h5" weight="semibold" truncate={true}>{file.name}</Typography>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-[10px]", CATEGORY_COLOR[file.category])}>
                {CATEGORY_LABEL[file.category]}
              </Badge>
              <Typography variant="micro" color="muted" as="span">{file.date}</Typography>
              <Typography variant="micro" color="muted" as="span" className="opacity-40">·</Typography>
              <Typography variant="micro" color="muted" as="span">{file.size}</Typography>
            </div>
          </div>
        </div>

        {/* AI Summary ─────────────────────────────────────────────── */}
        {file.aiSummary && (
          <div className="mt-3 rounded-xl bg-violet-50/60 border border-violet-100 px-3.5 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <SparklesIcon className="size-3.5 text-violet-500" />
              <Typography variant="caption" weight="semibold" as="span" className="text-violet-700">AI Summary</Typography>
            </div>
            <Typography variant="caption" className="text-foreground/80 leading-relaxed">{file.aiSummary}</Typography>
          </div>
        )}
      </div>

      {/* Q&A thread ──────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-3">

          {/* Thread header */}
          <Typography variant="overline" color="muted" className="flex items-center gap-1.5">
            <MessageSquareIcon className="size-3 text-primary" />
            Questions &amp; Answers
            {fileHistory.length > 0 && (
              <Badge variant="outline" className="ml-1 text-[9px]">{fileHistory.length}</Badge>
            )}
          </Typography>

          {fileHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
              <MessageSquareIcon className="size-6 text-muted-foreground/30" />
              <Typography variant="caption" color="muted">
                No questions yet — ask anything about this file below.
              </Typography>
            </div>
          ) : (
            fileHistory.map((entry) => (
              <div key={entry.id} className="space-y-1.5">
                {/* Question */}
                <div className="flex gap-2.5">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                    <Typography variant="micro" weight="bold" color="primary" as="span" className="text-[8px]">KU</Typography>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography variant="caption" className="font-medium">{entry.question}</Typography>
                    <Typography variant="micro" color="muted" as="span" className="mt-0.5">{entry.askedAt}</Typography>
                  </div>
                </div>
                {/* AI Answer */}
                <div className="ml-8 rounded-xl bg-violet-50/60 border border-violet-100 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <SparklesIcon className="size-3 text-violet-500" />
                    <Typography variant="micro" weight="semibold" as="span" className="text-violet-600">ArogyaAI</Typography>
                  </div>
                  <Typography variant="caption" className="text-foreground/80 leading-relaxed">{entry.answer}</Typography>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Ask input ────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border px-5 py-3">
        <Typography variant="micro" color="muted" className="mb-1.5">
          Ask ArogyaAI about this file — your question will open in AI Chat.
        </Typography>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${file.name.split(".")[0]}…`}
          />
          <Button type="submit" disabled={!input.trim()} size="sm">
            Ask
          </Button>
        </div>
      </form>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   FILES LIST PANEL  (left panel — controlled)
───────────────────────────────────────────────────────────────────── */

/**
 * Props for {@link AiFilesListPanel}.
 * @category Types
 */
export interface AiFilesListPanelProps {
  /**
   * ID of the currently selected file, or `null` when none is selected.
   * Controlled externally — typically derived from the URL pathname.
   */
  selectedFileId: number | null;
  /** Called when the user taps a file row. Caller should update the URL. */
  onSelectFile: (id: number) => void;
}

/**
 * AiFilesListPanel
 * ────────────────
 * Left-panel file browser: search bar + scrollable file list.
 *
 * Designed to be used as the permanent left panel inside
 * {@link AiFilesLayoutContent}. Selection state is **controlled** —
 * the parent derives `selectedFileId` from the URL and calls
 * `router.push('/arogya-ai/files/${id}')` via `onSelectFile`.
 *
 * Width is NOT set here — the parent layout sets `w-[260px]`.
 *
 * @param props - {@link AiFilesListPanelProps}
 *
 * @example
 * ```tsx
 * <AiFilesListPanel
 *   selectedFileId={selectedId}
 *   onSelectFile={(id) => router.push(`/arogya-ai/files/${id}`)}
 * />
 * ```
 */
export const AiFilesListPanel = ({ selectedFileId, onSelectFile }: AiFilesListPanelProps) => {
  const { VAULT_FILES } = useVaultHealth();
  const [search, setSearch] = React.useState("");

  /** Files filtered by search query (name or category, case-insensitive). */
  const filteredFiles = search.trim()
    ? VAULT_FILES.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        CATEGORY_LABEL[f.category].toLowerCase().includes(search.toLowerCase())
      )
    : VAULT_FILES;

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Search */}
      <div className="shrink-0 px-3 pt-3 pb-2">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Count label */}
      <div className="shrink-0 px-3 pb-1">
        <Typography variant="overline" color="muted" className="flex items-center gap-1.5">
          <FolderOpenIcon className="size-3 text-primary" />
          {filteredFiles.length} of {VAULT_FILES.length} documents
        </Typography>
      </div>

      {/* File list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-2 pb-2 space-y-0.5">
          {filteredFiles.length === 0 ? (
            <div className="py-6 text-center px-3">
              <Typography variant="caption" color="muted">No files match your search.</Typography>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                isSelected={selectedFileId === file.id}
                onClick={() => onSelectFile(file.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   MAIN COMPONENT  (self-contained, for backward compatibility)
───────────────────────────────────────────────────────────────────── */

/**
 * Props for {@link AiFilesView}.
 * @category Types
 */
interface AiFilesViewProps {
  /**
   * Called when the user submits a question from the file detail panel.
   * The caller should route to the AI Chat tab with the question pre-loaded.
   */
  onAsk: (question: string) => void;
}

/**
 * AiFilesView
 * ───────────
 * Self-contained two-panel files view. Manages selection state internally.
 *
 * For route-based layouts use {@link AiFilesListPanel} +
 * {@link AiFilesOverviewPanel} / {@link AiFileDetailPanel} individually.
 *
 * @param props - {@link AiFilesViewProps}
 *
 * @example
 * ```tsx
 * <AiFilesView onAsk={(q) => { addToConversation(q); setActiveTab("ai-chat"); }} />
 * ```
 */
export const AiFilesView = ({ onAsk }: AiFilesViewProps) => {
  const { VAULT_FILES, FILE_QA_HISTORY } = useVaultHealth();

  const [selectedFileId, setSelectedFileId] = React.useState<number | null>(null);

  const selectedFile = selectedFileId !== null
    ? (VAULT_FILES.find((f) => f.id === selectedFileId) ?? null)
    : null;

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── LEFT PANEL — file list (260 px) ──────────────────────── */}
      <div className="w-[260px] shrink-0 border-r border-border overflow-hidden">
        <AiFilesListPanel
          selectedFileId={selectedFileId}
          onSelectFile={setSelectedFileId}
        />
      </div>

      {/* ── RIGHT PANEL — overview or detail ─────────────────────── */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {selectedFile ? (
          <AiFileDetailPanel
            file={selectedFile}
            qaHistory={FILE_QA_HISTORY}
            onAsk={(q) => { setSelectedFileId(null); onAsk(q); }}
          />
        ) : (
          <AiFilesOverviewPanel
            files={VAULT_FILES}
            qaHistory={FILE_QA_HISTORY}
            onSelectFile={setSelectedFileId}
          />
        )}
      </div>

    </div>
  );
};
