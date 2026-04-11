/**
 * Groups Data — hook-only (data lives in backend store).
 *
 * Rehydrates icon name strings into lucide components via resolveIcon.
 */

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useAppDataContext } from "@/providers/appdata-provider";
import { resolveIcon } from "@/lib/icon-resolver";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

export type GroupDirection = "out" | "in" | "both";

export interface Group {
  id: string;
  name: string;
  rel: string;
  direction: GroupDirection;
  scope: string;
  canUpload: boolean;
  members: number;
  joined: string;
  last: string;
  initials: string;
}

export interface DirectionConfig {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  desc: string;
}

export interface Permission {
  icon: LucideIcon;
  label: string;
  desc: string;
  enabled: boolean;
}

interface RawDirectionConfig {
  icon: string;
  label: string;
  color: string;
  bg: string;
  desc: string;
}

interface RawPermission {
  icon: string;
  label: string;
  desc: string;
  enabled: boolean;
}

interface GroupsBundle {
  ALL_GROUPS: Group[];
  DIR: Record<GroupDirection, DirectionConfig>;
  GROUP_PERMISSIONS: Record<string, Permission[]>;
  GROUP_NAMES: Record<string, string>;
}

const EMPTY_DIR: Record<GroupDirection, DirectionConfig> = {
  out: { icon: resolveIcon("ArrowRightIcon"), label: "", color: "", bg: "", desc: "" },
  in: { icon: resolveIcon("ArrowLeftIcon"), label: "", color: "", bg: "", desc: "" },
  both: { icon: resolveIcon("ArrowLeftRightIcon"), label: "", color: "", bg: "", desc: "" },
};

/* ═══════════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════════ */

export const useGroups = (): GroupsBundle => {
  const { data } = useAppDataContext();
  /* Depend on the raw slice reference — NOT on a freshly-constructed
   * `{} ` fallback, which would bust the memo every render. */
  const raw = data.groups;

  return React.useMemo(() => {
    const src = (raw || {}) as Record<string, unknown>;
    const rawDir = (src.DIR || {}) as Record<string, RawDirectionConfig>;
    const dir: Record<GroupDirection, DirectionConfig> = { ...EMPTY_DIR };
    (["out", "in", "both"] as const).forEach((k) => {
      const v = rawDir[k];
      if (v) dir[k] = { ...v, icon: resolveIcon(v.icon) };
    });

    const rawPerms = (src.GROUP_PERMISSIONS || {}) as Record<string, RawPermission[]>;
    const perms: Record<string, Permission[]> = {};
    Object.entries(rawPerms).forEach(([k, list]) => {
      perms[k] = (list || []).map((p) => ({ ...p, icon: resolveIcon(p.icon) }));
    });

    return {
      ALL_GROUPS: (src.ALL_GROUPS as Group[]) ?? [],
      DIR: dir,
      GROUP_PERMISSIONS: perms,
      GROUP_NAMES: (src.GROUP_NAMES as Record<string, string>) ?? {},
    };
  }, [raw]);
};
