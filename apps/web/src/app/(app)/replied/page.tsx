"use client";

/**
 * Replied Page — /replied
 * ------------------------
 * Shows every post the user has replied to, along with their reply text.
 */

import Link from "next/link";
import {
  MessageSquareIcon, ArrowLeftIcon, ThumbsUpIcon, StarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { useRepliedStore, useFavoritesStore, useLikesStore, tagToSlug } from "@/stores";
import type { CommunityPost } from "@/models/community";

const RepliedPage = () => {
  const { getReplies } = useRepliedStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { likedIds, toggleLike } = useLikesStore();
  const entries = getReplies();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-4 border-b border-border lg:px-6">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/community">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="size-4 text-primary" />
          <h1 className="text-base font-semibold">My Replies</h1>
        </div>
        <span className="text-xs text-muted-foreground">
          {entries.length} {entries.length === 1 ? "post" : "posts"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquareIcon className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No replies yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
              Reply to posts in the community and they will appear here.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/community">Back to Community</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const post = entry.post;
              const hasLocation = "location" in post && (post as CommunityPost).location;
              const isFav = favoriteIds.has(post.id);
              const isLiked = likedIds.has(post.id);

              return (
                <div
                  key={entry.uuid}
                  className="rounded-xl border border-border bg-background overflow-hidden transition-colors hover:border-primary/20"
                >
                  {/* Original post */}
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-7 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                          {post.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="text-sm font-semibold">{post.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {hasLocation ? `${(post as CommunityPost).location} · ` : ""}{post.time}
                            </span>
                            <Link href={`/tags/${tagToSlug(post.tag)}`}>
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 hover:bg-primary/10 cursor-pointer transition-colors">
                                {post.tag}
                              </Badge>
                            </Link>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(post)}
                                  className={`h-7 px-1.5 text-xs transition-colors ${isFav ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
                                >
                                  <StarIcon className={`size-3 ${isFav ? "fill-current" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">{isFav ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleLike(post)}
                                  className={`h-7 px-1.5 text-xs transition-colors ${isLiked ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"}`}
                                >
                                  <ThumbsUpIcon className={`size-3 ${isLiked ? "fill-current" : ""}`} />
                                  {post.likes > 0 && <span className="ml-1">{post.likes}</span>}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">{isLiked ? "Unlike" : "Like"}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed">{post.text}</p>
                      </div>
                    </div>
                  </div>

                  {/* Your reply */}
                  <div className="bg-muted/40 border-t border-border/60 px-4 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <Avatar className="size-5 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[8px] font-semibold bg-primary text-primary-foreground">
                          KU
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">Your reply</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(entry.repliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed text-muted-foreground">{entry.replyText}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepliedPage;
