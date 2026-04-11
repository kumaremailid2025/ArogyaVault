"use client";

/**
 * Container for the community feed tab.
 *
 * @packageDocumentation
 * @category Containers
 *
 * @remarks
 * Self-contained container for the feed tab (/community or /community/[groupId]).
 * Owns all feed-specific state: posts, compose, likes, panel, rephrase.
 *
 * Two-column layout: left (compose + posts) | right (panel).
 */

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2Icon } from "lucide-react";

import type { SmartInputSubmitPayload } from "@/models/input";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type {
  CommunityPost,
  LinkedPost,
} from "@/models/community";
import type { CommunityVariant, PanelState } from "./types";
import { GROUP_SLUG_TO_UUID } from "./types";

import { ComposeArea } from "@/components/community/compose-area";
import { PostCard } from "@/components/community/post-card";
import { useFavoritesStore } from "@/stores";

/* ── Mock data (invited variant) ─────────────────────────────────── */
import { useLinkedMembers } from "@/data/linked-member-data";

/* ── API hooks (community variant) ───────────────────────────────── */
import {
  usePosts,
  useCreatePost,
  useSubmitReply,
  useToggleLike,
  usePostSummary,
  useRephrase,
} from "@/hooks/api";

/* ── Lazy: right panel ───────────────────────────────────────────── */

const PanelLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  </div>
);

const feedPanelImport = () =>
  import("./feed-right-panel").then((m) => ({ default: m.FeedRightPanel }));

const FeedRightPanel = dynamic(feedPanelImport, {
  ssr: false,
  loading: () => <PanelLoader />,
});

if (typeof window !== "undefined") {
  feedPanelImport();
}

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props for {@link FeedPageContainer}.
 */
interface FeedPageContainerProps {
  /** Community variant (own or invited). */
  variant: CommunityVariant;
  /** Group slug or UUID. */
  group: string;
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the feed tab for the community. Manages all feed state and layout.
 * @param props Component props.
 * @returns React element.
 */
export const FeedPageContainer = ({
  variant,
  group,
}: FeedPageContainerProps): React.ReactElement => {
  const { LINKED_MEMBER_DATA, LINKED_POST_SUMMARIES, LINKED_POST_AI_RESPONSES } = useLinkedMembers();
  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;
  const member = !isCommunity ? LINKED_MEMBER_DATA[group] : null;

  /* ── Favorites ── */
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  /* ── API hooks (enabled for ALL groups — community + invited) ── */
  const postsQuery = usePosts(groupId, {});
  const createPostMut = useCreatePost(groupId);
  const submitReplyMut = useSubmitReply(groupId);
  const toggleLikeMut = useToggleLike(groupId);
  const rephraseMut = useRephrase();

  /* ── State ── */
  const [composeText, setComposeText] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());
  const [panelState, setPanelState] = React.useState<PanelState>({ view: "default" });
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const [pendingReply, setPendingReply] = React.useState<ComposeSubmitPayload | null>(null);

  const nextPostIdRef = React.useRef(100);

  /* ── Resolved data (API-backed for all groups) ── */
  const posts: (CommunityPost | LinkedPost)[] = postsQuery.data?.items ?? [];

  /* ── Summary query (on-demand) ── */
  const summaryPostId = panelState.view === "summary" ? panelState.postId : null;
  const summaryQuery = usePostSummary(groupId, summaryPostId, summaryPostId !== null);

  /* ── Derived ── */
  const activePostId =
    panelState.view === "summary" || panelState.view === "replies" || panelState.view === "reply-preview"
      ? panelState.postId
      : null;

  const activePost = activePostId !== null ? posts.find((p) => p.id === activePostId) ?? null : null;

  const linkedSummary =
    !isCommunity && activePostId !== null
      ? LINKED_POST_SUMMARIES[group]?.[activePostId] ??
        (activePost && activePost.replyCount === 0
          ? "No replies yet on this post."
          : `${activePost?.replyCount ?? 0} ${activePost?.replyCount === 1 ? "reply" : "replies"} received.`)
      : (isCommunity && summaryQuery.data?.summary) || "";

  const linkedAiResponse =
    !isCommunity && activePostId !== null
      ? LINKED_POST_AI_RESPONSES[group]?.[activePostId] ?? ""
      : (isCommunity && summaryQuery.data?.ai_response) || "";

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

  const handlePreviewSend = React.useCallback(
    (payload: ComposeSubmitPayload) => {
      const text = payload.text.trim();
      if (!text) return;

      setPanelState((prev) => {
        if (prev.view !== "replies") return prev;
        setPendingReply(payload);
        setSelectedVersion(1);

        /* API-backed rephrase for all groups */
        rephraseMut.mutate(text, {
          onSuccess: (data) => {
            setPanelState((cur) => {
              if (cur.view !== "reply-preview") return cur;
              return { ...cur, rephrasings: data.rephrasings as [string, string] };
            });
          },
        });
        return {
          view: "reply-preview" as const,
          postId: prev.postId,
          original: text,
          rephrasings: ["", ""] as [string, string],
        };
      });
    },
    [rephraseMut],
  );

  const handleBackToCompose = React.useCallback(() => {
    setPanelState((prev) =>
      prev.view === "reply-preview" ? { view: "replies", postId: prev.postId } : prev,
    );
  }, []);

  const toggleLike = React.useCallback(
    (postId: number) => {
      /* API-backed for all groups */
      setLikedPosts((prev) => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
      toggleLikeMut.mutate(postId);
    },
    [likedPosts, toggleLikeMut],
  );

  const handleSubmitReply = React.useCallback(() => {
    setPanelState((prev) => {
      if (prev.view !== "reply-preview") return prev;
      const { postId, original, rephrasings } = prev;
      const versions: string[] = [original, ...rephrasings];
      const text = versions[selectedVersion];

      /* API-backed for all groups */
      submitReplyMut.mutate({ postId, text });

      setPendingReply(null);
      setSelectedVersion(0);
      return { view: "replies", postId };
    });
  }, [selectedVersion, submitReplyMut]);

  const handlePost = React.useCallback(
    (payload: SmartInputSubmitPayload) => {
      const trimmed = payload.text.trim();
      if (!trimmed) return;

      /* API-backed for all groups */
      createPostMut.mutate({ text: trimmed, tag: "Discussion" });
      setComposeText("");
    },
    [createPostMut],
  );

  const composePlaceholder =
    !isCommunity && member
      ? `Share an update, note, or question with ${member.name.split(" ")[0]}…`
      : undefined;

  /* ── Render ── */
  return (
    <>
      {/* LEFT — Compose (pinned) + Posts (scrollable) */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="shrink-0 px-5 pt-2 pb-1 lg:px-6">
          <ComposeArea
            value={composeText}
            onChange={setComposeText}
            onSubmit={handlePost}
            placeholder={composePlaceholder}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6">
          <div className="space-y-3 pt-1">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                isActive={activePostId === p.id}
                isLiked={likedPosts.has(p.id)}
                isFavorited={favoriteIds.has(p.id)}
                onLike={toggleLike}
                onReplies={openReplies}
                onSummary={openSummary}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-border shrink-0" />

      {/* RIGHT — State-driven panel */}
      <FeedRightPanel
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
    </>
  );
};
