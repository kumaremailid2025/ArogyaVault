"use client";

import { useParams } from "next/navigation";
import { CommunityShell } from "@/components/containers/community/community-shell";

export const CommunityLayoutClient = ({ children }: { children: React.ReactNode }) => {
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
