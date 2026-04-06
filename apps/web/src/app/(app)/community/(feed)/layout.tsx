"use client";

/**
 * Feed Layout — Main Community
 * ----------------------------
 * Thin wrapper that renders FeedLayoutContent for the main /community route.
 */

import { FeedLayoutContent } from "@/app/(app)/community/_components/feed-layout-content";

interface FeedLayoutProps {
  children: React.ReactNode;
}

const FeedLayout = ({ children }: FeedLayoutProps) => (
  <FeedLayoutContent variant="community" group="community" basePath="/community">
    {children}
  </FeedLayoutContent>
);

export default FeedLayout;
