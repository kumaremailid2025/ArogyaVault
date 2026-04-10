"use client";

/**
 * CommunityShell
 * --------------
 * Thin layout wrapper for all community routes.
 * Renders: banner (with tab navigation) + invite modal + {children}.
 *
 * Used by:
 *   - community/layout.tsx  (variant="community")
 *   - community/[groupId]/layout.tsx  (variant="invited")
 *
 * The active tab is derived from the current pathname — no prop needed.
 * Children are the active route's page component (feed, files, or members).
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquareIcon,
  GlobeIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import dynamic from "next/dynamic";

import { CommunityBanner } from "@/components/community/community-banner";
import { useLinkedMembers } from "@/data/linked-member-data";
import type { CommunityTab, CommunityVariant, BannerConfig } from "./types";
import { GROUP_SLUG_TO_UUID } from "./types";

/** UUID regex — dynamic invite groups use their UUID directly as the slug. */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a group slug (or UUID) to the UUID segment we use in URLs.
 * - Static seed slugs ("ravi") → UUID via GROUP_SLUG_TO_UUID.
 * - Dynamic invite groups already pass in their UUID → return as-is.
 */
const slugToRouteId = (group: string): string => {
  const mapped = GROUP_SLUG_TO_UUID[group];
  if (mapped) return mapped;
  if (UUID_REGEX.test(group)) return group;
  return "";
};

/* ── Lazy-loaded invite modal ─────────────────────────────────────── */

const InviteModal = dynamic(
  () =>
    import("@/components/app/invite-modal").then((m) => ({
      default: m.InviteModal,
    })),
  { ssr: false, loading: () => null },
);

/* ── Derive active tab from pathname ──────────────────────────────── */

const deriveTab = (pathname: string): CommunityTab => {
  // Match whether the path is the tab itself (".../members") OR a
  // sub-route under it (".../members/123"). Same for files.
  if (/\/files(\/|$)/.test(pathname)) return "files";
  if (/\/members(\/|$)/.test(pathname)) return "members";
  return "feed";
};

/* ── Banner config builders ───────────────────────────────────────── */

const buildCommunityBanner = (
  tab: CommunityTab,
  onInvite: () => void,
): BannerConfig => ({
  icon: (
    <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
      <MessageSquareIcon className="size-4" />
    </div>
  ),
  title: "Arogya Community",
  badges: [
    { label: "Public", icon: <GlobeIcon className="size-2.5" /> },
    { label: "12,847 members", icon: <UsersIcon className="size-2.5" /> },
  ],
  description: (
    <p className="text-sm text-primary-foreground/80 leading-relaxed">
      Connect with other ArogyaVault members. Ask questions, share experiences,
      support each other.{" "}
      <span className="text-primary-foreground/50 mx-1">·</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onInvite();
        }}
        className="inline-flex items-center gap-1 underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
      >
        <UserPlusIcon className="size-3" /> Invite someone to community
      </a>
    </p>
  ),
  tabs: [
    { key: "feed" as const, label: "Feed", href: "/community" },
    { key: "files" as const, label: "Files", href: "/community/files" },
    {
      key: "members" as const,
      label: "Members",
      href: "/community/members",
    },
  ] as const,
  activeTab: tab,
});

const buildInvitedBanner = (
  group: string,
  tab: CommunityTab,
  onInvite: () => void,
  linkedMemberData: ReturnType<typeof useLinkedMembers>["LINKED_MEMBER_DATA"],
): BannerConfig => {
  const member = linkedMemberData[group];
  if (!member) {
    return {
      icon: null,
      title: "Unknown Group",
      badges: [],
      description: null,
      tabs: [],
      activeTab: tab,
    };
  }

  const groupUuid = slugToRouteId(group);
  return {
    icon: (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
        {member.initials}
      </div>
    ),
    title: member.name,
    badges: [{ label: member.badgeLabel }],
    description: (
      <div className="flex items-center gap-1.5 flex-wrap">
        <ArrowRightLeftIcon className="size-3 text-primary-foreground/60 shrink-0" />
        <span className="text-xs text-primary-foreground/70">
          {member.direction}
        </span>
        <span className="text-xs text-primary-foreground/50 mx-1">·</span>
        <span className="text-xs text-primary-foreground/70">
          {member.scope}
        </span>
        <span className="text-xs text-primary-foreground/50 mx-1">·</span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onInvite();
          }}
          className="inline-flex items-center gap-1 text-xs underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
        >
          <UserPlusIcon className="size-3" /> Invite to this group
        </a>
      </div>
    ),
    tabs: [
      { key: "feed" as const, label: "Feed", href: `/community/${groupUuid}` },
      {
        key: "files" as const,
        label: "Files",
        href: `/community/${groupUuid}/files`,
      },
      {
        key: "members" as const,
        label: "Members",
        href: `/community/${groupUuid}/members`,
      },
    ] as const,
    activeTab: tab,
  };
};

/* ── Shell component ──────────────────────────────────────────────── */

interface CommunityShellProps {
  variant: CommunityVariant;
  group: string;
  children: React.ReactNode;
}

export const CommunityShell = ({
  variant,
  group,
  children,
}: CommunityShellProps) => {
  const { LINKED_MEMBER_DATA } = useLinkedMembers();
  const pathname = usePathname();
  const tab = deriveTab(pathname);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const bannerConfig = React.useMemo(() => {
    const onInvite = () => setInviteOpen(true);
    return variant === "community"
      ? buildCommunityBanner(tab, onInvite)
      : buildInvitedBanner(group, tab, onInvite, LINKED_MEMBER_DATA);
  }, [variant, group, tab, LINKED_MEMBER_DATA]);

  const member = variant === "invited" ? LINKED_MEMBER_DATA[group] : null;
  // Resolve the static slug → UUID so the invite modal receives a real
  // group id it can pass to /invites/lookup for the duplicate-member
  // check. Dynamic invite groups already flow through as UUIDs.
  const invitedGroupId = variant === "invited" ? slugToRouteId(group) : "";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CommunityBanner config={bannerConfig} />

      {/* Active tab content — rendered by child route */}
      <div className="flex-1 overflow-hidden flex min-h-0">{children}</div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        {...(member && invitedGroupId
          ? {
              groupContext: `${member.name}'s group`,
              groupId: invitedGroupId,
            }
          : {})}
      />
    </div>
  );
};
