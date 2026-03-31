"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightIcon, ArrowLeftIcon, ArrowLeftRightIcon,
  UsersIcon, PlusCircleIcon, ShieldCheckIcon, LayersIcon,
  EyeIcon, UploadCloudIcon, BellIcon, CheckCircle2Icon,
  XCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Switch } from "@/core/ui/switch";
import dynamic from "next/dynamic";

const ContentTabs = dynamic(
  () => import("@/components/app/content-tabs").then((m) => ({ default: m.ContentTabs })),
  {
    loading: () => (
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
      </div>
    ),
  }
);
import { cn } from "@/lib/utils";

/* ── All linked groups (global view) ────────────────────────────── */
const ALL_GROUPS = [
  { id: "ravi",   name: "Ravi Kumar",          rel: "Family Member", direction: "out"  as const, scope: "App Access",   canUpload: false, members: 2, joined: "15 Jan 2026", last: "Viewed records 3 days ago",            initials: "RK" },
  { id: "sharma", name: "Dr. Sharma's Clinic", rel: "Doctor",        direction: "in"   as const, scope: "Group Access", canUpload: true,  members: 3, joined: "10 Feb 2026", last: "Uploaded discharge summary 2 days ago", initials: "DS" },
  { id: "priya",  name: "Priya Singh",           rel: "Caregiver",     direction: "both" as const, scope: "App Access",   canUpload: false, members: 2, joined: "01 Mar 2026", last: "Joined 28 days ago",                   initials: "PS" },
];

const DIR = {
  out:  { icon: ArrowRightIcon,     label: "You invited",  color: "text-primary",     bg: "bg-primary/10",  desc: "You can see their records" },
  in:   { icon: ArrowLeftIcon,      label: "They invited", color: "text-amber-500",   bg: "bg-amber-50",    desc: "They can see your records" },
  both: { icon: ArrowLeftRightIcon, label: "Mutual",       color: "text-emerald-500", bg: "bg-emerald-50",  desc: "Both directions active"    },
};

/* ── Per-group permission detail (shown when ?g= set) ────────────── */
type Permission = { icon: React.ElementType; label: string; desc: string; enabled: boolean };
const GROUP_PERMISSIONS: Record<string, Permission[]> = {
  ravi: [
    { icon: EyeIcon,          label: "View all records",          desc: "Ravi can see all your uploaded medical documents",         enabled: false },
    { icon: FileIconPlaceholder, label: "View selected categories",  desc: "Ravi can see prescriptions and lab reports only",         enabled: true  },
    { icon: UploadCloudIcon,  label: "Upload documents",           desc: "Ravi can upload documents on your behalf (requires approval)", enabled: false },
    { icon: BellIcon,         label: "Activity notifications",     desc: "You get notified when Ravi views or uploads anything",     enabled: true  },
  ],
  sharma: [
    { icon: EyeIcon,          label: "View shared group",          desc: "Dr. Sharma can see documents you share to this group",     enabled: true  },
    { icon: UploadCloudIcon,  label: "Upload on your behalf",      desc: "Clinic can upload documents; you approve before they're saved", enabled: true  },
    { icon: BellIcon,         label: "Upload notifications",       desc: "You get notified when the clinic uploads anything",        enabled: true  },
    { icon: ShieldCheckIcon,  label: "Audit trail",                desc: "Every access by the clinic is logged in your activity",   enabled: true  },
  ],
  priya: [
    { icon: EyeIcon,          label: "Mutual record access",       desc: "Both you and Priya can view each other's shared records", enabled: true  },
    { icon: UploadCloudIcon,  label: "Priya can upload",           desc: "Priya can upload documents; you approve before they're saved", enabled: false },
    { icon: BellIcon,         label: "Activity notifications",     desc: "You get notified when Priya views or uploads anything",   enabled: true  },
    { icon: ShieldCheckIcon,  label: "Emergency access",           desc: "Priya can request a one-time emergency view of all records", enabled: false },
  ],
};

// Placeholder icon since we can't dynamically require it
function FileIconPlaceholder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

const GROUP_NAMES: Record<string, string> = {
  ravi:   "Ravi Kumar",
  sharma: "Dr. Sharma's Clinic",
  priya:  "Priya Singh",
};

