"use client";

/**
 * Invited Group Layout
 * --------------------
 * Layout for /community/[groupId]/* routes.
 * Renders the invited-group banner + tab navigation,
 * then {children} for the active route's page content.
 */

import { useParams, notFound } from "next/navigation";
import { CommunityShell } from "@/components/containers/community/community-shell";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

const GroupLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId];

  if (!slug) {
    notFound();
  }

  return (
    <CommunityShell variant="invited" group={slug}>
      {children}
    </CommunityShell>
  );
};

export default GroupLayout;
