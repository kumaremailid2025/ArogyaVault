"use client";

/**
 * Shared helpers and components for right-panel views.
 *
 * @packageDocumentation
 * @category Helpers
 *
 * @remarks
 * Provides voice language detection and resolution, file Q&A accordion component,
 * and activity type icon mapping. Used across feed, files, and members right panels.
 */

import * as React from "react";
import {
  SparklesIcon, HelpCircleIcon, ChevronDownIcon,
  MessageSquareIcon, FileUpIcon, ThumbsUpIcon,
  PenLineIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";

import { useVoiceLanguages } from "@/data/voice-languages";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { FileQA, MemberActivityType } from "@/models/community";
import type { VoiceLanguage } from "@/models/user";
import Typography from "@/components/ui/typography";

/* Voice language helpers */

/**
 * Check if the pending reply has a non-English voice recording.
 *
 * @param pendingReply - The reply being composed.
 * @returns True if non-English voice recording is present.
 *
 * @category Helpers
 */
export const getHasNative = (pendingReply: ComposeSubmitPayload | null): boolean =>
  pendingReply?.voiceRecording !== null &&
  pendingReply?.voiceRecording !== undefined &&
  !pendingReply.voiceRecording.lang.startsWith("en");

/**
 * Resolve the language info for a non-English voice recording.
 *
 * @param pendingReply - The reply being composed.
 * @param voiceLanguages - Available voice languages.
 * @returns The language info, or null if no non-English voice recording.
 *
 * @category Helpers
 */
export const getVoiceLangInfo = (
  pendingReply: ComposeSubmitPayload | null,
  voiceLanguages: VoiceLanguage[]
): VoiceLanguage | null => {
  const hasNative = getHasNative(pendingReply);
  return hasNative && pendingReply?.voiceRecording
    ? (voiceLanguages.find((l) => l.code === pendingReply.voiceRecording!.lang) ?? null)
    : null;
};

/* File Q&A accordion */

/**
 * Props for {@link FileQAAccordionList}.
 *
 * @category Types
 */
interface FileQAAccordionListProps {
  /** File Q&A entries to display. */
  questions: FileQA[];
}

/**
 * Render questions in reverse chronological order with expand/collapse.
 *
 * The most recent question is expanded by default; others expand on demand.
 *
 * @param props - Component props.
 * @returns The rendered accordion list.
 *
 * @category Components
 */
export const FileQAAccordionList = ({ questions }: FileQAAccordionListProps): React.ReactElement => {
  /* Reverse: most recent first */
  const reversed = React.useMemo(() => [...questions].reverse(), [questions]);

  /* Track which Q&A ids are expanded — default: the first item (most recent) */
  const [expanded, setExpanded] = React.useState<Set<number>>(() => {
    if (reversed.length === 0) return new Set();
    return new Set([reversed[0].id]);
  });

  /* When questions change (new question added), auto-expand the newest */
  const prevLenRef = React.useRef(questions.length);
  React.useEffect(() => {
    if (questions.length > prevLenRef.current) {
      const newest = [...questions].reverse()[0];
      if (newest) setExpanded((prev) => new Set(prev).add(newest.id));
    }
    prevLenRef.current = questions.length;
  }, [questions]);

  const toggle = React.useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (reversed.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
        <HelpCircleIcon className="size-6 text-muted-foreground/40 mx-auto mb-2" />
        <Typography variant="caption" color="muted">
          No questions yet — be the first to ask.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reversed.map((qa) => {
        const isOpen = expanded.has(qa.id);
        return (
          <div key={qa.id} className="rounded-lg border border-border bg-background overflow-hidden">
            {/* Question row — clickable */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggle(qa.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(qa.id); }}
              className="flex gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <Avatar className="size-5 shrink-0 mt-0.5">
                <AvatarFallback className="text-[8px] font-bold bg-primary/10 text-primary">
                  {qa.askedByInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Typography variant="h5" weight="semibold" as="span" className="!text-[11px]">{qa.askedBy}</Typography>
                  <Typography variant="micro" color="muted" as="span">{qa.askedAt}</Typography>
                </div>
                <Typography variant="caption" className="font-medium">{qa.question}</Typography>
              </div>
              <ChevronDownIcon
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform mt-0.5",
                  isOpen && "rotate-180",
                )}
              />
            </div>

            {/* AI Answer — collapsible */}
            {isOpen && (
              <div className="px-3 pb-3">
                <div className="ml-7 rounded-lg bg-violet-50/50 border border-violet-100 px-3 py-2">
                  <div className="flex items-center gap-1 mb-1">
                    <SparklesIcon className="size-3 text-violet-500" />
                    <span className="text-[10px] font-semibold text-violet-600">ArogyaAI</span>
                  </div>
                  <Typography variant="caption" className="text-foreground/80">{qa.answer}</Typography>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

FileQAAccordionList.displayName = "FileQAAccordionList";

/* Activity icon configuration */

/**
 * Map of member activity types to icon, color, background, and label.
 *
 * Used to render activity feed entries in member profiles.
 *
 * @category Constants
 */
export const ACTIVITY_ICON_MAP: Record<
  MemberActivityType,
  { icon: typeof MessageSquareIcon; color: string; bg: string; label: string }
> = {
  post:     { icon: PenLineIcon,      color: "text-blue-600",   bg: "bg-blue-100",   label: "Posted" },
  reply:    { icon: MessageSquareIcon, color: "text-green-600",  bg: "bg-green-100",  label: "Replied" },
  upload:   { icon: FileUpIcon,       color: "text-amber-600",  bg: "bg-amber-100",  label: "Uploaded" },
  question: { icon: HelpCircleIcon,   color: "text-violet-600", bg: "bg-violet-100", label: "Asked" },
  like:     { icon: ThumbsUpIcon,     color: "text-pink-600",   bg: "bg-pink-100",   label: "Liked" },
};
