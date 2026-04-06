"use client";

/**
 * Replies Panel
 * -------------
 * Shows replies for a post + compose box.
 * When compose submits, shows reply-preview inline.
 * Derived from FeedRightPanel's "replies" and "reply-preview" views.
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { XIcon, ArrowLeftIcon, SparklesIcon, PaperclipIcon, MicIcon, FileTextIcon, ZapIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";
import { ComposeBox } from "@/components/shared/compose-box";
import { useFeedContext } from "@/app/(app)/community/_context/feed-context";
import { getHasNative, getVoiceLangInfo } from "@/components/containers/community/right-panel-shared";

const RepliesPage = () => {
  const params = useParams<{ postId: string }>();
  const {
    posts,
    handlePreviewSend,
    handleBackToCompose,
    handleSubmitReply,
    pendingReply,
    selectedVersion,
    setSelectedVersion,
    replyPreviewState,
  } = useFeedContext();

  const postId = parseInt(params.postId, 10);
  const activePost = posts.find((p) => p.id === postId) ?? null;

  if (!activePost) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const isShowingPreview = replyPreviewState !== null;
  const hasNative = getHasNative(pendingReply);
  const voiceLangInfo = getVoiceLangInfo(pendingReply);

  const replyCountLabel = (count: number) =>
    `${count} ${count === 1 ? "Reply" : "Replies"}`;

  /* ── REPLIES VIEW ── */
  if (!isShowingPreview) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Pinned header ── */}
        <div className="shrink-0 px-4 pt-4 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{replyCountLabel(activePost.replyCount)}</span>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link href="/community">
                <XIcon className="size-4" />
              </Link>
            </Button>
          </div>
          {/* Compact post quote */}
          <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              <span className="font-semibold text-primary">{activePost.author}</span>{" "}
              {activePost.text}
            </p>
          </div>
        </div>

        {/* ── Scrollable reply list ── */}
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <div className="space-y-3 pb-2">
            {activePost.replies.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                No replies yet — be the first.
              </p>
            ) : (
              activePost.replies.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Avatar className="size-6 shrink-0 mt-0.5">
                    <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                      {r.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-xl rounded-tl-sm bg-muted border border-border/60 px-3 py-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold">{r.author}</span>
                      <span className="text-[10px] text-muted-foreground">{r.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{r.text}</p>
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
          <span className="text-sm font-semibold flex-1">Review Your Reply</span>
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
          >
            <Link href="/community">
              <XIcon className="size-4" />
            </Link>
          </Button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-4 py-3 space-y-3">

            {/* Original text — selectable card */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {hasNative ? "Your reply · English (Translated)" : "Your reply"}
              </p>
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
                <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{replyPreviewState.original}</p>
                {selectedVersion === 0 && (
                  <span className="text-[10px] text-primary font-medium mt-1 block">✓ Selected</span>
                )}
              </div>
            </div>

            {/* Attached document */}
            {pendingReply?.attachedDoc && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <PaperclipIcon className="size-3" /> Attached Document
                </p>
                <div className="rounded-lg border border-border overflow-hidden">
                  {pendingReply.attachedDoc.isPdf ? (
                    <div className="flex items-center gap-3 bg-red-50 px-3 py-2.5">
                      <FileTextIcon className="size-7 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{pendingReply.attachedDoc.filename}</p>
                        <p className="text-[10px] text-muted-foreground">{pendingReply.attachedDoc.docType}</p>
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
                        <p className="text-xs font-semibold truncate">{pendingReply.attachedDoc.filename}</p>
                        <p className="text-[10px] text-muted-foreground">{pendingReply.attachedDoc.docType}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Native voice recording */}
            {hasNative && pendingReply?.voiceRecording && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MicIcon className="size-3" />
                  {voiceLangInfo?.native ?? pendingReply.voiceRecording.lang} · Recorded
                </p>
                <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {voiceLangInfo?.label ?? pendingReply.voiceRecording.lang}
                    </span>
                    <span className="text-[10px] text-muted-foreground">→ Translated to English above</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {pendingReply.voiceRecording.original}
                  </p>
                </div>
              </div>
            )}

            {/* AI Rephrasings — selectable cards */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <SparklesIcon className="size-3 text-violet-500" /> AI Rephrasings
              </p>
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
                      <span className="text-[10px] font-medium text-violet-600">Version {i + 1}</span>
                      {selectedVersion === i + 1 && (
                        <span className="text-[10px] text-violet-600 font-medium">✓ Selected</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{r}</p>
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

export default RepliesPage;
