"use client";

/**
 * Tag Page — /tags/[tag]
 * ----------------------
 * Shows every post across all communities and groups that carries the
 * given tag.  The [tag] param is a URL slug (e.g. "lab-report").
 *
 * Posts are populated from the tags store, which is fed by
 * feed-layout-content whenever posts mount.  If the store is empty
 * (direct navigation), we also seed it from the static mock data.
 */

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  TagIcon, ArrowLeftIcon, MessageSquareIcon, ThumbsUpIcon, StarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { useTagsStore, slugToTag, useFavoritesStore, recordActivity } from "@/stores";
import { TypeCode, ActionCode } from "@/models/type-codes";
import type { CommunityPost } from "@/models/community";

/* Static data to seed the store if user navigates directly */
import { COMMUNITY_POSTS } from "@/data/community-data";
import { LINKED_MEMBER_DATA } from "@/data/linked-member-data";

const TagPage = () => {
  const { tag: tagSlug } = useParams<{ tag: string }>();
  const { slugMap, getPostsBySlug, registerPosts } = useTagsStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  /* Seed store from mock data on first render if empty */
  React.useEffect(() => {
    const allPosts = [
      ...COMMUNITY_POSTS,
      ...Object.values(LINKED_MEMBER_DATA).flatMap((m) => m.posts),
    ];
    registerPosts(allPosts);
  }, [registerPosts]);

  const tagLabel = slugToTag(tagSlug, slugMap);
  const posts = getPostsBySlug(tagSlug);

  /* Record activity */
  React.useEffect(() => {
    if (tagLabel) {
      recordActivity({
        typeCode: TypeCode.TAG,
        actionCode: ActionCode.TAG_VIEW,
        entityId: tagSlug,
        description: `Viewed tag "${tagLabel}"`,
      });
    }
  }, [tagSlug, tagLabel]);

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
          <TagIcon className="size-4 text-primary" />
          <h1 className="text-base font-semibold">{tagLabel}</h1>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </Badge>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Post list — full width (tags nav is in the left sidebar) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TagIcon className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No posts with this tag</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                Posts tagged &ldquo;{tagLabel}&rdquo; will appear here once they are created.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/community">Back to Community</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                const hasLocation = "location" in post && (post as CommunityPost).location;
                const isFav = favoriteIds.has(post.id);

                return (
                  <div
                    key={post.id}
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
                            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                              {post.tag}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(post)}
                                  className={`h-7 px-1.5 text-xs transition-colors ${
                                    isFav ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
                                  }`}
                                >
                                  <StarIcon className={`size-3 ${isFav ? "fill-current" : ""}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                {isFav ? "Remove from favorites" : "Add to favorites"}
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ThumbsUpIcon className="size-3" /> {post.likes}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                              <MessageSquareIcon className="size-3" /> {post.replyCount}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed">{post.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TagPage;
