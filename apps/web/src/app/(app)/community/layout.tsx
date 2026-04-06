import type { Metadata } from "next";
import { CommunityLayoutClient } from "./_components/community-layout-client";

export const metadata: Metadata = {
  title: "Community | ArogyaVault",
  description: "Community feed, shared files, and member discussions.",
};

const CommunityLayout = ({ children }: { children: React.ReactNode }) => (
  <CommunityLayoutClient>{children}</CommunityLayoutClient>
);

export default CommunityLayout;
