"use client";

import { useParams } from "next/navigation";
import { FeedPageContainer } from "@/components/containers/community/feed-page-container";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

/** /community/[groupId] — Invited group feed tab. */
const CommunityGroupPage = () => {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId] ?? params.groupId;

  return <FeedPageContainer variant="invited" group={slug} />;
};

export default CommunityGroupPage;
