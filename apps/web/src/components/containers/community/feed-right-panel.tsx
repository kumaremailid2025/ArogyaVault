"use client";

/**
 * Right panel for the feed tab with default, summary, replies, and reply-preview views.
 *
 * @packageDocumentation
 * @category Containers
 *
 * @remarks
 * Handles default (analytics/connection-info), summary (AI summary with replies),
 * replies (thread view with compose), and reply-preview (AI rephrasing options) views
 * for the feed tab. Component is memoized to prevent unnecessary re-renders from
 * parent state changes.
 */

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SparklesIcon, XIcon, ArrowLeftIcon, MessageSquareIcon,
  ZapIcon, FlameIcon, PaperclipIcon, MicIcon, FileTextIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";

import { ComposeBox } from "@/components/shared/compose-box";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import { useCommunity } from "@/data/community-data";
import { useVoiceLanguages } from "@/data/voice-languages";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { CommunityVariant, PanelState } from "./types";
import { getHasNative, getVoiceLangInfo } from "./right-panel-shared";
import Typography from "@/components/ui/typography";

/* Feed panel props */

/**
 * Props for {@link FeedRightPanel}.
 *
 * @category Types
 */
interface FeedRightPanelProps {
  /** Community variant (own or invited). */
  variant: CommunityVariant;
  /** Current panel state (which view to render). */
  panelState: PanelState;
  /** The currently active post (null if no post selected). */
  activePost: (CommunityPost | LinkedPost) | null;
  /** All posts in the feed. */
  posts: (CommunityPost | LinkedPost)[];
  /** Pending reply being composed and previewed. */
  pendingReply: ComposeSubmitPayload | null;
  /** Currently selected rephrase version (0=original, 1-2=AI rephrasings). */
  selectedVersion: 0 | 1 | 2;
  /** Handler to close the panel (revert to default view). */
  onClosePanel: () => void;
  /** Handler to open replies for a post. */
  onOpenReplies: (postId: number) => void;
  /** Handler to preview and show rephrasing options for a reply. */
  onPreviewSend: (payload: ComposeSubmitPayload) => void;
  /** Handler to go back from reply preview to compose. */
  onBackToCompose: () => void;
  /** Handler to set the selected rephrase version. */
  onSetSelectedVersion: (version: 0 | 1 | 2) => void;
  /** Handler to submit the reply. */
  onSubmitReply: () => void;
  /** Optional AI summary text (invited variant). */
  linkedSummary?: string;
  /** Optional AI response text (invited variant). */
  linkedAiResponse?: string;
  /** Member slug used in "Manage Group" link (invited variant only). */
  memberId?: string;
}

/**
 * Render the right panel for the feed tab.
 *
 * @param props - Component props.
 * @returns The rendered feed right panel.
 *
 * @category Containers
 */
