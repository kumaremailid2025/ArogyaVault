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
import { generateRephrasings } from "@/lib/post-utils";
import { FeedProvider } from "@/app/(app)/community/_context/feed-context";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";
import { useFavoritesStore, recordActivity } from "@/stores";
import { TypeCode, ActionCode } from "@/models/type-codes";

/* ── Mock data (invited variant) ─────────────────────────────────── */
import { LINKED_MEMBER_DATA, LINKED_POST_SUMMARIES, LINKED_POST_AI_RESPONSES } from "@/data/linked-member-data";

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
  const router = useRouter();
  const pathname = usePathname();

  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;
  const member = !isCommunity ? LINKED_MEMBER_DATA[group] : null;

  /* ── API hooks ── */
  const postsQuery = usePosts(groupId, isCommunity);
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

  /* Invited-only local posts */
  const [invitedPosts, setInvitedPosts] = React.useState<(CommunityPost | LinkedPost)[]>(
    member?.posts ?? [],
  );
  const nextPostIdRef = React.useRef(isCommunity ? 100 : (member?.posts.length ?? 0) + 100);

  /* ── Resolved data ── */
  const posts: (CommunityPost | LinkedPost)[] = isCommunity
    ? (postsQuery.data ?? [])
    : invitedPosts;

  /* ── Summary query (on-demand) ── */
  const summaryPostId = panelState.view === "summary" ? panelState.postId : null;
  const summaryQuery = usePostSummary(groupId, summaryPostId, isCommunity && summaryPostId !== null);

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

      setPanelState((prev) => {
        if (prev.view !== "replies") return prev;
        setPendingReply(payload);
        setSelectedVersion(1);

        if (isCommunity) {
          rephraseMut.mutate(text, {
            onSuccess: (data) => {
              setPanelState((cur) => {
                if (cur.view !== "reply-preview") return cur;
                return { ...cur, rephrasings: data.rephrasings as [string, string] };
              });
            },
          });
        }

        return {
          view: "reply-preview" as const,
          postId: prev.postId,
          original: text,
          rephrasings: generateRephrasings(text),
        };
      });
    },
    [isCommunity, rephraseMut],
  );

  const handleBackToCompose = React.useCallback(() => {
    setPanelState((prev) =>
      prev.view === "reply-preview" ? { view: "replies", postId: prev.postId } : prev,
    );
  }, []);

  const toggleLike = React.useCallback(
    (postId: number) => {
      const wasLiked = likedPosts.has(postId);
      recordActivity({
        typeCode: TypeCode.POST,
        actionCode: wasLiked ? ActionCode.UNLIKE : ActionCode.LIKE,
        entityId: postId,
        groupId,
      });

      if (isCommunity) {
        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.has(postId) ? next.delete(postId) : next.add(postId);
          return next;
        });
        toggleLikeMut.mutate(postId);
        return;
      }

      /* Invited variant — update local state */
      setLikedPosts((prev) => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
      setInvitedPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const delta = wasLiked ? -1 : 1;
          return { ...p, likes: p.likes + delta };
        }),
      );
    },
    [isCommunity, likedPosts, toggleLikeMut, groupId],
  );

  const handleSubmitReply = React.useCallback(() => {
    setPanelState((prev) => {
      if (prev.view !== "reply-preview") return prev;
      const { postId, original, rephrasings } = prev;
      const versions: string[] = [original, ...rephrasings];
      const text = versions[selectedVersion];

      recordActivity({
        typeCode: TypeCode.REPLY,
        actionCode: ActionCode.REPLY_SUBMIT,
        entityId: postId,
        groupId,
        meta: { textSnippet: text.slice(0, 100), wasRephrased: selectedVersion !== 0 },
      });

      if (isCommunity) {
        submitReplyMut.mutate({ postId, text });
      } else {
        /* Invited variant — update local state */
        setInvitedPosts((ps) =>
          ps.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  replyCount: p.replyCount + 1,
                  replies: [
                    ...p.replies,
                    { initials: "KU", author: "You", time: "Just now", text },
                  ],
                }
              : p,
          ),
        );
      }

      setPendingReply(null);
      setSelectedVersion(0);
      return { view: "replies", postId };
    });
  }, [selectedVersion, isCommunity, submitReplyMut]);

  const handlePost = React.useCallback(
    (payload: SmartInputSubmitPayload) => {
      const trimmed = payload.text.trim();
      if (!trimmed) return;

      if (isCommunity) {
        createPostMut.mutate({ text: trimmed, tag: "Discussion" });
        recordActivity({
          typeCode: TypeCode.POST,
          actionCode: ActionCode.POST_CREATE,
          entityId: groupId,
          groupId,
          meta: { textSnippet: trimmed.slice(0, 100) },
        });
        setComposeText("");
        return;
      }

      /* Invited variant — create local post */
      const newPost = {
        id: nextPostIdRef.current++,
        initials: "KU",
        author: "You",
        time: "Just now",
        text: trimmed,
        likes: 0,
        replyCount: 0,
        tag: "Update",
        replies: [],
      } as LinkedPost;
      setInvitedPosts((prev) => [newPost, ...prev]);
      recordActivity({
        typeCode: TypeCode.POST,
        actionCode: ActionCode.POST_CREATE,
        entityId: newPost.id,
        groupId,
        meta: { textSnippet: trimmed.slice(0, 100) },
      });
      setComposeText("");
    },
    [isCommunity, createPostMut, groupId],
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
