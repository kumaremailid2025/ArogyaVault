"use client";

/**
 * FilesLayoutContent
 * ------------------
 * Shared two-column files layout used by both main /community and /community/[groupId].
 * LEFT: FilesContainer with file list and search
 * RIGHT: {children} (route-driven panel)
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

import type { CommunityFile } from "@/models/community";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityVariant } from "@/components/containers/community/types";

import { FilesProvider } from "@/app/(app)/community/_context/files-context";
import { FilesContainer } from "@/components/containers/community/files-container";

/* ── API hooks ────────────────────────────────────────────────── */
import { useFiles, useRecentFileQA, useAskFileQuestion } from "@/hooks/api";

/* ── Mock data ────────────────────────────────────────────────── */
import { INVITED_FILES, RECENT_FILE_QA } from "@/data/community-files-data";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";

interface FilesLayoutContentProps {
  variant: CommunityVariant;
  group: string;
  basePath: string; // "/community" or "/community/<uuid>"
  children: React.ReactNode;
}

export const FilesLayoutContent = ({ variant, group, basePath, children }: FilesLayoutContentProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;

  /* ── API hooks ── */
  const filesQuery = useFiles(groupId, isCommunity);
  const recentQAQuery = useRecentFileQA(groupId, isCommunity);
  const askFileQuestionMut = useAskFileQuestion(groupId);

  /* ── State ── */
  const [selectedFileId, setSelectedFileId] = React.useState<number | null>(null);

  /* Invited-only local files */
  const [invitedFiles, setInvitedFiles] = React.useState<CommunityFile[]>(
    INVITED_FILES[group] ?? [],
  );

  /* ── Derive selectedFileId from URL ── */
  React.useEffect(() => {
    const match = pathname.match(/\/files\/(\d+)$/);
    if (match) {
      setSelectedFileId(parseInt(match[1], 10));
    } else {
      setSelectedFileId(null);
    }
  }, [pathname]);

  /* ── Resolved data ── */
  const communityFiles: CommunityFile[] = isCommunity
    ? ((filesQuery.data as CommunityFile[]) ?? [])
    : invitedFiles;

  /* ── Derived recent QA ── */
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
  const filesTitle = isCommunity ? "Community Files" : "Shared Files";

  /* ── Handlers ── */
  const handleSelectFile = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    router.push(`${basePath}/files/${fileId}`);
  }, [router, basePath]);

  const handleFileAiSummary = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    router.push(`${basePath}/files/${fileId}`);
  }, [router, basePath]);

  const handleFileQA = React.useCallback((fileId: number) => {
    setSelectedFileId(fileId);
    router.push(`${basePath}/files/${fileId}`);
  }, [router, basePath]);

  const handleAskFileQuestion = React.useCallback(
    (payload: ComposeSubmitPayload) => {
      const text = payload.text.trim();
      if (!text) return;

      const fId = selectedFileId;
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
    [selectedFileId, isCommunity, askFileQuestionMut],
  );

  /* ── Context value ── */
  const contextValue = React.useMemo(
    () => ({
      variant,
      group,
      basePath,
      files: communityFiles,
      selectedFileId,
      setSelectedFileId,
      recentFileQA: currentRecentQA,
      handleAskFileQuestion,
    }),
    [variant, group, basePath, communityFiles, selectedFileId, currentRecentQA, handleAskFileQuestion],
  );

  /* ── Render ── */
  return (
    <FilesProvider value={contextValue}>
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

        {/* RIGHT — Child panel page */}
        <div className="w-[360px] shrink-0 border-l border-border overflow-hidden flex flex-col">
          {children}
        </div>
      </>
    </FilesProvider>
  );
};
