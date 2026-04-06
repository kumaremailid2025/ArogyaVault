"use client";

/**
 * Members Layout — Invited Group
 * ------------------------------
 * Thin wrapper that renders MembersLayoutContent for /community/[groupId]/members routes.
 */

import { useParams, notFound } from "next/navigation";
import { MembersLayoutContent } from "@/app/(app)/community/_components/members-layout-content";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

interface MembersLayoutProps {
  children: React.ReactNode;
}

export default function GroupMembersLayout({ children }: MembersLayoutProps) {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId];

  if (!slug) {
    notFound();
  }

  const basePath = `/community/${params.groupId}`;

  return (
    <MembersLayoutContent variant="invited" group={slug} basePath={basePath}>
      {children}
    </MembersLayoutContent>
  );
}