/* ── Permission row ─────────────────────────────────────────────── */
function PermissionRow({ perm }: { perm: PermissionType }) {
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
}

type PermissionType = { icon: React.ElementType; label: string; desc: string; enabled: boolean };

/* ── Group Settings view (single group) ────────────────────────── */
function GroupSettingsView({ groupId }: { groupId: string }) {
  const group = ALL_GROUPS.find(g => g.id === groupId);
  const permissions = GROUP_PERMISSIONS[groupId] ?? [];
  if (!group) return null;
  const cfg = DIR[group.direction];

  return (
    <div className="space-y-5">
      {/* Member card */}
      <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-4">
        <Avatar className="size-12 shrink-0">
          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">{group.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{group.name}</span>
            <Badge variant="outline" className="text-xs">{group.rel}</Badge>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", cfg.bg)}>
              <cfg.icon className={cn("size-3", cfg.color)} />
              <span className={cfg.color}>{cfg.label}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{group.last}</p>
        </div>
      </div>

      {/* Permission toggles */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <ShieldCheckIcon className="size-4 text-primary" />
          Access Permissions
        </h2>
        <div className="rounded-xl border border-border bg-background divide-y divide-border">
          {permissions.map((perm, i) => (
            <PermissionRow key={i} perm={perm} />
          ))}
        </div>
      </section>

      {/* Access scope */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <LayersIcon className="size-4 text-primary" />
          Access Scope
        </h2>
        <div className="rounded-xl border border-border bg-background p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{group.scope}</p>
            <p className="text-xs text-muted-foreground">Current access level for this group</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs shrink-0">Change</Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Revoke Access</p>
            <p className="text-xs text-muted-foreground">Remove this person from your vault completely.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0">
            Revoke
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ── All groups list (default view) ─────────────────────────────── */
function AllGroupsView() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Groups & Sharing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage who has access to your records and what they can see.
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5">
          <PlusCircleIcon className="size-4" /> Invite Person
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(DIR).map(([key, cfg]) => (
          <div key={key} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-border", cfg.bg)}>
            <cfg.icon className={cn("size-3.5", cfg.color)} />
            <span className={cfg.color}>{cfg.label}</span>
            <span className="text-muted-foreground">— {cfg.desc}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {ALL_GROUPS.map((g) => {
          const cfg = DIR[g.direction];
          return (
            <div key={g.id} className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-4">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">{g.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-semibold">{g.name}</span>
                    <Badge variant="outline" className="text-xs">{g.rel}</Badge>
                    <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", cfg.bg)}>
                      <cfg.icon className={cn("size-3", cfg.color)} />
                      <span className={cfg.color}>{cfg.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{g.members} members · Joined {g.joined}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.last}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-7">Manage</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive">Revoke</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <UsersIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">Add a doctor or family member</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
          Enter their mobile number to send a secure invite. They control whether to accept.
        </p>
        <Button size="sm" variant="outline" className="flex items-center gap-1.5 mx-auto">
          <PlusCircleIcon className="size-4" /> Invite Person
        </Button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function GroupsPage() {
  const searchParams = useSearchParams();
  const g = searchParams.get("g") ?? "";
  const isLinked = g === "ravi" || g === "sharma" || g === "priya";
  const memberName = GROUP_NAMES[g] ?? "";

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Sticky ContentTabs — only for linked groups */}
      {isLinked && (
        <div className="shrink-0 px-5 pt-5 lg:px-7 lg:pt-7">
          <ContentTabs active="groups" />
        </div>
      )}

      {/* Full-width scroll container — scrollbar at right edge of column */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(
          "px-5 pb-5 lg:px-7 lg:pb-7 space-y-5 max-w-4xl",
          isLinked ? "pt-4" : "pt-5 lg:pt-7"
        )}>

          {isLinked && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Group Settings</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage permissions and access for <strong>{memberName}</strong>
                </p>
              </div>
            </div>
          )}

          {isLinked ? <GroupSettingsView groupId={g} /> : <AllGroupsView />}
        </div>
      </div>
    </div>
  );
}
