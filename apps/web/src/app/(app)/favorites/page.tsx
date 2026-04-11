"use client";

/**
 * Favorites Page
 * --------------
 * Shows all posts the user has favorited via the star icon.
 * Data comes from the in-memory Zustand favorites store.
 * Each entry carries a UUID + TypeCode for backend readiness.
 */

import Link from "next/link";
import { StarIcon, ArrowLeftIcon, MessageSquareIcon, ThumbsUpIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/core/ui/tooltip";
import { PageBanner } from "@/components/shared/page-banner";
import { useFavoritesStore } from "@/stores";
import { TYPE_CODE_LABELS } from "@/models/type-codes";
import type { CommunityPost } from "@/models/community";
import Typography from "@/components/ui/typography";

const FavoritesPage = () => {
  const { getFavorites, toggleFavorite } = useFavoritesStore();
  const entries = getFavorites();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Banner */}
      <PageBanner
        icon={
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <StarIcon className="size-4" />
          </div>
        }
        title="Favorites"
        badges={[
          { label: `${entries.length} ${entries.length === 1 ? "post" : "posts"}`, icon: <StarIcon className="size-2.5" /> },
        ]}
        description={
          <Typography variant="body" color="inverse" className="opacity-80 leading-relaxed">
            Posts you have starred for quick access. Click the star icon on any community post to save it here.
          </Typography>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <StarIcon className="size-10 text-muted-foreground/30 mb-3" />
            <Typography variant="body" weight="medium" color="muted">No favorites yet</Typography>
            <Typography variant="caption" color="muted" className="/70 mt-1 max-w-xs">
              Click the star icon on any community post to save it here for quick access.
            </Typography>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/community">Back to Community</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const post = entry.post;
              const hasLocation = "location" in post && (post as CommunityPost).location;

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
                          <Typography variant="h4" as="span">{post.author}</Typography>
                          <Typography variant="caption" color="muted" as="span">
                            {hasLocation ? `${(post as CommunityPost).location} · ` : ""}{post.time}
                          </Typography>
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            {post.tag}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                            {TYPE_CODE_LABELS[entry.typeCode]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Typography variant="caption" color="muted" as="span" className="flex items-center gap-1">
                            <ThumbsUpIcon className="size-3" /> {post.likes}
                          </Typography>
                          <Typography variant="caption" color="muted" as="span" className="flex items-center gap-1 ml-1">
                            <MessageSquareIcon className="size-3" /> {post.replyCount}
                          </Typography>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(post)}
                                className="h-7 px-1.5 text-amber-500 hover:text-amber-600"
                              >
                                <StarIcon className="size-3 fill-current" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Remove from favorites</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <Typography variant="body" className="mt-1">{post.text}</Typography>
                      <Typography variant="micro" color="muted">
                        Favorited {new Date(entry.favoritedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Typography>
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

export default FavoritesPage;
