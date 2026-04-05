"use client";

/**
 * Community Layout
 * ----------------
 * Shared layout for /community, /community/files, /community/members.
 * Renders the community banner + tab navigation, then {children} for
 * the active route's page content.
 *
 * For /community/[groupId]/* routes, this layout passes through to
 * the [groupId]/layout.tsx which provides the invited-group banner.
 */

import { useParams } from "next/navigation";
import { CommunityShell } from "@/components/containers/community/community-shell";

const CommunityLayout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();

  // [groupId] routes have their own layout with the invited banner
  if (params.groupId) {
    return <>{children}</>;
  }

  return (
    <CommunityShell variant="community" group="community">
      {children}
    </CommunityShell>
  );
};

export default CommunityLayout;
