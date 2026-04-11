"use client";

/**
 * CommunityLayoutClient
 * ─────────────────────
 * Wraps community content with the appropriate shell.
 * - Top-level `/community/*` routes use the main community shell.
 * - Group-scoped `/community/[groupId]/*` routes skip the shell (it's in their own layout).
 */

import { useParams } from "next/navigation";
import { CommunityShell } from "@/components/containers/community/community-shell";

/**
 * Props for {@link CommunityLayoutClient}.
 */
interface CommunityLayoutClientProps {
  /** Child routes to render. */
  children: React.ReactNode;
}

/**
 * Conditionally render the community shell based on route params.
 * Group-scoped routes have their own layout with the invited banner.
 * @param children Child routes.
 * @returns React element.
 */
export const CommunityLayoutClient = ({
  children,
}: CommunityLayoutClientProps): React.ReactElement => {
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
