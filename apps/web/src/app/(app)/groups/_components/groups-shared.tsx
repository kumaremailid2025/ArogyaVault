"use client";

import * as React from "react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  EyeIcon,
  UploadCloudIcon,
  BellIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Switch } from "@/core/ui/switch";
import { cn } from "@/lib/utils";

/* ── All linked groups (global view) ────────────────────────────── */
export const ALL_GROUPS = [
  {
    id: "ravi",
    name: "Ravi Kumar",
    rel: "Family Member",
    direction: "out" as const,
    scope: "App Access",
    canUpload: false,
    members: 2,
    joined: "15 Jan 2026",
    last: "Viewed records 3 days ago",
    initials: "RK",
  },
  {
    id: "sharma",
    name: "Dr. Sharma's Clinic",
    rel: "Doctor",
    direction: "in" as const,
    scope: "Group Access",
    canUpload: true,
    members: 3,
    joined: "10 Feb 2026",
    last: "Uploaded discharge summary 2 days ago",
    initials: "DS",
  },
  {
    id: "priya",
    name: "Priya Singh",
    rel: "Caregiver",
    direction: "both" as const,
    scope: "App Access",
    canUpload: false,
    members: 2,
    joined: "01 Mar 2026",
    last: "Joined 28 days ago",
    initials: "PS",
  },
];

export const DIR = {
  out: {
    icon: ArrowRightIcon,
    label: "You invited",
    color: "text-primary",
    bg: "bg-primary/10",
    desc: "You can see their records",
  },
  in: {
    icon: ArrowLeftIcon,
    label: "They invited",
    color: "text-amber-500",
    bg: "bg-amber-50",
    desc: "They can see your records",
  },
  both: {
    icon: ArrowLeftRightIcon,
    label: "Mutual",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    desc: "Both directions active",
  },
};

/* ── Per-group permission detail (shown when viewing group settings) ────────────── */
export type Permission = {
  icon: React.ElementType;
  label: string;
  desc: string;
  enabled: boolean;
};

export const GROUP_PERMISSIONS: Record<string, Permission[]> = {
  ravi: [
    {
      icon: EyeIcon,
      label: "View all records",
      desc: "Ravi can see all your uploaded medical documents",
      enabled: false,
    },
    {
      icon: FileIconPlaceholder,
      label: "View selected categories",
      desc: "Ravi can see prescriptions and lab reports only",
      enabled: true,
    },
    {
      icon: UploadCloudIcon,
      label: "Upload documents",
      desc: "Ravi can upload documents on your behalf (requires approval)",
      enabled: false,
    },
    {
      icon: BellIcon,
      label: "Activity notifications",
      desc: "You get notified when Ravi views or uploads anything",
      enabled: true,
    },
  ],
  sharma: [
    {
      icon: EyeIcon,
      label: "View shared group",
      desc: "Dr. Sharma can see documents you share to this group",
      enabled: true,
    },
    {
      icon: UploadCloudIcon,
      label: "Upload on your behalf",
      desc: "Clinic can upload documents; you approve before they're saved",
      enabled: true,
    },
    {
      icon: BellIcon,
      label: "Upload notifications",
      desc: "You get notified when the clinic uploads anything",
      enabled: true,
    },
    {
      icon: ShieldCheckIcon,
      label: "Audit trail",
      desc: "Every access by the clinic is logged in your activity",
      enabled: true,
    },
  ],
  priya: [
    {
      icon: EyeIcon,
      label: "Mutual record access",
      desc: "Both you and Priya can view each other's shared records",
      enabled: true,
    },
    {
      icon: UploadCloudIcon,
      label: "Priya can upload",
      desc: "Priya can upload documents; you approve before they're saved",
      enabled: false,
    },
    {
      icon: BellIcon,
      label: "Activity notifications",
      desc: "You get notified when Priya views or uploads anything",
      enabled: true,
    },
    {
      icon: ShieldCheckIcon,
      label: "Emergency access",
      desc: "Priya can request a one-time emergency view of all records",
      enabled: false,
    },
  ],
};

export const GROUP_NAMES: Record<string, string> = {
  ravi: "Ravi Kumar",
  sharma: "Dr. Sharma's Clinic",
  priya: "Priya Singh",
};

/* ── File icon placeholder ────────────────────────────────────────── */
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
      {/* Toggle */}
      <Switch
        checked={enabled}
        onCheckedChange={setEnabled}
        aria-label={perm.label}
      />
    </div>
  );
};
