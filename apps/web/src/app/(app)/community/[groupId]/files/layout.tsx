"use client";

/**
 * Files Layout — Invited Group
 * ----------------------------
 * Thin wrapper that renders FilesLayoutContent for /community/[groupId]/files routes.
 */

import { useParams, notFound } from "next/navigation";
import { FilesLayoutContent } from "@/app/(app)/community/_components/files-layout-content";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

interface FilesLayoutProps {
  children: React.ReactNode;
}

export default function GroupFilesLayout({ children }: FilesLayoutProps) {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId];

  if (!slug) {
    notFound();
  }

  const basePath = `/community/${params.groupId}`;

  return (
    <FilesLayoutContent variant="invited" group={slug} basePath={basePath}>
      {children}
    </FilesLayoutContent>
  );
}
