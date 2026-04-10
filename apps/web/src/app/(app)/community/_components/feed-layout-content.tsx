"use client";

/**
 * FeedLayoutContent
 * -----------------
 * Shared two-column feed layout used by both main /community and /community/[groupId].
 * LEFT: Compose area + post list
 * RIGHT: {children} (route-driven panel)
 *
 * Accepts variant, group, and basePath to stay route-agnostic.
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

import type { SmartInputSubmitPayload } from "@/models/input";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { CommunityVariant, PanelState } from "@/components/containers/community/types";

import { PostCard } from "@/components/community/post-card";
import { SmartInput } from "@/components/shared/smart-input";
import { FeedProvider } from "@/app/(app)/community/_context/feed-context";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";
import { useFavoritesStore, useTagsStore, useLikesStore, useRepliedStore, recordActivity } from "@/stores";
import { TypeCode, ActionCode } from "@/models/type-codes";

/* ── Mock data (invited variant) ─────────────────────────────────── */
import { useLinkedMembers } from "@/data/linked-member-data";

import {
  usePosts,
  useCreatePost,
  useSubmitReply,
  useToggleLike,
  usePostSummary,
  useRephrase,
} from "@/hooks/api";

interface FeedLayoutContentProps {
  variant: CommunityVariant;
  group: string;
  basePath: string; // "/community" or "/community/<uuid>"
  children: React.ReactNode;
}

