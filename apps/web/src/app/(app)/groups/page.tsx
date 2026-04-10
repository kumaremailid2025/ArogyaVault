"use client";

import Link from "next/link";
import {
  UsersIcon,
  PlusCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";
import { useGroups } from "./_components/groups-shared";

/* ── All groups list (default view) ─────────────────────────────── */
const AllGroupsView = () => {
  const { ALL_GROUPS, DIR } = useGroups();
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
          <div
            key={key}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-border",
              cfg.bg
            )}
          >
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
            <div
              key={g.id}
              className="rounded-xl border border-border bg-background p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {g.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-semibold">{g.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {g.rel}
                    </Badge>
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        cfg.bg
                      )}
                    >
                      <cfg.icon className={cn("size-3", cfg.color)} />
                      <span className={cfg.color}>{cfg.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {g.members} members · Joined {g.joined}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {g.last}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/groups/${g.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                    >
                      Manage
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-destructive hover:text-destructive"
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <UsersIcon className="size-8 text-muted-foreground/40 mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">
          Add a doctor or family member
        </h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
          Enter their mobile number to send a secure invite. They control
          whether to accept.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1.5 mx-auto"
        >
          <PlusCircleIcon className="size-4" /> Invite Person
        </Button>
      </div>
    </div>
  );
};

export default AllGroupsView;
