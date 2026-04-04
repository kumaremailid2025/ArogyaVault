"use client";

import { useParams, notFound } from "next/navigation";
import { CommunityWrapperContainer } from "@/components/containers/community/community-wrapper-container";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

/**
 * /community/[groupId]/members — Invited group members view.
 */
const CommunityGroupMembersPage = () => {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId];

  if (!slug) {
    notFound();
  }

  return <CommunityWrapperContainer variant="invited" group={slug} tab="members" />;
};

export default CommunityGroupMembersPage;
