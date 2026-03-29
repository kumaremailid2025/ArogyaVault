import type { Metadata } from "next";
import {
  ArrowRightIcon, ArrowLeftIcon, ArrowLeftRightIcon,
  UsersIcon, PlusCircleIcon, ShieldCheckIcon,
  LayersIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";
import { ContentTabs } from "@/components/app/content-tabs";

export const metadata: Metadata = { title: "Groups | ArogyaVault" };

/* ── Dummy data ──────────────────────────────────────────────────── */
const GROUPS = [
  {
    id: "g1",
    name: "Ravi Kumar",
    relationship: "Family Member",
    direction: "out" as const,
    scope: "App Access",
    canUpload: false,
    memberCount: 2,
    joinedAt: "15 Jan 2026",
    initials: "RK",
    lastActivity: "Viewed records 3 days ago",
  },
  {
    id: "g2",
    name: "Dr. Sharma's Clinic",
    relationship: "Doctor",
    direction: "in" as const,
    scope: "Group Access",
    canUpload: true,
    memberCount: 3,
    joinedAt: "10 Feb 2026",
    initials: "DS",
    lastActivity: "Uploaded discharge summary 2 days ago",
  },
  {
    id: "g3",
    name: "Priya Singh",
    relationship: "Caregiver",
    direction: "both" as const,
    scope: "App Access",
    canUpload: false,
    memberCount: 2,
    joinedAt: "01 Mar 2026",
    initials: "PS",
    lastActivity: "Joined 28 days ago",
  },
];

const DIRECTION_CONFIG = {
  out:  { icon: ArrowRightIcon,      label: "You invited",   color: "text-primary",      bg: "bg-primary/10",      desc: "You can see their records" },
  in:   { icon: ArrowLeftIcon,       label: "They invited",  color: "text-amber-500",    bg: "bg-amber-50",        desc: "They can see your records" },
  both: { icon: ArrowLeftRightIcon,  label: "Mutual",        color: "text-emerald-500",  bg: "bg-emerald-50",      desc: "Both directions active" },
};

export default function GroupsPage() {
  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-4xl">

      {/* Content tabs */}
      <ContentTabs active="groups" />

      {/* Header */}
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

      {/* Direction legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(DIRECTION_CONFIG).map(([key, cfg]) => (
          <div key={key} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-border", cfg.bg)}>
            <cfg.icon className={cn("size-3.5", cfg.color)} />
            <span className={cfg.color}>{cfg.label}</span>
            <span className="text-muted-foreground">— {cfg.desc}</span>
          </div>
        ))}
      </div>

      {/* Group cards */}
      <div className="space-y-3">
        {GROUPS.map((g) => {
          const cfg = DIRECTION_CONFIG[g.direction];
          return (
            <div key={g.id} className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {g.initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-semibold">{g.name}</span>
                    <Badge variant="outline" className="text-xs">{g.relationship}</Badge>
                    <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", cfg.bg)}>
                      <cfg.icon className={cn("size-3", cfg.color)} />
                      <span className={cfg.color}>{cfg.label}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium",
                      g.scope === "App Access"
                        ? "bg-primary/10 text-primary"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {g.scope === "App Access"
                        ? <><LayersIcon className="size-3" /> App Access</>
                        : <><ShieldCheckIcon className="size-3" /> Group Access</>
                      }
                    </span>

                    {g.canUpload && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        Can upload (approval required)
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {g.memberCount} members · Joined {g.joinedAt}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1.5">{g.lastActivity}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-7">Manage</Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive">Revoke</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite CTA */}
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
