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
import { PageBanner } from "@/components/shared/page-banner";
import { useTagsStore, slugToTag, useFavoritesStore, recordActivity } from "@/stores";
import { TypeCode, ActionCode } from "@/models/type-codes";
import type { CommunityPost } from "@/models/community";

/* Static data to seed the store if user navigates directly */
import { useCommunity } from "@/data/community-data";
import { useLinkedMembers } from "@/data/linked-member-data";
import Typography from "@/components/ui/typography";

const TagPage = () => {
  const { tag: tagSlug } = useParams<{ tag: string }>();
  const { slugMap, getPostsBySlug, registerPosts } = useTagsStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { COMMUNITY_POSTS } = useCommunity();
  const { LINKED_MEMBER_DATA } = useLinkedMembers();

  /* Seed store from mock data on first render if empty */
  React.useEffect(() => {
    const allPosts = [
      ...COMMUNITY_POSTS,
      ...Object.values(LINKED_MEMBER_DATA).flatMap((m) => m.posts),
    ];
    registerPosts(allPosts);
  }, [registerPosts, COMMUNITY_POSTS, LINKED_MEMBER_DATA]);

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
      {/* Banner */}
      <PageBanner
        icon={
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <TagIcon className="size-4" />
          </div>
        }
        title={tagLabel}
        badges={[
          { label: `${posts.length} ${posts.length === 1 ? "post" : "posts"}`, icon: <TagIcon className="size-2.5" /> },
        ]}
        description={
          <Typography variant="body" color="inverse" className="opacity-80 leading-relaxed">
            All posts tagged with &ldquo;{tagLabel}&rdquo; across the community and linked groups.
          </Typography>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Post list — full width (tags nav is in the left sidebar) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TagIcon className="size-10 text-muted-foreground/30 mb-3" />
              <Typography variant="body" weight="medium" color="muted">No posts with this tag</Typography>
              <Typography variant="caption" color="muted" className="/70 mt-1 max-w-xs">
                Posts tagged &ldquo;{tagLabel}&rdquo; will appear here once they are created.
              </Typography>
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
                            <Typography variant="h4" as="span">{post.author}</Typography>
                            <Typography variant="caption" color="muted" as="span">
                              {hasLocation ? `${(post as CommunityPost).location} · ` : ""}{post.time}
                            </Typography>
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
                            <Typography variant="caption" color="muted" as="span" className="flex items-center gap-1">
                              <ThumbsUpIcon className="size-3" /> {post.likes}
                            </Typography>
                            <Typography variant="caption" color="muted" as="span" className="flex items-center gap-1 ml-1">
                              <MessageSquareIcon className="size-3" /> {post.replyCount}
                            </Typography>
                          </div>
                        </div>
                        <Typography variant="body" className="mt-1">{post.text}</Typography>
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
