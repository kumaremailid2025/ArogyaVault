"use client";

import * as React from "react";
import {
  MessageSquareIcon, GlobeIcon, UserPlusIcon, UsersIcon,
  ArrowRightLeftIcon,
} from "lucide-react";
import dynamic from "next/dynamic";

import type { SmartInputSubmitPayload } from "@/models/input";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import { COMMUNITY_POSTS } from "@/data/community-data";
import {
  LINKED_MEMBER_DATA,
  LINKED_POST_SUMMARIES,
  LINKED_POST_AI_RESPONSES,
} from "@/data/linked-member-data";
import { generateRephrasings } from "@/lib/post-utils";
import type { CommunityPost, LinkedPost } from "@/models/community";

import type {
  CommunityTab,
  CommunityVariant,
  PanelState,
  BannerConfig,
} from "./types";
import { GROUP_SLUG_TO_UUID } from "./types";

import { CommunityBanner } from "@/components/community/community-banner";
import { ComposeArea } from "@/components/community/compose-area";
import { PostCard } from "@/components/community/post-card";
import { RightPanelContainer } from "./right-panel-container";
import { FilesContainer } from "./files-container";
import { MembersContainer } from "./members-container";

/* Lazy-loaded: modal only fetched when Invite link is clicked */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null },
);

/* ═══════════════════════════════════════════════════════════════════
   COMMUNITY WRAPPER CONTAINER
   Single orchestrator for /community and /community/[groupId].
   Owns: banner, state, center content (feed/files/members),
   right panel, and invite modal.
═══════════════════════════════════════════════════════════════════ */

interface CommunityWrapperContainerProps {
  variant: CommunityVariant;
  group: string;
  tab?: CommunityTab;
}

/* ── Banner config builder ──────────────────────────────────────── */

const buildBannerConfig = (
  variant: CommunityVariant,
  group: string,
  tab: CommunityTab,
  onInvite: () => void,
): BannerConfig => {
  if (variant === "invited") {
    const member = LINKED_MEMBER_DATA[group];
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

    const tabs = [
      { key: "feed" as const, label: "Feed", href: `/community/${GROUP_SLUG_TO_UUID[group] ?? ""}` },
      { key: "files" as const, label: "Files", href: `/community/${GROUP_SLUG_TO_UUID[group] ?? ""}/files` },
      { key: "members" as const, label: "Members", href: `/community/${GROUP_SLUG_TO_UUID[group] ?? ""}/members` },
    ] as const;

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
          <span className="text-xs text-primary-foreground/70">{member.direction}</span>
          <span className="text-xs text-primary-foreground/50 mx-1">·</span>
          <span className="text-xs text-primary-foreground/70">{member.scope}</span>
          <span className="text-xs text-primary-foreground/50 mx-1">·</span>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onInvite(); }}
            className="inline-flex items-center gap-1 text-xs underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
          >
            <UserPlusIcon className="size-3" /> Invite to this group
          </a>
        </div>
      ),
      tabs,
      activeTab: tab,
    };
  }

  /* variant === "community" */
  return {
    icon: (
      <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
        <MessageSquareIcon className="size-4" />
      </div>
    ),
    title: "ArogyaTalk",
    badges: [
      { label: "Community" },
      { label: "Public", icon: <GlobeIcon className="size-2.5" /> },
      { label: "12,847 members", icon: <UsersIcon className="size-2.5" /> },
    ],
    description: (
      <p className="text-sm text-primary-foreground/80 leading-relaxed">
        Connect with other ArogyaVault members. Ask questions, share experiences, support each other.{" "}
        <span className="text-primary-foreground/50 mx-1">·</span>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onInvite(); }}
          className="inline-flex items-center gap-1 underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
        >
          <UserPlusIcon className="size-3" /> Invite someone to community
        </a>
      </p>
    ),
    tabs: [
      { key: "feed" as const, label: "Feed", href: "/community" },
      { key: "files" as const, label: "Files", href: "/community/files" },
      { key: "members" as const, label: "Members", href: "/community/members" },
    ] as const,
    activeTab: tab,
  };
};

