"use client";

/**
 * Members Layout — Main Community
 * --------------------------------
 * Thin wrapper that renders MembersLayoutContent for the main /community/members route.
 */

import { MembersLayoutContent } from "@/app/(app)/community/_components/members-layout-content";

interface MembersLayoutProps {
  children: React.ReactNode;
}

export default function MembersLayout({ children }: MembersLayoutProps) {
  return (
    <MembersLayoutContent variant="community" group="community" basePath="/community">
      {children}
    </MembersLayoutContent>
  );
}
