"use client";

import { useParams } from "next/navigation";
import { FilesPageContainer } from "@/components/containers/community/files-page-container";
import { GROUP_UUID_MAP } from "@/components/containers/community/types";

/** /community/[groupId]/files — Invited group files tab. */
const CommunityGroupFilesPage = () => {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId] ?? params.groupId;

  return <FilesPageContainer variant="invited" group={slug} />;
};

export default CommunityGroupFilesPage;
