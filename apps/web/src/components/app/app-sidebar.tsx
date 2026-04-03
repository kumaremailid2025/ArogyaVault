"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { MessageCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUP_SLUG_TO_UUID } from "@/app/(app)/community/page";

/* ─── ArogyaCommunity section header ────────────────────────────── */
const COMMUNITY_GROUP = {
  slug: "community",
  name: "Community",
  sub: "ArogyaCommunity",
  icon: MessageCircleIcon,
};

/* ─── Linked / conversation groups (nested under Community) ─────── */
const LINKED_GROUPS = [
  { slug: "ravi",   name: "Ravi Kumar",          rel: "Family Member", sub: "App Access",   count: 2 },
  { slug: "sharma", name: "Dr. Sharma's Clinic",  rel: "Doctor",        sub: "Group Access", count: 3 },
  { slug: "priya",  name: "Priya Singh",           rel: "Caregiver",     sub: "App Access",   count: 2 },
];

/* Shared active / hover tokens */
const ACTIVE  = "bg-primary text-primary-foreground";
const HOVER   = "text-foreground hover:bg-primary/10 hover:text-primary";
const DOT_ON  = "bg-white/20";
const DOT_OFF = "bg-primary/15";
const SUB_ON  = "text-primary-foreground/70";
const SUB_OFF = "text-muted-foreground";

/** Build the community route for a given slug */
function communityHref(slug: string): string {
  const uuid = GROUP_SLUG_TO_UUID[slug];
  return uuid ? `/community/${uuid}` : "/community";
}

export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams<{ groupId?: string }>();

  /* Show sidebar only when on /community or /community/[groupId] */
  const isCommunityRoute = pathname === "/community" || pathname.startsWith("/community/");
  if (!isCommunityRoute) return null;

  /* Determine which group is active based on the URL */
  const activeGroupId = params.groupId ?? "";
  const isDefaultCommunity = pathname === "/community";

  return (
    <aside className="hidden lg:flex w-52 shrink-0 flex-col border-r border-border bg-background overflow-y-auto">
      <div className="flex flex-col py-3">

        {/* ── Community section header ──────────────────────── */}
        <Link
          href="/community"
          className={cn(
            "mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-3 transition-colors cursor-pointer",
            isDefaultCommunity ? ACTIVE : HOVER
          )}
        >
          <div className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            isDefaultCommunity ? DOT_ON : DOT_OFF
          )}>
            <COMMUNITY_GROUP.icon className="size-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug truncate">{COMMUNITY_GROUP.name}</p>
            <p className={cn("text-[10px] truncate", isDefaultCommunity ? SUB_ON : SUB_OFF)}>
              {COMMUNITY_GROUP.sub}
            </p>
          </div>
        </Link>

        {/* ── Nested conversation groups ────────────────────── */}
        <div className="ml-4 mr-2 border-l-2 border-primary/15 pl-1 flex flex-col gap-0 mb-1">
          {LINKED_GROUPS.map((g) => {
            const uuid = GROUP_SLUG_TO_UUID[g.slug] ?? "";
            const isActive = activeGroupId === uuid;
            const initials = g.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
            return (
              <Link
                key={g.slug}
                href={communityHref(g.slug)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors cursor-pointer",
                  isActive ? ACTIVE : HOVER
                )}
              >
                <div className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-[9px] font-bold",
                  isActive ? DOT_ON : DOT_OFF
                )}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug truncate">{g.name}</p>
                    <span className={cn("text-[9px] font-medium shrink-0", isActive ? SUB_ON : SUB_OFF)}>
                      +{g.count}
                    </span>
                  </div>
                  <p className={cn("text-[9px] truncate", isActive ? SUB_ON : SUB_OFF)}>
                    {g.rel} · {g.sub}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </aside>
  );
}
