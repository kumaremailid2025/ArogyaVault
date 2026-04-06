"use client";

/**
 * Post Summary Panel — Invited Group
 * -----------------------------------
 * Re-exports the shared PostSummaryContent from the main community panel.
 * Context (FeedContext) provides the correct basePath for dynamic links.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { SparklesIcon, XIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { useFeedContext } from "@/app/(app)/community/_context/feed-context";
import { POST_SUMMARIES, POST_AI_RESPONSES } from "@/data/community-data";

const GroupPostSummaryPage = () => {
  const params = useParams<{ postId: string }>();
  const { posts, basePath } = useFeedContext();

  const postId = parseInt(params.postId, 10);
  const activePost = posts.find((p) => p.id === postId) ?? null;

  if (!activePost) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const postSubtitle = "location" in activePost && activePost.location
    ? `${activePost.author} · ${activePost.location}`
    : `${activePost.author} · ${activePost.time}`;

  const summaryText = POST_SUMMARIES[activePost.id] || "";
  const aiPerspective = POST_AI_RESPONSES[activePost.id] || "";

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Post quote with close button in top-right corner */}
      <div className="relative rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5 pr-8">
        <Link
          href={basePath}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <XIcon className="size-3.5" />
        </Link>
        <p className="text-[11px] font-semibold text-primary mb-1">{postSubtitle}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{activePost.text}</p>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex size-5 items-center justify-center rounded-full bg-violet-100">
            <SparklesIcon className="size-3 text-violet-600" />
          </div>
          <span className="text-[11px] font-semibold text-violet-700">ArogyaAI Summary</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground/80">{summaryText}</p>
      </div>

      <Button
        asChild
        className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
      >
        <Link href={`${basePath}/post/${postId}/replies`}>
          <MessageSquareIcon className="size-3.5" /> View all {activePost.replyCount}{" "}
          {activePost.replyCount === 1 ? "reply" : "replies"}
        </Link>
      </Button>
    </div>
  );
};

export default GroupPostSummaryPage;
