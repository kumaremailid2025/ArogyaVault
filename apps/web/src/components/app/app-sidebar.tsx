"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  VaultIcon,
  BotIcon,
  MessageCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  PlusCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── System groups (always present, created on first login) ──────── */
const SYSTEM_GROUPS = [
  {
    id: "yours",
    name: "Yours",
    sub: "Your personal vault",
    icon: VaultIcon,
    /* navy / primary tint */
    activeClass:  "bg-primary text-primary-foreground",
    hoverClass:   "hover:bg-primary/10 hover:text-primary",
    dotClass:     "bg-primary",
    subColor:     "text-primary/70",
    activeSub:    "text-primary-foreground/70",
  },
  {
    id: "arogyaai",
    name: "ArogyaAI",
    sub: "AI health assistant",
    icon: BotIcon,
    /* violet tint */
    activeClass:  "bg-violet-600 text-white",
    hoverClass:   "hover:bg-violet-50 hover:text-violet-700",
    dotClass:     "bg-violet-500",
    subColor:     "text-violet-500/80",
    activeSub:    "text-white/70",
  },
  {
    id: "community",
    name: "ArogyaTalk",
    sub: "Community discussions",
    icon: MessageCircleIcon,
    /* emerald tint */
    activeClass:  "bg-emerald-600 text-white",
    hoverClass:   "hover:bg-emerald-50 hover:text-emerald-700",
    dotClass:     "bg-emerald-500",
    subColor:     "text-emerald-600/80",
    activeSub:    "text-white/70",
  },
];

/* ─── Linked / invited users (dynamic in Sprint 1, dummy for now) ─── */
const LINKED_GROUPS = [
  { id: "ravi",   name: "Ravi Kumar",         sub: "App Access",   direction: "out"  as const },
  { id: "sharma", name: "Dr. Sharma's Clinic", sub: "Group Access", direction: "in"   as const },
  { id: "priya",  name: "Priya Singh",          sub: "App Access",   direction: "both" as const },
];

function DirectionIcon({ d }: { d: "out" | "in" | "both" }) {
  if (d === "out")  return <ArrowRightIcon  className="size-2.5 shrink-0 text-primary" />;
  if (d === "in")   return <ArrowLeftIcon   className="size-2.5 shrink-0 text-amber-500" />;
  return               <ArrowLeftRightIcon className="size-2.5 shrink-0 text-emerald-500" />;
}

export function AppSidebar() {
  const searchParams = useSearchParams();
  const activeGroup  = searchParams.get("g") ?? "yours";

  return (
    <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-border bg-background overflow-y-auto">
      <div className="flex flex-col py-3">

        {/* ── System groups ───────────────────────────────────── */}
        {SYSTEM_GROUPS.map((g, idx) => {
          const isActive = activeGroup === g.id;
          return (
            <React.Fragment key={g.id}>
              <Link
                href={`/liveboard?g=${g.id}`}
                className={cn(
                  "mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition-colors",
                  isActive ? g.activeClass : cn("text-foreground", g.hoverClass)
                )}
              >
                {/* Colored dot + icon */}
                <div className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  isActive ? "bg-white/20" : cn("bg-opacity-15", g.dotClass.replace("bg-", "bg-") + "/15")
                )}>
                  <g.icon className={cn("size-3.5", isActive ? "text-inherit" : g.subColor.replace("/80",""))} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none truncate">{g.name}</p>
                  <p className={cn("text-[10px] mt-0.5 truncate", isActive ? g.activeSub : "text-muted-foreground")}>
                    {g.sub}
                  </p>
                </div>
              </Link>
              {/* Separator after each system group */}
              <div className="mx-4 my-0.5 h-px bg-border/60" />
            </React.Fragment>
          );
        })}

        {/* ── Linked / invited users ──────────────────────────── */}
        {LINKED_GROUPS.map((g) => {
          const isActive = activeGroup === g.id;
          return (
            <React.Fragment key={g.id}>
              <Link
                href={`/liveboard?g=${g.id}`}
                className={cn(
                  "mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {/* Initials avatar */}
                <div className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border",
                  isActive ? "bg-foreground text-background border-foreground" : "bg-muted border-border"
                )}>
                  {g.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-none truncate">{g.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <DirectionIcon d={g.direction} />
                    <span className="text-[10px] text-muted-foreground">{g.sub}</span>
                  </div>
                </div>
              </Link>
              <div className="mx-4 my-0.5 h-px bg-border/40" />
            </React.Fragment>
          );
        })}

        {/* ── Invite button ────────────────────────────────────── */}
        <Link
          href="/groups"
          className="mx-2 mt-1 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border border-dashed border-border hover:border-primary/40"
        >
          <PlusCircleIcon className="size-3.5 shrink-0" />
          Invite / Link Person
        </Link>
      </div>
    </aside>
  );
}
