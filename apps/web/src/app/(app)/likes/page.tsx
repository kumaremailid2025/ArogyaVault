"use client";

/**
 * Likes Page — /likes
 * --------------------
 * Shows every post the user has liked.
 */

import Link from "next/link";
import {
  ThumbsUpIcon, ArrowLeftIcon, MessageSquareIcon, StarIcon,
} from "lucide-react";
import { PageBanner } from "@/components/shared/page-banner";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { useLikesStore, useFavoritesStore, tagToSlug } from "@/stores";
import type { CommunityPost } from "@/models/community";

const LikesPage = () => {
  const { getLikes, toggleLike } = useLikesStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const entries = getLikes();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Banner */}
      <PageBanner
        icon={
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <ThumbsUpIcon className="size-4" />
          </div>
        }
        title="Liked Posts"
        badges={[
          { label: `${entries.length} ${entries.length === 1 ? "post" : "posts"}`, icon: <ThumbsUpIcon className="size-2.5" /> },
        ]}
        description={
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            All the posts you have liked across the community. Like a post to save it here.
          </p>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ThumbsUpIcon className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No liked posts yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
              Like posts in the community and they will appear here.
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

              return (
                <div
                  key={entry.uuid}
                  className="rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:border-primary/20 hover:bg-muted/30"
                >
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
                                className="h-7 px-1.5 text-xs text-primary font-medium"
                              >
                                <ThumbsUpIcon className="size-3 fill-current" />
                                {post.likes > 0 && <span className="ml-1">{post.likes}</span>}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Unlike</TooltipContent>
                          </Tooltip>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                            <MessageSquareIcon className="size-3" /> {post.replyCount}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mt-1 leading-relaxed">{post.text}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        Liked {new Date(entry.likedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
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

export default LikesPage;
