"use client";

/**
 * Groups page shared types + small UI helpers.
 *
 * All mock data (ALL_GROUPS, DIR, GROUP_PERMISSIONS, GROUP_NAMES) now lives in
 * the backend bundle — consume it via `useGroups()` from `@/data/groups-data`.
 */

import * as React from "react";
import { Switch } from "@/core/ui/switch";
import type { Permission } from "@/data/groups-data";

export type { Group, GroupDirection, DirectionConfig, Permission } from "@/data/groups-data";
export { useGroups } from "@/data/groups-data";

/* ── File icon placeholder (inline SVG) ─────────────────────────── */
export const FileIconPlaceholder = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
};

/* ── Permission row ─────────────────────────────────────────────── */
export const PermissionRow = ({ perm }: { perm: Permission }) => {
  const [enabled, setEnabled] = React.useState(perm.enabled);
  return (
    <div className="flex items-center justify-between px-4 py-3.5 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <perm.icon className="size-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{perm.label}</p>
          <p className="text-xs text-muted-foreground leading-snug">{perm.desc}</p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label={perm.label}
      />
    </div>
  );
};
