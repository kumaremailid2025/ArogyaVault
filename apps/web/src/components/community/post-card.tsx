"use client";

import * as React from "react";
import {
  ThumbsUpIcon, MessageSquareIcon, SparklesIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CommunityPost, LinkedPost } from "@/models/community";

interface PostCardProps {
  post: CommunityPost | LinkedPost;
  isActive: boolean;
  isLiked: boolean;
  onLike: (postId: number) => void;
  onReplies: (postId: number) => void;
  onSummary: (postId: number) => void;
}

export const PostCard = React.memo(
  ({ post, isActive, isLiked, onLike, onReplies, onSummary }: PostCardProps) => {
    const hasLocation = "location" in post && post.location;

    return (
      <div
        onClick={() => onReplies(post.id)}
        className={cn(
          "rounded-xl border bg-background px-4 py-3 cursor-pointer transition-colors",
          isActive
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/20 hover:bg-muted/30"
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className="size-7 shrink-0 mt-0.5">
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {post.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {/* Row 1 — Author info (left) + Actions (right) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className="text-sm font-semibold">{post.author}</span>
                <span className="text-xs text-muted-foreground">
                  {hasLocation ? `${(post as CommunityPost).location} · ` : ""}{post.time}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-primary border-primary/30"
                >
                  {post.tag}
                </Badge>
              </div>

              {/* Actions — top right with tooltips */}
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.stopPropagation();
                        onLike(post.id);
                      }}
                      className={cn(
                        "h-7 px-1.5 flex items-center gap-1 text-xs transition-colors",
                        isLiked
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <ThumbsUpIcon className={cn("size-3", isLiked && "fill-current")} />
                      {post.likes > 0 && post.likes}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{isLiked ? "Unlike" : "Like"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplies(post.id);
                      }}
                      className="h-7 px-1.5 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      <MessageSquareIcon className="size-3" />
                      {post.replyCount}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {post.replyCount === 1 ? "1 reply" : `${post.replyCount} replies`}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.stopPropagation();
                        onSummary(post.id);
                      }}
                      className="h-7 px-1.5 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-violet-600"
                    >
                      <SparklesIcon className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">AI Summary</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Row 2 — Post text */}
            <p className="text-sm mt-1 leading-relaxed">{post.text}</p>
          </div>
        </div>
      </div>
    );
  }
);

PostCard.displayName = "PostCard";
