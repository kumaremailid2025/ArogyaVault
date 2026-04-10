/**
 * Community Data — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { CommunityPost } from "@/models/community";

export interface TrendingTopic {
  topic: string;
  count: number;
  pct: number;
}

export interface TopContributor {
  initials: string;
  name: string;
  helpful: number;
}

export interface RegionActivity {
  region: string;
  count: number;
  pct: number;
}

interface CommunityBundle {
  COMMUNITY_POSTS: CommunityPost[];
  TRENDING_TOPICS: TrendingTopic[];
  TOP_CONTRIBUTORS: TopContributor[];
  REGION_ACTIVITY: RegionActivity[];
  POST_SUMMARIES: Record<number, string>;
  POST_AI_RESPONSES: Record<number, string>;
}

export const useCommunity = (): CommunityBundle => {
  const { data } = useAppDataContext();
  const src = (data.community || {}) as Record<string, unknown>;
  return {
    COMMUNITY_POSTS: (src.COMMUNITY_POSTS as CommunityPost[]) ?? [],
    TRENDING_TOPICS: (src.TRENDING_TOPICS as TrendingTopic[]) ?? [],
    TOP_CONTRIBUTORS: (src.TOP_CONTRIBUTORS as TopContributor[]) ?? [],
    REGION_ACTIVITY: (src.REGION_ACTIVITY as RegionActivity[]) ?? [],
    POST_SUMMARIES:
      (src.POST_SUMMARIES as Record<number, string>) ?? {},
    POST_AI_RESPONSES:
      (src.POST_AI_RESPONSES as Record<number, string>) ?? {},
  };
};
