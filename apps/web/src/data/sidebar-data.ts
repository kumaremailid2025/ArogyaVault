/**
 * Sidebar Data — hook-only (data lives in backend store).
 */

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useAppDataContext } from "@/providers/appdata-provider";
import { resolveIcon } from "@/lib/icon-resolver";

export interface CommunityGroupHeader {
  slug: string;
  name: string;
  sub: string;
  icon: LucideIcon;
}

export interface LinkedGroup {
  slug: string;
  name: string;
  rel: string;
  sub: string;
  count: number;
}

export interface InviteGroup {
  id: string;
  name: string;
}

export interface TopNotification {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

interface RawTopNotification {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

interface SidebarBundle {
  COMMUNITY_GROUP: CommunityGroupHeader;
  LINKED_GROUPS: LinkedGroup[];
  INVITE_GROUPS: InviteGroup[];
  TOP_NOTIFICATIONS: TopNotification[];
}

const DEFAULT_COMMUNITY_GROUP: CommunityGroupHeader = {
  slug: "community",
  name: "Community",
  sub: "ArogyaCommunity",
  icon: resolveIcon("MessageCircleIcon"),
};

export const useSidebar = (): SidebarBundle => {
  const { data } = useAppDataContext();
  const src = (data.sidebar || {}) as Record<string, unknown>;

  return React.useMemo(() => {
    const rawHeader = (src.COMMUNITY_GROUP || {}) as {
      slug?: string;
      name?: string;
      sub?: string;
      icon?: string;
    };
    const header: CommunityGroupHeader = rawHeader.slug
      ? {
          slug: rawHeader.slug,
          name: rawHeader.name ?? "",
          sub: rawHeader.sub ?? "",
          icon: resolveIcon(rawHeader.icon),
        }
      : DEFAULT_COMMUNITY_GROUP;

    const rawNotifs = (src.TOP_NOTIFICATIONS as RawTopNotification[]) ?? [];
    const notifs: TopNotification[] = rawNotifs.map((n) => ({
      ...n,
      icon: resolveIcon(n.icon),
    }));

    return {
      COMMUNITY_GROUP: header,
      LINKED_GROUPS: (src.LINKED_GROUPS as LinkedGroup[]) ?? [],
      INVITE_GROUPS: (src.INVITE_GROUPS as InviteGroup[]) ?? [],
      TOP_NOTIFICATIONS: notifs,
    };
  }, [src]);
};
