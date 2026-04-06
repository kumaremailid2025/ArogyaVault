"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { MessageCircleIcon, TagIcon, ThumbsUpIcon, MessageSquareIcon, StarIcon, ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";
import { useTagsStore, tagToSlug, useLikesStore, useRepliedStore, useFavoritesStore, useActivityStore } from "@/stores";
import { COMMUNITY_POSTS } from "@/data/community-data";
import { LINKED_MEMBER_DATA } from "@/data/linked-member-data";

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
const communityHref = (slug: string): string => {
  const uuid = GROUP_SLUG_TO_UUID[slug];
  return uuid ? `/community/${uuid}` : "/community";
};

/* ═══════════════════════════════════════════════════════════════════
   Community Sidebar
   ═══════════════════════════════════════════════════════════════════ */

const CommunitySidebar = () => {
  const pathname = usePathname();
  const params = useParams<{ groupId?: string }>();

  const activeGroupId = params.groupId ?? "";
  const isDefaultCommunity = !activeGroupId;

  return (
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
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Tags Sidebar
   ═══════════════════════════════════════════════════════════════════ */

const TagsSidebar = () => {
  const pathname = usePathname();
  const params = useParams<{ tag?: string }>();
  const activeSlug = params.tag ?? "";

  const { getSortedTags, postsByTag, registerPosts } = useTagsStore();

  /* Seed store from static data so sidebar always has items */
  React.useEffect(() => {
    const allPosts = [
      ...COMMUNITY_POSTS,
      ...Object.values(LINKED_MEMBER_DATA).flatMap((m) => m.posts),
    ];
    registerPosts(allPosts);
  }, [registerPosts]);

  const sortedTags = getSortedTags();

  return (
    <div className="flex flex-col py-3">
      {/* ── Topics header ──────────────────────────────────── */}
      <div className="mx-2 flex items-center gap-2.5 px-2.5 py-2 mb-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <TagIcon className="size-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">Topics</p>
          <p className="text-[10px] text-muted-foreground">{sortedTags.length} tags</p>
        </div>
      </div>

      {/* ── Tag list ───────────────────────────────────────── */}
      <div className="mx-2 flex flex-col gap-0.5">
        {sortedTags.map((tag) => {
          const slug = tagToSlug(tag);
          const isActive = slug === activeSlug;
          const count = postsByTag.get(tag)?.length ?? 0;
          return (
            <Link
              key={tag}
              href={`/tags/${slug}`}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-colors cursor-pointer",
                isActive ? ACTIVE : HOVER
              )}
            >
              <span className={cn("text-xs font-medium truncate", isActive ? "" : "")}>
                {tag}
              </span>
              <span className={cn(
                "text-[10px] font-medium shrink-0 tabular-nums",
                isActive ? SUB_ON : SUB_OFF
              )}>
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   User Activity Sidebar — shared by /likes, /replied, /favorites
   ═══════════════════════════════════════════════════════════════════ */

const UserActivitySidebar = () => {
  const pathname = usePathname();
  const likesCount = useLikesStore((s) => s.likes.size);
  const repliedCount = useRepliedStore((s) => s.replies.size);
  const favoritesCount = useFavoritesStore((s) => s.favorites.size);
  const activityCount = useActivityStore((s) => s.activities.length);

  const NAV_ITEMS = [
    { href: "/favorites", label: "Favorites",  icon: StarIcon,           count: favoritesCount },
    { href: "/likes",     label: "Liked Posts", icon: ThumbsUpIcon,      count: likesCount },
    { href: "/replied",   label: "My Replies",  icon: MessageSquareIcon, count: repliedCount },
    { href: "/activity",  label: "Activity",    icon: ActivityIcon,      count: activityCount },
  ];

  return (
    <div className="flex flex-col py-3">
      {/* Header */}
      <div className="mx-2 flex items-center gap-2.5 px-2.5 py-2 mb-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <StarIcon className="size-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">My Activity</p>
          <p className="text-[10px] text-muted-foreground">Posts you interacted with</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="mx-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors cursor-pointer",
                isActive ? ACTIVE : HOVER
              )}
            >
              <div className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md",
                isActive ? DOT_ON : DOT_OFF
              )}>
                <item.icon className="size-3" />
              </div>
              <span className="text-xs font-medium flex-1 truncate">{item.label}</span>
              <span className={cn(
                "text-[10px] font-medium shrink-0 tabular-nums",
                isActive ? SUB_ON : SUB_OFF
              )}>
                {item.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Main AppSidebar — route-aware, renders the right section
   ═══════════════════════════════════════════════════════════════════ */

export const AppSidebar = () => {
  const pathname = usePathname();

  const isCommunityRoute = pathname === "/community" || pathname.startsWith("/community/");
  const isTagsRoute = pathname.startsWith("/tags");
  const isActivityRoute = pathname === "/favorites" || pathname === "/likes" || pathname === "/replied" || pathname === "/activity";

  /* Only show sidebar on supported routes */
  if (!isCommunityRoute && !isTagsRoute && !isActivityRoute) return null;

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-background overflow-y-auto">
      {isCommunityRoute && <CommunitySidebar />}
      {isTagsRoute && <TagsSidebar />}
      {isActivityRoute && <UserActivitySidebar />}
    </aside>
  );
};
