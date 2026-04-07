"use client";

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
import { TRENDING_TOPICS, POST_SUMMARIES, POST_AI_RESPONSES } from "@/data/community-data";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { CommunityVariant, PanelState } from "./types";
import { getHasNative, getVoiceLangInfo } from "./right-panel-shared";

/* ═══════════════════════════════════════════════════════════════════
   FEED RIGHT PANEL — handles: default (analytics / connection-info),
   summary, replies, reply-preview views for the feed tab.
═══════════════════════════════════════════════════════════════════ */

interface FeedRightPanelProps {
  variant: CommunityVariant;
  panelState: PanelState;
  activePost: (CommunityPost | LinkedPost) | null;
  posts: (CommunityPost | LinkedPost)[];
  pendingReply: ComposeSubmitPayload | null;
  selectedVersion: 0 | 1 | 2;
  onClosePanel: () => void;
  onOpenReplies: (postId: number) => void;
  onPreviewSend: (payload: ComposeSubmitPayload) => void;
  onBackToCompose: () => void;
  onSetSelectedVersion: (version: 0 | 1 | 2) => void;
  onSubmitReply: () => void;
  linkedSummary?: string;
  linkedAiResponse?: string;
  /** For invited variant: member slug used in "Manage Group" link */
  memberId?: string;
}

/* ── Component ──────────────────────────────────────────────────── */

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
    const hasNative = getHasNative(pendingReply);
    const voiceLangInfo = getVoiceLangInfo(pendingReply);

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
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ZapIcon className="size-3 text-primary" /> Community Pulse
                  </p>
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
                        <p className="text-sm font-bold text-primary leading-tight">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trending Topics */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FlameIcon className="size-3 text-orange-500" /> Trending Topics
                  </p>
                  <div className="space-y-2">
                    {TRENDING_TOPICS.map((t) => (
                      <div key={t.topic}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs truncate flex-1">{t.topic}</span>
                          <span className="text-[10px] text-muted-foreground ml-1 shrink-0">
                            {t.count}
                          </span>
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
                  <p className="text-xs text-muted-foreground mb-2 leading-snug">
                    Click any post to read replies or tap{" "}
                    <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI
                    Summary for a quick digest.
                  </p>
                  <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
                    Ask the Community
                  </Button>
                </div>
              </>
            )}

            {variant === "invited" && (
              <>
                {/* Connection Details */}
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Connection Details
                </p>
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
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                        {row.label}
                      </p>
                      <p className="text-xs leading-relaxed">{row.value}</p>
                    </div>
                  ))}
                </div>

                {/* Shared Feed stats */}
                <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Shared Feed
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-primary/5 p-2 text-center">
                      <p className="text-sm font-bold text-primary">{posts.length}</p>
                      <p className="text-[10px] text-muted-foreground">posts</p>
                    </div>
                    <div className="rounded-md bg-primary/5 p-2 text-center">
                      <p className="text-sm font-bold text-primary">
                        {posts.reduce((s, p) => s + p.replyCount, 0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">replies</p>
                    </div>
                  </div>
                </div>

                {/* Help CTA */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                  <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground mb-2 leading-snug">
                    Click any post to view replies, or tap{" "}
                    <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" />{" "}
                    AI Summary for a quick digest.
                  </p>
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
                <span className="text-sm font-semibold">AI Summary</span>
              </div>
              <Button
                onClick={onClosePanel}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
              <p className="text-[11px] font-semibold text-primary mb-1">{postSubtitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{activePost.text}</p>
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
              <p className="text-xs leading-relaxed text-foreground/80">{summaryText}</p>
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
                <p className="text-xs leading-relaxed text-foreground/80">{linkedAiResponse}</p>
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
                <span className="text-sm font-semibold">{replyCountLabel(activePost.replyCount)}</span>
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
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  <span className="font-semibold text-primary">{activePost.author}</span>{" "}
                  {activePost.text}
                </p>
              </div>
            </div>

            {/* ── Scrollable reply list ── */}
            <div className="flex-1 overflow-y-auto px-4 min-h-0">
              <div className="space-y-3 pb-2">
                {(activePost.replies ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    No replies yet — be the first.
                  </p>
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
              <span className="text-sm font-semibold flex-1">Review Your Reply</span>
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
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {hasNative ? "Your reply · English (Translated)" : "Your reply"}
                  </p>
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
                    <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{panelState.original}</p>
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
                        <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{r}</p>
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
                    <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">{aiPerspective}</p>
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
