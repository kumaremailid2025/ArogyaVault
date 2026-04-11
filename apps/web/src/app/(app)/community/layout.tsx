/**
 * Community Layout
 * ────────────────
 * Root layout for /community and /community/* routes.
 * Wraps child routes with CommunityLayoutClient which conditionally applies the shell.
 */

import type { Metadata } from "next";
import { CommunityLayoutClient } from "./_components/community-layout-client";

export const metadata: Metadata = {
  title: "Community | ArogyaVault",
  description: "Community feed, shared files, and member discussions.",
};

/**
 * Render the community layout wrapper.
 * @param children Child routes.
 * @returns React element.
 */
const CommunityLayout = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <CommunityLayoutClient>{children}</CommunityLayoutClient>
);

export default CommunityLayout;
