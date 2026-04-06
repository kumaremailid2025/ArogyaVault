"use client";

/**
 * Feed Layout
 * -----------
 * Two-column layout for the feed section.
 * LEFT: Compose area + post list (from hooks/state)
 * RIGHT: {children} (route-driven panel)
 *
 * Wraps both columns in FeedProvider so panel pages can access context.
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import type { SmartInputSubmitPayload } from "@/models/input";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { CommunityVariant, PanelState } from "@/components/containers/community/types";

import { ComposeArea } from "@/components/community/compose-area";
import { PostCard } from "@/components/community/post-card";
import { generateRephrasings } from "@/lib/post-utils";
import { FeedProvider } from "@/app/(app)/community/_context/feed-context";

import {
  usePosts,
  useCreatePost,
  useSubmitReply,
  useToggleLike,
  usePostSummary,
  useRephrase,
} from "@/hooks/api";

interface FeedLayoutProps {
  children: React.ReactNode;
}

const PanelLoader = () => (
  <div className="flex-1 flex items-center justify-center">
    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  </div>
);

const FeedLayout = ({ children }: FeedLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();

  /* ── Hardcoded to "community" variant ── */
  const variant: CommunityVariant = "community";
  const group = "community";
  const isCommunity = true;

  /* ── API hooks ── */
  const postsQuery = usePosts(group, isCommunity);
  const createPostMut = useCreatePost(group);
  const submitReplyMut = useSubmitReply(group);
  const toggleLikeMut = useToggleLike(group);
  const rephraseMut = useRephrase();

  /* ── State ── */
  const [composeText, setComposeText] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());
  const [panelState, setPanelState] = React.useState<PanelState>({ view: "default" });
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const [pendingReply, setPendingReply] = React.useState<ComposeSubmitPayload | null>(null);

  /* ── Resolved data ── */
  const posts: (CommunityPost | LinkedPost)[] = postsQuery.data ?? [];

  /* ── Summary query (on-demand) ── */
  const summaryPostId = panelState.view === "summary" ? panelState.postId : null;
  const summaryQuery = usePostSummary(group, summaryPostId, isCommunity && summaryPostId !== null);

  /* ── Derived ── */
  const activePostId =
    panelState.view === "summary" || panelState.view === "replies" || panelState.view === "reply-preview"
      ? panelState.postId
      : null;

  const activePost = activePostId !== null ? posts.find((p) => p.id === activePostId) ?? null : null;

  const linkedSummary = (isCommunity && summaryQuery.data?.summary) || "";
  const linkedAiResponse = (isCommunity && summaryQuery.data?.ai_response) || "";

  /* ── Extract postId and view from URL to sync panelState ── */
  React.useEffect(() => {
    if (pathname === "/community") {
      setPanelState({ view: "default" });
      setPendingReply(null);
    } else if (pathname.match(/^\/community\/post\/(\d+)\/replies$/)) {
      const match = pathname.match(/^\/community\/post\/(\d+)\/replies$/);
      if (match) {
        const postId = parseInt(match[1], 10);
        setPanelState({ view: "replies", postId });
        setPendingReply(null);
      }
    } else if (pathname.match(/^\/community\/post\/(\d+)$/)) {
      const match = pathname.match(/^\/community\/post\/(\d+)$/);
      if (match) {
        const postId = parseInt(match[1], 10);
        setPanelState({ view: "summary", postId });
      }
    }
  }, [pathname]);

  /* ── Handlers ── */

  const openReplies = React.useCallback((postId: number) => {
    router.push(`/community/post/${postId}/replies`);
  }, [router]);

  const openSummary = React.useCallback((postId: number) => {
    router.push(`/community/post/${postId}`);
  }, [router]);

  const closePanel = React.useCallback(() => {
    router.push("/community");
  }, [router]);

  const handlePreviewSend = React.useCallback(
    (payload: ComposeSubmitPayload) => {
      const text = payload.text.trim();
      if (!text) return;

      setPanelState((prev) => {
        if (prev.view !== "replies") return prev;
        setPendingReply(payload);
        setSelectedVersion(1);

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
          rephrasings: generateRephrasings(text),
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
      setLikedPosts((prev) => {
        const next = new Set(prev);
        next.has(postId) ? next.delete(postId) : next.add(postId);
        return next;
      });
      toggleLikeMut.mutate(postId);
    },
    [toggleLikeMut],
  );

  const handleSubmitReply = React.useCallback(() => {
    setPanelState((prev) => {
      if (prev.view !== "reply-preview") return prev;
      const { postId, original, rephrasings } = prev;
      const versions: string[] = [original, ...rephrasings];
      const text = versions[selectedVersion];

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

      createPostMut.mutate({ text: trimmed, tag: "Discussion" });
      setComposeText("");
    },
    [createPostMut],
  );

  /* ── Derive replyPreviewState for context ── */
  const replyPreviewState =
    panelState.view === "reply-preview"
      ? { original: panelState.original, rephrasings: panelState.rephrasings }
      : null;

  /* ── Highlight active post from URL ── */
  const urlPostId = React.useMemo(() => {
    if (pathname.match(/^\/community\/post\/(\d+)/)) {
      const match = pathname.match(/^\/community\/post\/(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    }
    return null;
  }, [pathname]);

  const contextValue = {
    variant,
    group,
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
        {/* LEFT — Compose (pinned) + Posts (scrollable) */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="shrink-0 px-5 pt-2 pb-1 lg:px-6">
            <ComposeArea
              value={composeText}
              onChange={setComposeText}
              onSubmit={handlePost}
              placeholder={undefined}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6">
            <div className="space-y-3 pt-1">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  isActive={urlPostId === p.id}
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

        {/* RIGHT — Route-driven panel */}
        <div className="w-[360px] shrink-0 border-l border-border overflow-hidden flex flex-col">
          {children}
        </div>
      </>
    </FeedProvider>
  );
};

export default FeedLayout;