export const FeedRightPanel = React.memo(
  ({
    variant,
    panelState,
    activePost,
    posts,
    pendingReply,
    selectedVersion,
    onClosePanel,
    onOpenReplies,
    onPreviewSend,
    onBackToCompose,
    onSetSelectedVersion,
    onSubmitReply,
    linkedSummary = "",
    linkedAiResponse = "",
    memberId = "",
  }: FeedRightPanelProps) => {
    const { TRENDING_TOPICS, POST_SUMMARIES, POST_AI_RESPONSES } = useCommunity();
    const { VOICE_LANGUAGES } = useVoiceLanguages();
    const hasNative = getHasNative(pendingReply);
    const voiceLangInfo = getVoiceLangInfo(pendingReply, VOICE_LANGUAGES);

    /* ── Helpers ── */
    const postSubtitle = activePost
      ? "location" in activePost && activePost.location
        ? `${activePost.author} · ${(activePost as CommunityPost).location}`
        : `${activePost.author} · ${activePost.time}`
      : "";

    const summaryText =
      variant === "community" && activePost
        ? POST_SUMMARIES[activePost.id]
        : linkedSummary;

    const aiPerspective =
      variant === "community" && activePost
        ? POST_AI_RESPONSES[activePost.id]
        : linkedAiResponse;

    const replyCountLabel = (count: number) =>
      `${count} ${count === 1 ? "Reply" : "Replies"}`;

    return (
      <div className="w-[360px] shrink-0 flex flex-col overflow-hidden">

        {/* ══════════════ DEFAULT — Analytics or Connection Info ══════════════ */}
        {panelState.view === "default" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {variant === "community" && (
              <>
                {/* Community Pulse */}
                <div>
                  <Typography variant="overline" color="muted">
                    <ZapIcon className="size-3 text-primary" /> Community Pulse
                  </Typography>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Members", value: "12,847" },
                      { label: "Today", value: "23 posts" },
                      { label: "Active now", value: "156" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg border border-border bg-background p-2 text-center"
                      >
                        <Typography variant="body" weight="bold" color="primary">{s.value}</Typography>
                        <Typography variant="micro" color="muted">{s.label}</Typography>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Topics */}
                <div>
                  <Typography variant="overline" color="muted">
                    <FlameIcon className="size-3 text-orange-500" /> Trending Topics
                  </Typography>
                  <div className="space-y-2">
                    {TRENDING_TOPICS.map((t) => (
                      <div key={t.topic}>
                        <div className="flex items-center justify-between mb-0.5">
                          <Typography variant="caption" as="span" truncate={true} className="flex-1">{t.topic}</Typography>
                          <Typography variant="micro" color="muted" as="span" className="ml-1 shrink-0">
                            {t.count}
                          </Typography>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${t.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help CTA */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                  <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                  <Typography variant="caption" color="muted" className="mb-2 leading-snug">
                    Click any post to read replies or tap{" "}
                    <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI
                    Summary for a quick digest.
                  </Typography>
                  <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
                    Ask the Community
                  </Button>
                </div>
              </>
            )}

            {variant === "invited" && (
              <>
                {/* Connection Details */}
                <Typography variant="overline" color="muted">
                  Connection Details
                </Typography>
                <div className="space-y-2">
                  {[
                    { label: "Relation", value: "Friend" },
                    { label: "Direction", value: "Bidirectional" },
                    { label: "Access", value: "View feed & reply" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-lg border border-border bg-background px-3 py-2.5"
                    >
                      <Typography variant="overline" color="muted">
                        {row.label}
                      </Typography>
                      <Typography variant="caption">{row.value}</Typography>
                    </div>
                  ))}
                </div>

                {/* Shared Feed stats */}
                <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                  <Typography variant="overline" color="muted">
                    Shared Feed
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-primary/5 p-2 text-center">
                      <Typography variant="body" weight="bold" color="primary">{posts.length}</Typography>
                      <Typography variant="micro" color="muted">posts</Typography>
                    </div>
                    <div className="rounded-md bg-primary/5 p-2 text-center">
                      <Typography variant="body" weight="bold" color="primary">
                        {posts.reduce((s, p) => s + p.replyCount, 0)}
                      </Typography>
                      <Typography variant="micro" color="muted">replies</Typography>
                    </div>
                  </div>
                </div>

                {/* Help CTA */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                  <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                  <Typography variant="caption" color="muted" className="mb-2 leading-snug">
                    Click any post to view replies, or tap{" "}
                    <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" />{" "}
                    AI Summary for a quick digest.
                  </Typography>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="text-xs border-primary/30 text-primary w-full"
                  >
                    <Link href={`/groups?g=${memberId}`} className="flex items-center gap-1.5">
                      Manage Group <ArrowRightIcon className="size-3" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════ AI SUMMARY ══════════════ */}
        {panelState.view === "summary" && activePost && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <SparklesIcon className="size-4 text-violet-600" />
                <Typography variant="h4" as="span">AI Summary</Typography>
              </div>
              <Button
                onClick={onClosePanel}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
              <Typography variant="overline" color="primary">{postSubtitle}</Typography>
              <Typography variant="caption" color="muted">{activePost.text}</Typography>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-violet-100">
                  <SparklesIcon className="size-3 text-violet-600" />
                </div>
                <span className="text-[11px] font-semibold text-violet-700">ArogyaAI Summary</span>
                <Badge className="bg-violet-100 text-violet-700 border-0 text-[9px] ml-auto">
                  {activePost.replyCount} {activePost.replyCount === 1 ? "reply" : "replies"} analysed
                </Badge>
              </div>
              <Typography variant="caption" className="text-foreground/80">{summaryText}</Typography>
            </div>
            {/* AI perspective — only shown for invited variant when available */}
            {variant === "invited" && linkedAiResponse && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                    <ZapIcon className="size-3 text-amber-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">
                    ArogyaAI&apos;s perspective
                  </span>
                </div>
                <Typography variant="caption" className="text-foreground/80">{linkedAiResponse}</Typography>
              </div>
            )}
            <Button
              suppressHydrationWarning
              onClick={() => onOpenReplies(activePost.id)}
              className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquareIcon className="size-3.5" /> View all {activePost.replyCount}{" "}
              {activePost.replyCount === 1 ? "reply" : "replies"}
            </Button>
          </div>
        )}

        {/* ══════════════ REPLIES + COMPOSE ══════════════ */}
        {panelState.view === "replies" && activePost && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Pinned header ── */}
            <div className="shrink-0 px-4 pt-4 pb-2 space-y-2">
              <div className="flex items-center justify-between">
                <Typography variant="h4" as="span">{replyCountLabel(activePost.replyCount)}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClosePanel}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              {/* Compact post quote */}
              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
                <Typography variant="caption" color="muted" className="leading-relaxed line-clamp-2">
                  <span className="font-semibold text-primary">{activePost.author}</span>{" "}
                  {activePost.text}
                </Typography>
              </div>
            </div>

            {/* ── Scrollable reply list ── */}
            <div className="flex-1 overflow-y-auto px-4 min-h-0">
              <div className="space-y-3 pb-2">
                {(activePost.replies ?? []).length === 0 ? (
                  <Typography variant="caption" color="muted" className="text-center py-3">
                    No replies yet — be the first.
                  </Typography>
                ) : (
                  (activePost.replies ?? []).map((r, i) => (
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
                onSubmit={onPreviewSend}
                placeholder="Write a helpful reply…"
                submitLabel="Preview & Send"
              />
            </div>
          </div>
        )}

        {/* ══════════════ REPLY PREVIEW ══════════════ */}
        {panelState.view === "reply-preview" && activePost && panelState.original && panelState.rephrasings && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ── Pinned header ── */}
            <div className="shrink-0 px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border">
              <Button
                variant="ghost"
                size="icon-sm"
                suppressHydrationWarning
                onClick={onBackToCompose}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <Typography variant="h4" as="span" className="flex-1">Review Your Reply</Typography>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClosePanel}
              >
                <XIcon className="size-4" />
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
                    onClick={() => onSetSelectedVersion(0)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSetSelectedVersion(0); }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-left",
                      selectedVersion === 0
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    <Typography variant="caption" className="whitespace-pre-wrap">{panelState.original}</Typography>
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
                    {panelState.rephrasings.map((r, i) => (
                      <div
                        key={i}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSetSelectedVersion((i + 1) as 1 | 2)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSetSelectedVersion((i + 1) as 1 | 2); }}
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
                        <Typography variant="caption" className="whitespace-pre-wrap">{r}</Typography>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI perspective */}
                {aiPerspective && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                        <ZapIcon className="size-3 text-amber-600" />
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700">
                        ArogyaAI&apos;s perspective
                      </span>
                    </div>
                    <Typography variant="caption" className="text-foreground/80 whitespace-pre-wrap">{aiPerspective}</Typography>
                  </div>
                )}
              </div>
            </div>

            {/* ── Pinned submit button ── */}
            <div className="shrink-0 border-t border-border px-4 py-3">
              <Button size="sm" className="w-full" onClick={onSubmitReply}>
                Submit Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

FeedRightPanel.displayName = "FeedRightPanel";
