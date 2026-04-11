"use client";

/**
 * Replies Panel — Invited Group
 * -----------------------------
 * Shows replies for a post + compose box.
 * Same UI as the main community replies page, reads basePath from FeedContext.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { XIcon, ArrowLeftIcon, SparklesIcon, PaperclipIcon, MicIcon, FileTextIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/core/ui/button";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";
import { ComposeBox } from "@/components/shared/compose-box";
import { useFeedContext } from "@/app/(app)/community/_context/feed-context";
import { getHasNative, getVoiceLangInfo } from "@/components/containers/community/right-panel-shared";
import { usePostReplies } from "@/hooks/api";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";
import { useVoiceLanguages } from "@/data/voice-languages";
import Typography from "@/components/ui/typography";

const GroupRepliesPage = () => {
  const params = useParams<{ postId: string }>();
  const {
    posts,
    group,
    basePath,
    handlePreviewSend,
    handleBackToCompose,
    handleSubmitReply,
    pendingReply,
    selectedVersion,
    setSelectedVersion,
    replyPreviewState,
  } = useFeedContext();

  const { VOICE_LANGUAGES } = useVoiceLanguages();
  const postId = parseInt(params.postId, 10);
  const activePost = posts.find((p) => p.id === postId) ?? null;

  /* ── Fetch replies on-demand for the selected post ── */
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;
  const repliesQuery = usePostReplies(groupId, postId, {}, !!activePost);
  const replies = repliesQuery.data?.items ?? activePost?.replies ?? [];
  const repliesLoading = repliesQuery.isLoading;

  if (!activePost) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Typography variant="caption" color="muted">Post not found</Typography>
      </div>
    );
  }

  const isShowingPreview = replyPreviewState !== null;
  const hasNative = getHasNative(pendingReply);
  const voiceLangInfo = getVoiceLangInfo(pendingReply, VOICE_LANGUAGES);

  const replyCountLabel = (count: number) =>
    `${count} ${count === 1 ? "Reply" : "Replies"}`;

  /* ── REPLIES VIEW ── */
  if (!isShowingPreview) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Pinned header: post quote with close button ── */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="relative rounded-lg bg-muted/50 border border-border/60 px-3 py-2 pr-8">
            <Link
              href={basePath}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-3.5" />
            </Link>
            <Typography variant="caption" color="muted" className="leading-relaxed line-clamp-2">
              <span className="font-semibold text-primary">{activePost.author}</span>{" "}
              {activePost.text}
            </Typography>
          </div>
        </div>

        {/* ── Scrollable reply list ── */}
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <div className="space-y-3 pb-2">
            {repliesLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                <Typography variant="caption" color="muted" as="span" className="ml-2">Loading replies…</Typography>
              </div>
            ) : replies.length === 0 ? (
              <Typography variant="caption" color="muted" className="text-center py-3">
                No replies yet — be the first.
              </Typography>
            ) : (
              replies.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Avatar className="size-6 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-xl rounded-tl-sm bg-muted border border-border/60 px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Typography variant="h5" weight="semibold" as="span" className="!text-[11px]">{r.author}</Typography>
                      <Typography variant="micro" color="muted" as="span">{r.time}</Typography>
                    </div>
                    <Typography variant="caption">{r.text}</Typography>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Pinned compose at bottom ── */}
        <div className="shrink-0 border-t border-border px-4 pt-2 pb-3">
          <ComposeBox
            onSubmit={handlePreviewSend}
            placeholder="Write a helpful reply…"
            submitLabel="Preview & Send"
          />
        </div>
      </div>
    );
  }

  /* ── REPLY PREVIEW VIEW ── */
  if (replyPreviewState && replyPreviewState.rephrasings) {
    const [rap1, rap2] = replyPreviewState.rephrasings;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Pinned header ── */}
        <div className="shrink-0 px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBackToCompose}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <Typography variant="h4" as="span" className="flex-1">Review Your Reply</Typography>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
          >
            <Link href={basePath}>
              <XIcon className="size-4" />
            </Link>
          </Button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 py-3 space-y-3">

            {/* Original text — selectable card */}
            <div>
              <Typography variant="overline" color="muted">
                {hasNative ? "Your reply · English (Translated)" : "Your reply"}
              </Typography>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedVersion(0)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedVersion(0); }}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-left",
                  selectedVersion === 0
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30"
                )}
              >
                <Typography variant="caption" className="whitespace-pre-wrap">{replyPreviewState.original}</Typography>
                {selectedVersion === 0 && (
                  <Typography variant="micro" color="primary" weight="medium" as="span" className="mt-1 block">✓ Selected</Typography>
                )}
              </div>
            </div>

            {/* Attached document */}
            {pendingReply?.attachedDoc && (
              <div>
                <Typography variant="overline" color="muted">
                  <PaperclipIcon className="size-3" /> Attached Document
                </Typography>
                <div className="rounded-lg border border-border overflow-hidden">
                  {pendingReply.attachedDoc.isPdf ? (
                    <div className="flex items-center gap-3 bg-red-50 px-3 py-2.5">
                      <FileTextIcon className="size-7 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Typography variant="h5" as="p" truncate={true}>{pendingReply.attachedDoc.filename}</Typography>
                        <Typography variant="micro" color="muted">{pendingReply.attachedDoc.docType}</Typography>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-muted/30 px-3 py-2">
                      <Image
                        src={pendingReply.attachedDoc.previewUrl}
                        alt=""
                        className="size-12 rounded object-cover shrink-0"
                        width={48}
                        height={48}
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <Typography variant="h5" as="p" truncate={true}>{pendingReply.attachedDoc.filename}</Typography>
                        <Typography variant="micro" color="muted">{pendingReply.attachedDoc.docType}</Typography>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Native voice recording */}
            {hasNative && pendingReply?.voiceRecording && (
              <div>
                <Typography variant="overline" color="muted">
                  <MicIcon className="size-3" />
                  {voiceLangInfo?.native ?? pendingReply.voiceRecording.lang} · Recorded
                </Typography>
                <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {voiceLangInfo?.label ?? pendingReply.voiceRecording.lang}
                    </span>
                    <Typography variant="micro" color="muted" as="span">→ Translated to English above</Typography>
                  </div>
                  <Typography variant="caption" className="text-foreground/80 whitespace-pre-wrap">
                    {pendingReply.voiceRecording.original}
                  </Typography>
                </div>
              </div>
            )}

            {/* AI Rephrasings — selectable cards */}
            <div>
              <Typography variant="overline" color="muted">
                <SparklesIcon className="size-3 text-violet-500" /> AI Rephrasings
              </Typography>
              <div className="space-y-2">
                {[rap1, rap2].map((r, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedVersion((i + 1) as 1 | 2)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedVersion((i + 1) as 1 | 2); }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-left",
                      selectedVersion === i + 1
                        ? "border-violet-400 bg-violet-50/50"
                        : "border-border bg-background hover:border-violet-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Typography variant="micro" weight="medium" as="span" className="text-violet-600">Version {i + 1}</Typography>
                      {selectedVersion === i + 1 && (
                        <Typography variant="micro" weight="medium" as="span" className="text-violet-600">✓ Selected</Typography>
                      )}
                    </div>
                    <Typography variant="caption" className="whitespace-pre-wrap">{r}</Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Pinned submit button ── */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          <Button size="sm" className="w-full" onClick={handleSubmitReply}>
            Submit Reply
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default GroupRepliesPage;
