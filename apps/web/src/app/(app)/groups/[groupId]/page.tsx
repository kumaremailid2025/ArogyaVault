"use client";

import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { ShieldCheckIcon, LayersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PermissionRow,
  useGroups,
} from "../_components/groups-shared";

/* ── Group Settings view (single group) ────────────────────────── */
const GroupSettingsPage = ({ params }: { params: { groupId: string } }) => {
  const groupId = params.groupId;
  const { ALL_GROUPS, DIR, GROUP_PERMISSIONS, GROUP_NAMES } = useGroups();
  const group = ALL_GROUPS.find((g) => g.id === groupId);
  const permissions = GROUP_PERMISSIONS[groupId] ?? [];

  if (!group) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <p className="text-sm text-muted-foreground">Group not found</p>
        </div>
      </div>
    );
  }

  const cfg = DIR[group.direction];
  const memberName = GROUP_NAMES[groupId] ?? "";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Group Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage permissions and access for <strong>{memberName}</strong>
          </p>
        </div>
      </div>

      {/* Member card */}
      <div className="rounded-xl border border-border bg-background p-4 flex items-center gap-4">
        <Avatar className="size-12 shrink-0">
          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
            {group.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{group.name}</span>
            <Badge variant="outline" className="text-xs">
              {group.rel}
            </Badge>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                cfg.bg
              )}
            >
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
            <p className="text-xs text-muted-foreground">
              Current access level for this group
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-xs shrink-0">
            Change
          </Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Revoke Access</p>
            <p className="text-xs text-muted-foreground">
              Remove this person from your vault completely.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
          >
            Revoke
          </Button>
        </div>
      </section>
    </div>
  );
};

export default GroupSettingsPage;
