"use client";

import { useParams } from "next/navigation";
import { MembersPageContainer } from "@/components/containers/community/members-page-container";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

/** /community/[groupId]/members — Invited group members tab. */
const CommunityGroupMembersPage = () => {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId] ?? params.groupId;

  return <MembersPageContainer variant="invited" group={slug} />;
};

export default CommunityGroupMembersPage;
