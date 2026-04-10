/**
 * Records Data — hook-only (data lives in backend store).
 */

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useAppDataContext } from "@/providers/appdata-provider";
import { resolveIcon } from "@/lib/icon-resolver";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

export interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface RawCategory {
  key: string;
  label: string;
  icon: string;
}

export interface Doc {
  id: string;
  type: string;
  title: string;
  date: string;
  doctor: string;
  summary: string;
  flag: boolean;
}

interface RecordsBundle {
  CATEGORIES: Category[];
  CATEGORY_COLOR: Record<string, string>;
  MY_DOCS: Doc[];
  GROUP_DOCS: Record<string, Doc[]>;
  GROUP_NAMES: Record<string, string>;
}

/* ═══════════════════════════════════════════════════════════════════
   HOOK
═══════════════════════════════════════════════════════════════════ */

export const useRecords = (): RecordsBundle => {
  const { data } = useAppDataContext();
  const src = (data.records || {}) as Record<string, unknown>;

  return React.useMemo(() => {
    const rawCategories = (src.CATEGORIES as RawCategory[]) ?? [];
    const categories: Category[] = rawCategories.map((c) => ({
      ...c,
      icon: resolveIcon(c.icon),
    }));

    return {
      CATEGORIES: categories,
      CATEGORY_COLOR: (src.CATEGORY_COLOR as Record<string, string>) ?? {},
      MY_DOCS: (src.MY_DOCS as Doc[]) ?? [],
      GROUP_DOCS: (src.GROUP_DOCS as Record<string, Doc[]>) ?? {},
      GROUP_NAMES: (src.GROUP_NAMES as Record<string, string>) ?? {},
    };
  }, [src]);
};
