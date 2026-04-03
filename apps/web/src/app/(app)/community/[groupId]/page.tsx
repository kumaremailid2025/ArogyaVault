"use client";

import { useParams, notFound } from "next/navigation";
import { CommunityPageContent, GROUP_UUID_MAP } from "../page";

/**
 * /community/[groupId] — Dynamic community group page.
 * Reads a UUID from the URL, maps it to a group slug, and renders
 * the shared CommunityPageContent.
 */
export default function CommunityGroupPage() {
  const params = useParams<{ groupId: string }>();
  const slug = GROUP_UUID_MAP[params.groupId];

  if (!slug) {
    notFound();
  }

  return <CommunityPageContent group={slug} />;
}
