/**
 * Dashboard Data — hook-only (data lives in backend store).
 * Icon fields are strings and must be resolved via `resolveIcon`.
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { QuickStat, ActivityFeedItem, AiMessage, AiFeature } from "@/models/user";

/**
 * Raw data exposed in the bootstrap bundle still uses icon NAMES (strings)
 * because JSON cannot carry React components. Components that render these
 * items should pipe the `icon` field through `resolveIcon()` from `@/lib/icon-resolver`.
 */
type RawQuickStat = Omit<QuickStat, "icon"> & { icon: string };
type RawActivityFeedItem = Omit<ActivityFeedItem, "icon"> & { icon: string };
type RawAiFeature = Omit<AiFeature, "icon"> & { icon: string };

interface DashboardBundle {
  QUICK_STATS: RawQuickStat[];
  ACTIVITY_FEED: RawActivityFeedItem[];
  AI_MESSAGES: AiMessage[];
  AI_FEATURES: RawAiFeature[];
  AI_SUGGESTIONS: string[];
}

export const useDashboard = (): DashboardBundle => {
  const { data } = useAppDataContext();
  const src = (data.dashboard || {}) as Record<string, unknown>;
  return {
    QUICK_STATS: (src.QUICK_STATS as RawQuickStat[]) ?? [],
    ACTIVITY_FEED: (src.ACTIVITY_FEED as RawActivityFeedItem[]) ?? [],
    AI_MESSAGES: (src.AI_MESSAGES as AiMessage[]) ?? [],
    AI_FEATURES: (src.AI_FEATURES as RawAiFeature[]) ?? [],
    AI_SUGGESTIONS: (src.AI_SUGGESTIONS as string[]) ?? [],
  };
};
