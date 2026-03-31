"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  VaultIcon,
  BotIcon,
  MessageCircleIcon,
  GraduationCapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── System groups ──────────────────────────────────────────────── */
const SYSTEM_GROUPS = [
  {
    id: "yours",
    name: "My Vault",
    sub: "Your personal vault",
    icon: VaultIcon,
  },
  {
    id: "arogyaai",
    name: "ArogyaAI",
    sub: "AI health assistant",
    icon: BotIcon,
  },
  {
    id: "community",
    name: "ArogyaTalk",
    sub: "Community discussions",
    icon: MessageCircleIcon,
  },
  {
    id: "learn",
    name: "ArogyaLearn",
    sub: "Evidence-based knowledge",
    icon: GraduationCapIcon,
  },
];

/* ─── Linked / invited users ─────────────────────────────────────── */
const LINKED_GROUPS = [
  { id: "ravi",   name: "Ravi Kumar",          rel: "Family Member", sub: "App Access",   count: 2 },
  { id: "sharma", name: "Dr. Sharma's Clinic",  rel: "Doctor",        sub: "Group Access", count: 3 },
  { id: "priya",  name: "Priya Singh",           rel: "Caregiver",     sub: "App Access",   count: 2 },
];

/* Shared active / hover tokens — same for all groups */
const ACTIVE  = "bg-primary text-primary-foreground";
const HOVER   = "text-foreground hover:bg-primary/10 hover:text-primary";
const DOT_ON  = "bg-white/20";
const DOT_OFF = "bg-primary/15";
const SUB_ON  = "text-primary-foreground/70";
const SUB_OFF = "text-muted-foreground";

export function AppSidebar() {
  const searchParams = useSearchParams();
  const activeGroup  = searchParams.get("g") ?? "yours";

  return (
    <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-border bg-background overflow-y-auto">
      <div className="flex flex-col py-3">

        {/* ── System groups ─────────────────────────────────── */}
        {SYSTEM_GROUPS.map((g) => {
          const isActive = activeGroup === g.id;
          return (
            <React.Fragment key={g.id}>
              <Link
                href={"/liveboard?g=" + g.id}
                className={cn(
                  "mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-3 transition-colors",
                  isActive ? ACTIVE : HOVER
                )}
              >
                <div className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  isActive ? DOT_ON : DOT_OFF
                )}>
                  <g.icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug truncate">{g.name}</p>
                  <p className={cn("text-[10px] truncate", isActive ? SUB_ON : SUB_OFF)}>
                    {g.sub}
                  </p>
                </div>
              </Link>
              <div className="mx-4 my-1 h-px bg-border/60" />
            </React.Fragment>
          );
        })}

        {/* ── Linked / invited users ────────────────────────── */}
        {LINKED_GROUPS.map((g) => {
          const isActive = activeGroup === g.id;
          const initials = g.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
          return (
            <React.Fragment key={g.id}>
              <Link
                href={"/liveboard?g=" + g.id}
                className={cn(
                  "mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-3 transition-colors",
                  isActive ? ACTIVE : HOVER
                )}
              >
                {/* Initials bubble — same size/shape as system group icon */}
                <div className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                  isActive ? DOT_ON : DOT_OFF
                )}>
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-semibold leading-snug truncate">{g.name}</p>
                    <span className={cn("text-[10px] font-medium shrink-0", isActive ? SUB_ON : SUB_OFF)}>
                      +{g.count}
                    </span>
                  </div>
                  <p className={cn("text-[10px] truncate", isActive ? SUB_ON : SUB_OFF)}>
                    {g.rel} · {g.sub}
                  </p>
                </div>
              </Link>
              <div className="mx-4 my-1 h-px bg-border/40" />
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
}