export const FeedLayoutContent = ({ variant, group, basePath, children }: FeedLayoutContentProps) => {
  const { LINKED_MEMBER_DATA, LINKED_POST_SUMMARIES, LINKED_POST_AI_RESPONSES } = useLinkedMembers();
  const router = useRouter();
  const pathname = usePathname();

  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;
  const member = !isCommunity ? LINKED_MEMBER_DATA[group] : null;

  /* ── API hooks (enabled for ALL groups — community + invited) ── */
  const postsQuery = usePosts(groupId, {});
  const createPostMut = useCreatePost(groupId);
  const submitReplyMut = useSubmitReply(groupId);
  const toggleLikeMut = useToggleLike(groupId);
  const rephraseMut = useRephrase();

  /* ── State ── */
  const [composeText, setComposeText] = React.useState("");
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
      ? (LINKED_POST_SUMMARIES[group]?.[activePostId] ??
        (activePost && activePost.replyCount === 0
          ? "No replies yet on this post."
          : `${activePost?.replyCount ?? 0} ${activePost?.replyCount === 1 ? "reply" : "replies"} received.`))
      : (isCommunity && summaryQuery.data?.summary) || "";

  const linkedAiResponse =
    !isCommunity && activePostId !== null
      ? (LINKED_POST_AI_RESPONSES[group]?.[activePostId] ?? "")
      : (isCommunity && summaryQuery.data?.ai_response) || "";

  /* ── Build route-aware regex patterns ── */
  const escapedBase = basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /* ── Extract postId and view from URL to sync panelState ── */
  React.useEffect(() => {
    const repliesRe = new RegExp(`^${escapedBase}/post/(\\d+)/replies$`);
    const summaryRe = new RegExp(`^${escapedBase}/post/(\\d+)$`);

    if (pathname === basePath || pathname === basePath + "/") {
      setPanelState({ view: "default" });
      setPendingReply(null);
    } else {
      const repliesMatch = pathname.match(repliesRe);
      if (repliesMatch) {
        const postId = parseInt(repliesMatch[1], 10);
        setPanelState({ view: "replies", postId });
        setPendingReply(null);
      } else {
        const summaryMatch = pathname.match(summaryRe);
        if (summaryMatch) {
          const postId = parseInt(summaryMatch[1], 10);
          setPanelState({ view: "summary", postId });
        }
      }
    }
  }, [pathname, basePath, escapedBase]);

  /* ── Active post from URL (needed for toggle deselect) ── */
  const urlPostId = React.useMemo(() => {
    const postRe = new RegExp(`^${escapedBase}/post/(\\d+)`);
    const match = pathname.match(postRe);
    return match ? parseInt(match[1], 10) : null;
  }, [pathname, escapedBase]);

  /* ── Favorites store ── */
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  /* ── Likes store (replaces local likedPosts state) ── */
  const { likedIds: likedPosts, toggleLike: storeLike } = useLikesStore();

  /* ── Replied store ── */
  const { addReply: storeReply } = useRepliedStore();

  /* ── Register posts in tags store ── */
  const registerPosts = useTagsStore((s) => s.registerPosts);
  React.useEffect(() => {
    if (posts.length > 0) registerPosts(posts);
  }, [posts, registerPosts]);

  /* ── Handlers ── */

  const openReplies = React.useCallback((postId: number) => {
    /* Toggle deselect: if already viewing this post, go back to default */
    if (urlPostId === postId) {
      router.push(basePath);
      return;
    }
    recordActivity({ typeCode: TypeCode.POST, actionCode: ActionCode.POST_VIEW, entityId: postId, groupId });
    router.push(`${basePath}/post/${postId}/replies`);
  }, [router, basePath, urlPostId, groupId]);

  const openSummary = React.useCallback((postId: number) => {
    /* Toggle deselect for summary too */
    if (urlPostId === postId) {
      router.push(basePath);
      return;
    }
    recordActivity({ typeCode: TypeCode.POST_SUMMARY, actionCode: ActionCode.AI_SUMMARY_VIEW, entityId: postId, groupId });
    router.push(`${basePath}/post/${postId}`);
  }, [router, basePath, urlPostId, groupId]);

  const handlePreviewSend = React.useCallback(
    (payload: ComposeSubmitPayload) => {
      const text = payload.text.trim();
      if (!text) return;
      if (panelState.view !== "replies") return;

      const { postId } = panelState;

      setPendingReply(payload);
      setSelectedVersion(1);
      setPanelState({
        view: "reply-preview",
        postId,
        original: text,
        rephrasings: ["", ""] as [string, string],
      });

      /* API-backed rephrase for all variants. onSuccess updater is
         pure (no side effects), so it's safe to call setPanelState
         from inside it. */
      rephraseMut.mutate(text, {
        onSuccess: (data) => {
          setPanelState((cur) => {
            if (cur.view !== "reply-preview") return cur;
            return { ...cur, rephrasings: data.rephrasings as [string, string] };
          });
        },
      });
    },
    [panelState, rephraseMut],
  );

  const handleBackToCompose = React.useCallback(() => {
    setPanelState((prev) =>
      prev.view === "reply-preview" ? { view: "replies", postId: prev.postId } : prev,
    );
  }, []);

  const toggleLike = React.useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      /* Store handles activity recording internally */
      storeLike(post, groupId);

      /* API-backed for all groups */
      toggleLikeMut.mutate(postId);
    },
    [posts, storeLike, toggleLikeMut, groupId],
  );

  const handleSubmitReply = React.useCallback(() => {
    /* Read current panel state from the closure — DO NOT put side
       effects inside a setState updater. Updaters must be pure:
       StrictMode runs them twice (causing duplicate replies) and a
       Zustand set() inside an updater triggers a cross-component
       update during render ("Cannot update a component while
       rendering a different component"). */
    if (panelState.view !== "reply-preview") return;
    const { postId, original, rephrasings } = panelState;
    const versions: string[] = [original, ...rephrasings];
    const text = versions[selectedVersion];
    if (!text) return;

    /* Record in replied store — backend auto-records REPLY_SUBMIT activity */
    const repliedPost = posts.find((p) => p.id === postId);
    if (repliedPost) storeReply(repliedPost, text, groupId);

    /* API-backed for all groups */
    submitReplyMut.mutate({ postId, text });

    setPendingReply(null);
    setSelectedVersion(0);
    setPanelState({ view: "replies", postId });
  }, [panelState, selectedVersion, submitReplyMut, posts, storeReply, groupId]);

  const handlePost = React.useCallback(
    (payload: SmartInputSubmitPayload) => {
      const trimmed = payload.text.trim();
      if (!trimmed) return;

      /* API-backed for all groups */
      createPostMut.mutate({ text: trimmed, tag: "Discussion" });
      recordActivity({
        typeCode: TypeCode.POST,
        actionCode: ActionCode.POST_CREATE,
        entityId: groupId,
        groupId,
        meta: { textSnippet: trimmed.slice(0, 100) },
      });
      setComposeText("");
    },
    [createPostMut, groupId],
  );

  /* ── Derive replyPreviewState for context ── */
  const replyPreviewState =
    panelState.view === "reply-preview"
      ? { original: panelState.original, rephrasings: panelState.rephrasings }
      : null;

  /* ── Compose placeholder ── */
  const composePlaceholder =
    !isCommunity && member
      ? `Share an update, note, or question with ${member.name.split(" ")[0]}…`
      : undefined;

  const contextValue = {
    variant,
    group,
    basePath,
    posts,
    likedPosts,
    toggleLike,
    openReplies,
    openSummary,
    pendingReply,
    selectedVersion,
    setSelectedVersion,
    handlePreviewSend,
    handleBackToCompose,
    handleSubmitReply,
    replyPreviewState,
    linkedSummary,
    linkedAiResponse,
  };

  return (
    <FeedProvider value={contextValue}>
      <>
        {/* LEFT — Posts (scrollable) + Compose (pinned bottom) */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 pb-4 lg:px-6">
            <div className="space-y-3 pt-3">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  isActive={urlPostId === p.id}
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

          {/* ── Pinned compose at bottom ── */}
          <div className="shrink-0 border-t border-border px-4 pt-2 pb-3">
            <SmartInput
              value={composeText}
              onChange={setComposeText}
              onSubmit={handlePost}
              placeholder={composePlaceholder ?? "Share a tip, ask the community, or start a discussion…"}
              submitLabel="Post"
              modes={["text", "voice", "image", "attach"]}
              maxRows={4}
              layout="compose"
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — Route-driven panel */}
        <div className="w-[360px] shrink-0 border-l border-border overflow-hidden flex flex-col">
          {children}
        </div>
      </>
    </FeedProvider>
  );
};
