"use client";

/**
 * Feed Layout — Invited Group
 * ---------------------------
 * Thin wrapper that renders FeedLayoutContent for /community/[groupId] routes.
 */

import { useParams, notFound } from "next/navigation";
import { FeedLayoutContent } from "@/app/(app)/community/_components/feed-layout-content";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

interface FeedLayoutProps {
  children: React.ReactNode;
}

const GroupFeedLayout = ({ children }: FeedLayoutProps) => {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId];

  if (!slug) {
    notFound();
  }

  const basePath = `/community/${params.groupId}`;

  return (
    <FeedLayoutContent variant="invited" group={slug} basePath={basePath}>
      {children}
    </FeedLayoutContent>
  );
};

export default GroupFeedLayout;
