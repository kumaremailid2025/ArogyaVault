/**
 * Learn Context Data — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";

export type RecommendedTopic = {
  topicId: string;
  reason: string;
  urgency: "high" | "medium" | "low";
};

export type FeaturedTopic = {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  category: string;
  gradient: string;
};

export type TrendingTopic = {
  id: string;
  title: string;
  readers: number;
  category: string;
};

export type ContinueReading = {
  topicId: string;
  progress: number;
  lastRead: string;
};

interface LearnContextBundle {
  RECOMMENDED_TOPICS: RecommendedTopic[];
  FEATURED_TOPIC: FeaturedTopic | null;
  TRENDING_TOPICS: TrendingTopic[];
  CONTINUE_READING: ContinueReading[];
  LAB_CATEGORIES: readonly string[];
}

export const useLearnContext = (): LearnContextBundle => {
  const { data } = useAppDataContext();
  const src = (data.learnContext || {}) as Record<string, unknown>;
  return {
    RECOMMENDED_TOPICS:
      (src.RECOMMENDED_TOPICS as RecommendedTopic[]) ?? [],
    FEATURED_TOPIC: (src.FEATURED_TOPIC as FeaturedTopic | null) ?? null,
    TRENDING_TOPICS: (src.TRENDING_TOPICS as TrendingTopic[]) ?? [],
    CONTINUE_READING: (src.CONTINUE_READING as ContinueReading[]) ?? [],
    LAB_CATEGORIES: (src.LAB_CATEGORIES as string[]) ?? [],
  };
};
