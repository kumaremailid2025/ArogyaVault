"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { TagIcon, ThumbsUpIcon, MessageSquareIcon, StarIcon, ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";
import { useTagsStore, tagToSlug, useLikesStore, useRepliedStore, useFavoritesStore, useActivityStore } from "@/stores";
import { useCommunity } from "@/data/community-data";
import { useLinkedMembers } from "@/data/linked-member-data";
import { useSidebar } from "@/data/sidebar-data";
import { useSidebarOverlay } from "@/components/app/sidebar-overlay-context";
import Typography from "@/components/ui/typography";

/* Shared active / hover tokens */
const ACTIVE  = "bg-primary text-primary-foreground";
const HOVER   = "text-foreground hover:bg-primary/10 hover:text-primary";
const DOT_ON  = "bg-white/20";
const DOT_OFF = "bg-primary/15";
const SUB_ON  = "text-primary-foreground/70";
const SUB_OFF = "text-muted-foreground";

/** Build the community route for a given slug (or dynamic UUID-as-slug) */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const communityHref = (slug: string): string => {
  const uuid = GROUP_SLUG_TO_UUID[slug];
  if (uuid) return `/community/${uuid}`;
  // Dynamically-created invite groups use the UUID directly as their slug
  if (UUID_RE.test(slug)) return `/community/${slug}`;
  return "/community";
};

/* ═══════════════════════════════════════════════════════════════════
   Community Sidebar
   ═══════════════════════════════════════════════════════════════════ */

const CommunitySidebar = () => {
  const pathname = usePathname();
  const params = useParams<{ groupId?: string }>();
  const { COMMUNITY_GROUP, LINKED_GROUPS } = useSidebar();

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
          <Typography variant="h4" as="p" className="leading-snug truncate" color={isDefaultCommunity ? "inverse" : "default"}>{COMMUNITY_GROUP.name}</Typography>
          <Typography
            variant="micro"
            truncate={true}
            className={isDefaultCommunity ? SUB_ON : SUB_OFF}
          >
            {COMMUNITY_GROUP.sub}
          </Typography>
        </div>
      </Link>

      {/* ── Nested conversation groups ────────────────────── */}
      <div className="ml-4 mr-2 border-l-2 border-primary/15 pl-1 flex flex-col gap-0 mb-1">
        {LINKED_GROUPS.map((g) => {
          const uuid = GROUP_SLUG_TO_UUID[g.slug] ?? (UUID_RE.test(g.slug) ? g.slug : "");
          const isActive = activeGroupId === uuid;
          // Prefer the initials computed by the backend (handles masked
          // phone labels like "+91****5592" → "92"). Fall back to first
          // letters of the name for static seeded groups.
          const nameLooksLikePhone = /^[+*\d\s]+$/.test(g.name);
          const initials =
            (g as { initials?: string }).initials
            || (nameLooksLikePhone
              ? (g.name.match(/\d/g) ?? []).slice(-2).join("")
              : g.name.split(" ").map((w) => w[0]).join("").slice(0, 2));
          const hasExtras = (g.count ?? 0) > 0;
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
                {initials || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <Typography variant="h5" as="p" truncate={true} color={isActive ? "inverse" : "default"}>{g.name}</Typography>
                  {hasExtras && (
                    <span className={cn("text-[9px] font-medium shrink-0", isActive ? SUB_ON : SUB_OFF)}>
                      +{g.count}
                    </span>
                  )}
                </div>
                <Typography
                  variant="micro"
                  truncate={true}
                  className={isActive ? SUB_ON : SUB_OFF}
                >
                  {[g.rel, g.sub].filter(Boolean).join(" · ")}
                </Typography>
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

  const { COMMUNITY_POSTS } = useCommunity();
  const { LINKED_MEMBER_DATA } = useLinkedMembers();
  const { getSortedTags, postsByTag, registerPosts } = useTagsStore();

  /* Seed store from static data so sidebar always has items */
  React.useEffect(() => {
    const allPosts = [
      ...COMMUNITY_POSTS,
      ...Object.values(LINKED_MEMBER_DATA).flatMap((m) => m.posts),
    ];
    registerPosts(allPosts);
  }, [registerPosts, COMMUNITY_POSTS, LINKED_MEMBER_DATA]);

  const sortedTags = getSortedTags();

  return (
    <div className="flex flex-col py-3">
      {/* ── Topics header ──────────────────────────────────── */}
      <div className="mx-2 flex items-center gap-2.5 px-2.5 py-2 mb-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <TagIcon className="size-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <Typography variant="h4" as="p" className="leading-snug">Topics</Typography>
          <Typography variant="micro" color="muted">{sortedTags.length} tags</Typography>
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
          <Typography variant="h4" as="p" className="leading-snug">My Activity</Typography>
          <Typography variant="micro" color="muted">Posts you interacted with</Typography>
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
              <Typography variant="caption" weight="medium" as="span" className="flex-1" truncate={true} color={isActive ? "inverse" : "default"}>{item.label}</Typography>
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
  const { open: latchedOpen, setOpen } = useSidebarOverlay();
  const [hovered, setHovered] = React.useState(false);

  const isCommunityRoute = pathname === "/community" || pathname.startsWith("/community/");
  const isTagsRoute = pathname.startsWith("/tags");
  const isActivityRoute = pathname === "/favorites" || pathname === "/likes" || pathname === "/replied" || pathname === "/activity";

  /* Collapse the overlay & hover state whenever the pathname changes —
     selecting an item in the Left Panel updates the URL, at which point
     the overlay must auto-close per page-responsive.spec.md §4.1. */
  React.useEffect(() => {
    setOpen(false);
    setHovered(false);
  }, [pathname, setOpen]);

  /* Only show sidebar on supported routes */
  if (!isCommunityRoute && !isTagsRoute && !isActivityRoute) return null;

  /* /community — responsive overlay (< lg) + in-flow (lg+).
     Other routes keep the original hidden-below-lg behaviour; the
     overlay / hamburger rollout is scoped to /community for now. */
  if (isCommunityRoute) {
    const overlayVisible = latchedOpen || hovered;
    return (
      <>
        {/* Hover-reveal hit strip — 8px wide along the left edge.
            Only below `lg`; no-op on desktop since the sidebar is in flow. */}
        <div
          className="fixed left-0 top-14 bottom-0 w-2 z-30 lg:hidden"
          onMouseEnter={() => setHovered(true)}
          aria-hidden="true"
        />

        {/* Click-outside scrim — latched state only. */}
        {latchedOpen && (
          <div
            className="fixed inset-0 top-14 z-30 bg-black/20 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          role={latchedOpen ? "dialog" : undefined}
          aria-modal={latchedOpen ? true : undefined}
          aria-label="Community navigation"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            /* Shared chrome */
            "flex flex-col border-r border-border bg-background overflow-y-auto shrink-0",
            /* < lg: fixed overlay under the 56px header, 260px wide */
            "fixed top-14 bottom-0 left-0 w-[260px] z-40",
            "transition-transform duration-150 ease-out motion-reduce:transition-none",
            overlayVisible ? "translate-x-0" : "-translate-x-full",
            /* lg+: in-flow column, always visible */
            "lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:w-[260px] lg:translate-x-0",
          )}
        >
          <CommunitySidebar />
        </aside>
      </>
    );
  }

  /* /tags and /activity — unchanged (hidden below lg). */
  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-background overflow-y-auto">
      {isTagsRoute && <TagsSidebar />}
      {isActivityRoute && <UserActivitySidebar />}
    </aside>
  );
};