/* ── Wrapper component ──────────────────────────────────────────── */

export const CommunityWrapperContainer = ({
  variant,
  group,
  tab = "feed",
}: CommunityWrapperContainerProps) => {
  /* ── Resolve data source ── */
  const member = variant === "invited" ? LINKED_MEMBER_DATA[group] : null;
  const initialPosts = variant === "community" ? COMMUNITY_POSTS : (member?.posts ?? []);

  /* ── State ── */
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [posts, setPosts] = React.useState<(CommunityPost | LinkedPost)[]>(initialPosts);
  const [composeText, setComposeText] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());
  const [panelState, setPanelState] = React.useState<PanelState>({ view: "default" });
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const [pendingReply, setPendingReply] = React.useState<ComposeSubmitPayload | null>(null);
  const nextPostIdRef = React.useRef(
    variant === "community"
      ? COMMUNITY_POSTS.length
      : (member?.posts.length ?? 0) + 100,
  );

  /* ── Derived ── */
  const activePostId = panelState.view !== "default" ? panelState.postId : null;
  const activePost = activePostId !== null
    ? posts.find((p) => p.id === activePostId) ?? null
    : null;

  const linkedSummary =
    variant === "invited" && activePostId !== null
      ? LINKED_POST_SUMMARIES[group]?.[activePostId] ??
        (activePost && activePost.replyCount === 0
          ? "No replies yet on this post."
          : `${activePost?.replyCount ?? 0} ${activePost?.replyCount === 1 ? "reply" : "replies"} received.`)
      : "";

  const linkedAiResponse =
    variant === "invited" && activePostId !== null
      ? LINKED_POST_AI_RESPONSES[group]?.[activePostId] ?? ""
      : "";

  /* ── Banner config ── */
  const bannerConfig = React.useMemo(
    () => buildBannerConfig(variant, group, tab, () => setInviteOpen(true)),
    [variant, group, tab],
  );

  /* ── Handlers ── */
  const openReplies = React.useCallback((postId: number) => {
    setPanelState({ view: "replies", postId });
    setPendingReply(null);
  }, []);

  const openSummary = React.useCallback((postId: number) => {
    setPanelState({ view: "summary", postId });
  }, []);

  const closePanel = React.useCallback(() => {
    setPanelState({ view: "default" });
    setPendingReply(null);
  }, []);

  const handlePreviewSend = React.useCallback((payload: ComposeSubmitPayload) => {
    setPanelState((prev) => {
      if (prev.view !== "replies") return prev;
      const text = payload.text.trim();
      if (!text) return prev;
      setPendingReply(payload);
      setSelectedVersion(1);
      return {
        view: "reply-preview" as const,
        postId: prev.postId,
        original: text,
        rephrasings: generateRephrasings(text),
      };
    });
  }, []);

  const handleBackToCompose = React.useCallback(() => {
    setPanelState((prev) =>
      prev.view === "reply-preview" ? { view: "replies", postId: prev.postId } : prev,
    );
  }, []);

  const toggleLike = React.useCallback((postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const delta = likedPosts.has(postId) ? -1 : 1;
        return { ...p, likes: p.likes + delta };
      }),
    );
  }, [likedPosts]);

  const handleSubmitReply = React.useCallback(() => {
    setPanelState((prev) => {
      if (prev.view !== "reply-preview") return prev;
      const { postId, original, rephrasings } = prev;
      const versions: string[] = [original, ...rephrasings];
      const text = versions[selectedVersion];
      const author = variant === "community" ? "Kumar" : "You";
      setPosts((ps) =>
        ps.map((p) =>
          p.id === postId
            ? {
                ...p,
                replyCount: p.replyCount + 1,
                replies: [
                  ...p.replies,
                  { initials: "KU", author, time: "Just now", text },
                ],
              }
            : p,
        ),
      );
      setPendingReply(null);
      return { view: "default" };
    });
  }, [selectedVersion, variant]);

  const handlePost = React.useCallback(
    (payload: SmartInputSubmitPayload) => {
      const trimmed = payload.text.trim();
      if (!trimmed) return;
      const newPost = variant === "community"
        ? ({
            id: nextPostIdRef.current++,
            initials: "KU",
            author: "Kumar",
            location: "Hyderabad",
            time: "Just now",
            text: trimmed,
            likes: 0,
            replyCount: 0,
            tag: "Discussion",
            replies: [],
          } as CommunityPost)
        : ({
            id: nextPostIdRef.current++,
            initials: "KU",
            author: "You",
            time: "Just now",
            text: trimmed,
            likes: 0,
            replyCount: 0,
            tag: "Update",
            replies: [],
          } as LinkedPost);
      setPosts((prev) => [newPost, ...prev]);
      setComposeText("");
    },
    [variant],
  );

  /* ── Early return for missing invited member ── */
  if (variant === "invited" && !member) return null;

  /* ── Compose placeholder ── */
  const composePlaceholder =
    variant === "invited" && member
      ? `Share an update, note, or question with ${member.name.split(" ")[0]}…`
      : undefined;

  /* ── Files / Members titles ── */
  const filesTitle =
    variant === "community" ? "Community Files" : `${member?.name ?? ""}'s Shared Files`;
  const membersTitle = variant === "community" ? "Community Members" : "Group Members";
  const memberCount = variant === "community" ? "12,847" : (member?.memberCount ?? 2);

  /* ── Files / Members data for invited ── */
  const invitedFiles = variant === "invited" && member
    ? member.sharedFiles ?? [
        { name: "Medical Report - Feb 2026.pdf", size: "1.8 MB", date: "Feb 15, 2026" },
        { name: "Prescription Scan.jpg", size: "420 KB", date: "Mar 2, 2026" },
        { name: "Lab Results - CBC.pdf", size: "310 KB", date: "Mar 10, 2026" },
      ]
    : undefined;

  const invitedMembers = variant === "invited" && member
    ? member.members ?? [
        { name: "You", role: "Owner", initials: "KU", status: "Active now" },
        { name: member.name, role: member.relation, initials: member.initials, status: "Active recently" },
      ]
    : undefined;

  /* ── Render ── */
  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── BANNER ── */}
      <CommunityBanner config={bannerConfig} />

      {/* ── FILES tab ── */}
      {tab === "files" && (
        <FilesContainer
          title={filesTitle}
          files={invitedFiles}
        />
      )}

      {/* ── MEMBERS tab ── */}
      {tab === "members" && (
        <MembersContainer
          title={membersTitle}
          memberCount={memberCount}
          members={invitedMembers}
        />
      )}

      {/* ── FEED tab (two-column layout) ── */}
      {tab === "feed" && (
        <div className="flex-1 overflow-hidden flex min-h-0">

          {/* LEFT — Compose (pinned) + Posts (scrollable) */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Compose — pinned above scroll */}
            <div className="shrink-0 px-5 pt-2 pb-1 lg:px-6">
              <ComposeArea
                value={composeText}
                onChange={setComposeText}
                onSubmit={handlePost}
                placeholder={composePlaceholder}
              />
            </div>

            {/* Post cards — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6">
              <div className="space-y-3 pt-1">
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    isActive={activePostId === p.id}
                    isLiked={likedPosts.has(p.id)}
                    onLike={toggleLike}
                    onReplies={openReplies}
                    onSummary={openSummary}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-border shrink-0" />

          {/* RIGHT — State-driven panel */}
          <RightPanelContainer
            variant={variant}
            panelState={panelState}
            activePost={activePost}
            posts={posts}
            pendingReply={pendingReply}
            selectedVersion={selectedVersion}
            onClosePanel={closePanel}
            onOpenReplies={openReplies}
            onPreviewSend={handlePreviewSend}
            onBackToCompose={handleBackToCompose}
            onSetSelectedVersion={setSelectedVersion}
            onSubmitReply={handleSubmitReply}
            linkedSummary={linkedSummary}
            linkedAiResponse={linkedAiResponse}
            memberId={group}
          />
        </div>
      )}

      {/* Invite modal */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        {...(variant === "invited" && member ? { groupContext: `${member.name}'s group` } : {})}
      />
    </div>
  );
};
