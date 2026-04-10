"use client";

/**
 * FilesPageContainer
 * ------------------
 * Self-contained container for the files tab (/community/files or /community/[groupId]/files).
 * Owns all files-specific state: file list, selection, Q&A, panel.
 *
 * Two-column layout: left (file list) | right (detail / Q&A).
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2Icon } from "lucide-react";

import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityFile } from "@/models/community";
import type { CommunityVariant, PanelState } from "./types";
import { GROUP_SLUG_TO_UUID } from "./types";

import { FilesContainer } from "./files-container";

/* ── Mock data (invited variant) ─────────────────────────────────── */
import { useCommunityFiles } from "@/data/community-files-data";
import { useLinkedMembers } from "@/data/linked-member-data";

/* ── API hooks (community variant) ───────────────────────────────── */
import { useFiles, useRecentFileQA, useAskFileQuestion } from "@/hooks/api";

/* ── Lazy: right panel ───────────────────────────────────────────── */

const PanelLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  </div>
);

const FilesRightPanel = dynamic(
  () => import("./files-right-panel").then((m) => ({ default: m.FilesRightPanel })),
  { ssr: false, loading: () => <PanelLoader /> },
);

/* ── Props ────────────────────────────────────────────────────────── */

interface FilesPageContainerProps {
  variant: CommunityVariant;
  group: string;
}

/* ── Component ────────────────────────────────────────────────────── */

export const FilesPageContainer = ({
  variant,
  group,
}: FilesPageContainerProps) => {
  const { INVITED_FILES, RECENT_FILE_QA } = useCommunityFiles();
  const { LINKED_MEMBER_DATA } = useLinkedMembers();
  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;
  const member = !isCommunity ? LINKED_MEMBER_DATA[group] : null;

  /* ── API hooks ── */
  const filesQuery = useFiles(groupId, {}, isCommunity);
  const recentQAQuery = useRecentFileQA(groupId, isCommunity);
  const askFileQuestionMut = useAskFileQuestion(groupId);

  /* ── State ── */
  const [selectedFileId, setSelectedFileId] = React.useState<number | null>(null);
  const [panelState, setPanelState] = React.useState<PanelState>({ view: "default" });

  /* Invited-only local files */
  const [invitedFiles, setInvitedFiles] = React.useState<CommunityFile[]>(
    INVITED_FILES[group] ?? [],
  );

  /* ── Resolved data ── */
  const communityFiles: CommunityFile[] = isCommunity
    ? ((filesQuery.data?.items as unknown as CommunityFile[]) ?? [])
    : invitedFiles;

  /* ── Derived ── */
  const activeFileId =
    panelState.view === "file-detail" || panelState.view === "file-qa"
      ? panelState.fileId
      : selectedFileId;

  const activeFile =
    activeFileId !== null
      ? communityFiles.find((f) => f.id === activeFileId) ?? null
      : null;

  const currentRecentQA = React.useMemo(() => {
    if (!isCommunity) {
      const invFiles = INVITED_FILES[group] ?? [];
      return invFiles
        .flatMap((f) =>
          f.questions.map((qa) => ({
            fileId: f.id,
            fileName: f.name,
            fileCategory: f.category,
            question: qa.question,
            askedBy: qa.askedBy,
            askedByInitials: qa.askedByInitials,
            askedAt: qa.askedAt,
            answer: qa.answer,
          })),
        )
        .slice(0, 5);
    }
    return recentQAQuery.data ?? RECENT_FILE_QA;
  }, [isCommunity, group, recentQAQuery.data]);

  /* ── Titles ── */
  const filesTitle = isCommunity
    ? "Community Files"
    : `${member?.name ?? ""}'s Shared Files`;

  /* ── Handlers ── */

  const handleSelectFile = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-detail", fileId });
  }, []);

  const handleFileAiSummary = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-detail", fileId });
  }, []);

  const handleFileQA = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-qa", fileId });
  }, []);

  const handleAskFileQuestion = React.useCallback(
    (payload: ComposeSubmitPayload) => {
      const text = payload.text.trim();
      if (!text) return;

      const fId =
        panelState.view === "file-detail" || panelState.view === "file-qa"
          ? panelState.fileId
          : selectedFileId;
      if (fId === null) return;

      if (isCommunity) {
        askFileQuestionMut.mutate({ fileId: fId, question: text });
        return;
      }

      setInvitedFiles((prev) =>
        prev.map((f) => {
          if (f.id !== fId) return f;
          const newQA = {
            id: f.questions.length + 1,
            question: text,
            askedBy: "Kumar",
            askedByInitials: "KU",
            askedAt: "Just now",
            answer:
              "ArogyaAI is analysing the document to answer your question. This typically takes a few moments for thorough analysis of the uploaded file content.",
          };
          return {
            ...f,
            qaCount: f.qaCount + 1,
            questions: [...f.questions, newQA],
          };
        }),
      );
    },
    [panelState, selectedFileId, isCommunity, askFileQuestionMut],
  );

  const handleSelectFileFromQA = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    setPanelState({ view: "file-detail", fileId });
  }, []);

  /* ── Render ── */
  return (
    <>
      {/* LEFT — Files list with search/filter */}
      <FilesContainer
        title={filesTitle}
        files={communityFiles}
        selectedFileId={selectedFileId}
        onSelectFile={handleSelectFile}
        onAiSummary={handleFileAiSummary}
        onQA={handleFileQA}
      />

      {/* Vertical divider */}
      <div className="w-px bg-border shrink-0" />

      {/* RIGHT — File detail / Q&A / Recent Q&A */}
      <FilesRightPanel
        panelState={panelState}
        activeFile={activeFile}
        recentFileQA={currentRecentQA}
        onClosePanel={() => {
          setPanelState({ view: "default" });
          setSelectedFileId(null);
        }}
        onAskFileQuestion={handleAskFileQuestion}
        onSelectFileFromQA={handleSelectFileFromQA}
      />
    </>
  );
};
