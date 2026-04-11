/**
 * Profile Data — hook-only (data lives in backend store).
 */

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useAppDataContext } from "@/providers/appdata-provider";
import { resolveIcon } from "@/lib/icon-resolver";

export interface AccessLogEntry {
  who: string;
  action: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

interface RawAccessLogEntry {
  who: string;
  action: string;
  time: string;
  icon: string;
  color: string;
}

export interface NotificationPref {
  label: string;
  sub: string;
  on: boolean;
}

interface ProfileBundle {
  ACCESS_LOG: AccessLogEntry[];
  NOTIFICATIONS: NotificationPref[];
}

export const useProfile = (): ProfileBundle => {
  const { data } = useAppDataContext();
  /* Depend on the raw slice reference — NOT on a freshly-constructed
   * `{} ` fallback, which would bust the memo every render. */
  const raw = data.profile;

  return React.useMemo(() => {
    const src = (raw || {}) as Record<string, unknown>;
    const rawAccess = (src.ACCESS_LOG as RawAccessLogEntry[]) ?? [];
    const accessLog: AccessLogEntry[] = rawAccess.map((e) => ({
      ...e,
      icon: resolveIcon(e.icon),
    }));

    return {
      ACCESS_LOG: accessLog,
      NOTIFICATIONS: (src.NOTIFICATIONS as NotificationPref[]) ?? [],
    };
  }, [raw]);
};
