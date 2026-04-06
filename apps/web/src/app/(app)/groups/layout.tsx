import type { Metadata } from "next";
import { GroupsLayoutClient } from "./_components/groups-layout-client";

export const metadata: Metadata = {
  title: "Groups & Sharing | ArogyaVault",
  description: "Manage who has access to your records and what they can see.",
};

const GroupsLayout = ({ children }: { children: React.ReactNode }) => (
  <GroupsLayoutClient>{children}</GroupsLayoutClient>
);

export default GroupsLayout;
