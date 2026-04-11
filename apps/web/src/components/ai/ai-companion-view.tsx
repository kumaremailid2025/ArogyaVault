"use client";

/**
 * @file ai-companion-view.tsx
 * @packageDocumentation
 * @category Components
 *
 * ArogyaMitra — the ArogyaAI personal wellness companion view.
 *
 * Provides mood check-in, guided text conversation, quick-start prompts,
 * and a live video session overlay powered by the browser `MediaDevices` API.
 *
 * All interactive elements use the project's core UI primitives (`Button`,
 * `Input`, `Badge`, `ScrollArea`) rather than raw HTML elements.
 */

import * as React from "react";
import {
  HeartIcon,
  SparklesIcon,
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  SmileIcon,
  MehIcon,
  FrownIcon,
  SunIcon,
  MoonIcon,
  FlameIcon,
  LoaderIcon,
  CameraIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Badge } from "@/core/ui/badge";
import { ScrollArea } from "@/core/ui/scroll-area";
import Typography from "@/components/ui/typography";
import { useSendAiMessage } from "@/hooks/api";
import type { ConversationMessage, AiMessage } from "@/data/ai-conversations";

/* ─────────────────────────────────────────────────────────────────────
   MOOD OPTIONS
───────────────────────────────────────────────────────────────────── */

/**
 * A single mood option displayed in the daily check-in card.
 *
 * @category Types
 */
interface MoodOption {
  /** Unique machine key for the mood. */
  key: string;
  /** User-facing label. */
  label: string;
  /** Lucide icon component to render. */
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  /** Tailwind text-colour class for the icon. */
  color: string;
  /** Tailwind background + border classes for the button card. */
  bg: string;
}

const MOODS: readonly MoodOption[] = [
  { key: "great", label: "Great", icon: FlameIcon,  color: "text-orange-500",  bg: "bg-orange-50 border-orange-200"   },
  { key: "good",  label: "Good",  icon: SmileIcon,  color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  { key: "okay",  label: "Okay",  icon: MehIcon,    color: "text-amber-500",   bg: "bg-amber-50 border-amber-200"     },
  { key: "low",   label: "Low",   icon: FrownIcon,  color: "text-blue-400",    bg: "bg-blue-50 border-blue-200"       },
] as const;

type MoodKey = (typeof MOODS)[number]["key"];

/* ─────────────────────────────────────────────────────────────────────
   DAILY NUDGES  (rotated by day-of-week, index 0–6)
───────────────────────────────────────────────────────────────────── */

const NUDGES: readonly string[] = [
  "Small steps every day add up to big changes. What's one thing you can do for yourself right now?",
  "You are doing better than you think. Take a breath — you've got this.",
  "Progress, not perfection. Celebrate how far you've come.",
  "Your body is your home. How are you taking care of it today?",
  "Reach out to someone you care about today. Connection is medicine.",
  "Rest is not laziness — it is one of the most productive things you can do.",
  "What made you smile this week? Hold onto that feeling.",
];

/** Today's motivational nudge, derived from the current day-of-week index. */
const dailyNudge: string = NUDGES[new Date().getDay()];

/* ─────────────────────────────────────────────────────────────────────
   QUICK PROMPTS
───────────────────────────────────────────────────────────────────── */

/**
 * A single pre-written prompt shown on the companion landing screen.
 *
 * @category Types
 */
interface QuickPrompt {
  /** Lucide icon component. */
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  /** The full prompt text sent to ArogyaMitra on click. */
  text: string;
  /** Tailwind text-colour class for the icon. */
  color: string;
}

const QUICK_PROMPTS: readonly QuickPrompt[] = [
  { icon: SunIcon,      text: "How can I start my day better?",          color: "text-amber-500"  },
  { icon: HeartIcon,    text: "I'm feeling anxious. Help me calm down.", color: "text-rose-500"   },
  { icon: MoonIcon,     text: "Tips for better sleep tonight.",           color: "text-indigo-400" },
  { icon: SparklesIcon, text: "Motivate me to reach my health goals.",   color: "text-violet-500" },
];

/* ─────────────────────────────────────────────────────────────────────
   AI COMPANION SPEAKING PHRASES  (cycled in the video panel every 6 s)
───────────────────────────────────────────────────────────────────── */

const COMPANION_PHRASES: readonly string[] = [
  "I'm listening — take your time.",
  "You matter. Tell me what's on your mind.",
  "I'm right here with you.",
  "How can I help you feel better today?",
  "Take a deep breath. You're in a safe space.",
  "Thank you for sharing that with me.",
  "Let's work through this together.",
];

/* ─────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────── */

/**
 * Formats a duration given in total seconds as a zero-padded `mm:ss` string.
 *
 * @param s - Total elapsed seconds (non-negative integer).
 * @returns Zero-padded duration string, e.g. `"02:34"`.
 *
 * @example
 * formatTime(154) // → "02:34"
 */
const formatTime = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ─────────────────────────────────────────────────────────────────────
   VIDEO SESSION MODAL
───────────────────────────────────────────────────────────────────── */

/** Possible states of the MediaDevices camera request + call lifecycle. */
type CallStatus = "requesting" | "active" | "denied" | "ended";

/**
 * Props for {@link VideoSessionModal}.
 *
 * @category Types
 */
interface VideoSessionModalProps {
  /**
   * Called when the user taps "End session".
   * Receives a transcript string that is appended to the companion text chat.
   */
  onEnd: (transcript: string) => void;
  /** Called when the user closes the overlay without formally ending the call. */
  onClose: () => void;
}

/**
 * VideoSessionModal
 * ─────────────────
 * Full-screen overlay rendered inside the companion panel that streams the
 * user's webcam via `navigator.mediaDevices.getUserMedia`.
 *
 * The AI companion side shows an animated avatar with rotating phrases.
 * On end, a context message is injected into the companion chat so the
 * conversation continues seamlessly.
 *
 * @param props - {@link VideoSessionModalProps}
 */
const VideoSessionModal = ({ onEnd, onClose }: VideoSessionModalProps) => {
  const videoRef  = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [callStatus, setCallStatus] = React.useState<CallStatus>("requesting");
  const [micOn,  setMicOn]    = React.useState(true);
  const [camOn,  setCamOn]    = React.useState(true);
  const [elapsed, setElapsed] = React.useState(0);
  const [phraseIdx, setPhraseIdx] = React.useState(0);
  const [pulsing, setPulsing]     = React.useState(false);

  /* Request camera + microphone on mount ────────────────────────── */
  React.useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCallStatus("active");
      })
      .catch(() => { if (!cancelled) setCallStatus("denied"); });
    return () => { cancelled = true; };
  }, []);

  /* Stop all tracks on unmount ──────────────────────────────────── */
  React.useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  /* Elapsed-time ticker ─────────────────────────────────────────── */
  React.useEffect(() => {
    if (callStatus !== "active") return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [callStatus]);

  /* Rotate companion phrase every 6 s ───────────────────────────── */
  React.useEffect(() => {
    if (callStatus !== "active") return;
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % COMPANION_PHRASES.length);
      setPulsing(true);
      setTimeout(() => setPulsing(false), 600);
    }, 6000);
    return () => clearInterval(id);
  }, [callStatus]);

  /** Toggle microphone audio track enabled state. */
  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    setMicOn((v) => !v);
  };

  /** Toggle camera video track enabled state. */
  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !camOn; });
    setCamOn((v) => !v);
  };

  /** Stop all tracks, close the modal, and inject session context into chat. */
  const handleEnd = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCallStatus("ended");
    onEnd(`We had a video session together (${formatTime(elapsed)}). Please continue our wellness conversation.`);
  };

  return (
    /* Absolute overlay — fills the relative companion container */
    <div className="absolute inset-0 z-50 flex flex-col bg-gray-950 text-white overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-rose-500">
            <HeartIcon className="size-3.5" />
          </div>
          <Typography variant="h5" color="inverse" className="leading-none">ArogyaMitra</Typography>
          {callStatus === "active" && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              ● LIVE {formatTime(elapsed)}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); onClose(); }}
          className="text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Close video session"
        >
          <XIcon />
        </Button>
      </div>

      {/* ── Main video area ──────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 px-4 pb-3">

        {/* AI Companion panel */}
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-rose-900/60 to-violet-900/60 border border-white/10 relative overflow-hidden">

          {/* Ambient animated rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-40 rounded-full border border-rose-500/10 animate-ping absolute" style={{ animationDuration: "3s" }} />
            <div className="size-56 rounded-full border border-violet-500/10 animate-ping absolute" style={{ animationDuration: "4s", animationDelay: "1s" }} />
          </div>

          {/* Avatar */}
          <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 shadow-2xl shadow-rose-900/50 z-10">
            <HeartIcon className="size-9 text-white" />
          </div>

          <Typography variant="h4" color="inverse" className="mt-3 z-10">ArogyaMitra</Typography>
          <Typography variant="micro" color="inverse" className="opacity-60 z-10">Your wellness companion</Typography>

          {/* Rotating phrase */}
          <div className={cn(
            "mt-4 mx-6 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 text-center z-10 transition-opacity duration-300",
            pulsing ? "opacity-0" : "opacity-100"
          )}>
            <Typography variant="caption" color="inverse" className="opacity-90 italic">
              &ldquo;{COMPANION_PHRASES[phraseIdx]}&rdquo;
            </Typography>
          </div>

          {/* Mic status indicator */}
          {callStatus === "active" && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1">
              {micOn
                ? <><MicIcon className="size-3 text-emerald-400" /><Typography variant="micro" as="span" className="text-emerald-400">Listening</Typography></>
                : <><MicOffIcon className="size-3 text-white/40" /><Typography variant="micro" as="span" className="text-white/40">Muted</Typography></>
              }
            </div>
          )}
        </div>

        {/* User video panel */}
        <div className="w-full md:w-[200px] shrink-0 relative rounded-2xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center min-h-[140px]">

          {callStatus === "requesting" && (
            <div className="flex flex-col items-center gap-2 p-4">
              <LoaderIcon className="size-6 animate-spin text-white/50" />
              <Typography variant="micro" color="inverse" className="opacity-50 text-center">Requesting camera…</Typography>
            </div>
          )}

          {callStatus === "denied" && (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <VideoOffIcon className="size-6 text-white/50" />
              <Typography variant="micro" color="inverse" className="opacity-60">Camera access denied.</Typography>
              <Typography variant="micro" color="inverse" className="opacity-40">Check your browser permissions and try again.</Typography>
            </div>
          )}

          {(callStatus === "active" || callStatus === "requesting") && (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={cn("w-full h-full object-cover", !camOn && "hidden")}
              />
              {!camOn && (
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <CameraIcon className="size-6" />
                  <Typography variant="micro" color="inverse" className="opacity-40">Camera off</Typography>
                </div>
              )}
            </>
          )}

          {/* "You" label */}
          {callStatus === "active" && (
            <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5">
              <Typography variant="micro" as="span" color="inverse" className="opacity-70">You</Typography>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center gap-4 pb-5">

        {/* Mic toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMic}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          className={cn(
            "rounded-full border",
            micOn
              ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
              : "border-rose-500 bg-rose-600 hover:bg-rose-700 text-white"
          )}
        >
          {micOn ? <MicIcon /> : <MicOffIcon />}
        </Button>

        {/* Camera toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCam}
          aria-label={camOn ? "Turn off camera" : "Turn on camera"}
          className={cn(
            "rounded-full border",
            camOn
              ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
              : "border-rose-500 bg-rose-600 hover:bg-rose-700 text-white"
          )}
        >
          {camOn ? <VideoIcon /> : <VideoOffIcon />}
        </Button>

        {/* End call */}
        <Button
          variant="destructive"
          size="icon"
          onClick={handleEnd}
          aria-label="End session"
          className="size-14 rounded-full shadow-lg shadow-rose-900/50"
        >
          <PhoneOffIcon />
        </Button>
      </div>

      {/* Denied state — close CTA */}
      {callStatus === "denied" && (
        <div className="shrink-0 pb-5 flex justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            Continue in chat instead
          </Button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   COMPANION BUBBLE
───────────────────────────────────────────────────────────────────── */

/**
 * Props for {@link CompanionBubble}.
 *
 * @category Types
 */
interface CompanionBubbleProps {
  /** The conversation message to render. */
  msg: ConversationMessage;
}

/**
 * CompanionBubble
 * ───────────────
 * Renders a single message in the ArogyaMitra conversation thread.
 * User messages align right with `bg-primary`; companion messages
 * align left with a rose-tinted card.
 *
 * @param props - {@link CompanionBubbleProps}
 */
const CompanionBubble = ({ msg }: CompanionBubbleProps) => {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white mt-0.5">
          <HeartIcon className="size-3.5" />
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-rose-50 border border-rose-100 rounded-tl-sm"
        )}
      >
        <Typography variant="body" color={isUser ? "inverse" : "default"}>{msg.text}</Typography>
      </div>
      {isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border mt-0.5">
          <Typography variant="micro" weight="bold" as="span">KU</Typography>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────── */

/**
 * AiCompanionView
 * ───────────────
 * The ArogyaMitra tab rendered inside `ArogyaAiContainer`.
 *
 * Responsibilities:
 *  - Daily mood check-in (once per browser session).
 *  - Text conversation with the ArogyaMitra AI persona.
 *  - Quick-start prompt cards on the landing screen.
 *  - Video session overlay via `VideoSessionModal`.
 *
 * @example
 * ```tsx
 * <AiCompanionView />
 * ```
 */
export const AiCompanionView = () => {
  const sendMessage = useSendAiMessage();

  const [checkedIn, setCheckedIn]       = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState<MoodKey | null>(null);
  const [messages, setMessages]         = React.useState<ConversationMessage[]>([]);
  const [input, setInput]               = React.useState("");
  const [videoOpen, setVideoOpen]       = React.useState(false);

  const isTyping = sendMessage.isPending;
  const bottomRef = React.useRef<HTMLDivElement>(null);

  /* Auto-scroll to latest message ─────────────────────────────── */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /**
   * Sends a text message to the ArogyaMitra AI endpoint and appends
   * both the user message and the AI response to the local state.
   *
   * @param text - The message text to send.
   */
  const sendToMitra = React.useCallback((text: string) => {
    const userMsg: ConversationMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    sendMessage.mutate(
      { query: `[ArogyaMitra] ${text}` },
      {
        onSuccess: (res) => {
          const aiMsg: AiMessage = { role: "ai", text: res.text, list: res.list, citations: res.citations, note: res.note };
          setMessages((prev) => [...prev, aiMsg]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "ai", text: "I'm here with you. Let's try that again in a moment." },
          ]);
        },
      }
    );
  }, [sendMessage]);

  /**
   * Records the user's daily mood check-in and sends a contextual
   * greeting to ArogyaMitra.
   *
   * @param mood - The selected mood key.
   */
  const handleCheckIn = (mood: MoodKey) => {
    setSelectedMood(mood);
    setCheckedIn(true);
    const moodLabel = MOODS.find((m) => m.key === mood)!.label;
    sendToMitra(`My mood today: ${moodLabel}. I just checked in.`);
  };

  /** Handles text-input form submission. */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;
    sendToMitra(text);
    setInput("");
  };

  /**
   * Called when the video session ends.
   * Closes the modal and injects the session transcript into the chat.
   *
   * @param transcript - A short summary string to send to ArogyaMitra.
   */
  const handleVideoEnd = (transcript: string) => {
    setVideoOpen(false);
    sendToMitra(transcript);
  };

  const hasConversation = messages.length > 0;
  const activeMood = selectedMood ? MOODS.find((m) => m.key === selectedMood) : null;

  return (
    <div className="relative h-full flex flex-col overflow-hidden">

      {/* ── Video session overlay ──────────────────────────────── */}
      {videoOpen && (
        <VideoSessionModal onEnd={handleVideoEnd} onClose={() => setVideoOpen(false)} />
      )}

      {/* ── Header card ────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-violet-600 p-4 text-white">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
              <HeartIcon className="size-4.5" />
            </div>
            <div>
              <Typography variant="h4" as="p" color="inverse" className="leading-none">ArogyaMitra</Typography>
              <Typography variant="micro" color="inverse" className="opacity-80 mt-0.5">Your trusted companion</Typography>
            </div>
            {/* Video session button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVideoOpen(true)}
              className="ml-auto rounded-full border border-white/30 bg-white/15 hover:bg-white/25 text-white active:scale-95"
            >
              <VideoIcon />
              Video
            </Button>
          </div>
          <Typography variant="caption" color="inverse" className="opacity-90 leading-snug">
            {dailyNudge}
          </Typography>
        </div>
      </div>

      {/* ── Daily mood check-in ─────────────────────────────────── */}
      {!checkedIn && (
        <div className="shrink-0 px-4 pb-3">
          <div className="rounded-xl border border-border bg-background p-3 space-y-2">
            <Typography variant="h5" weight="semibold">How are you feeling today?</Typography>
            <div className="grid grid-cols-4 gap-1.5">
              {MOODS.map((mood) => {
                const Icon = mood.icon;
                return (
                  <Button
                    key={mood.key}
                    variant="ghost"
                    onClick={() => handleCheckIn(mood.key)}
                    className={cn(
                      "h-auto flex-col gap-1 rounded-lg border px-2 py-2.5",
                      mood.bg
                    )}
                  >
                    <Icon className={cn("size-4", mood.color)} />
                    <Typography variant="micro" as="span" className="text-foreground/80">{mood.label}</Typography>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Conversation / landing ─────────────────────────────── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4">
          {!hasConversation ? (
            /* Landing — video CTA + quick prompts */
            <div className="space-y-3 pb-4">
              <Typography variant="overline" color="muted">Start a conversation</Typography>

              {/* Video session CTA card */}
              <Button
                variant="ghost"
                onClick={() => setVideoOpen(true)}
                className="h-auto w-full justify-start gap-3 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-violet-50 px-4 py-3 hover:border-rose-300 hover:shadow-sm"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-violet-600 text-white">
                  <VideoIcon className="size-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <Typography variant="caption" weight="semibold" className="text-rose-700">Start a video session</Typography>
                  <Typography variant="micro" color="muted" className="mt-0.5">
                    Talk face-to-face with ArogyaMitra — your personal wellness guide.
                  </Typography>
                </div>
                <Badge className="shrink-0 bg-rose-100 text-rose-600 border-0">Live</Badge>
              </Button>

              {/* Text quick prompts */}
              <div className="space-y-1.5">
                {QUICK_PROMPTS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Button
                      key={p.text}
                      variant="outline"
                      onClick={() => sendToMitra(p.text)}
                      className="h-auto w-full justify-start gap-2.5 px-3 py-2.5 rounded-xl"
                    >
                      <Icon className={cn("size-4 shrink-0", p.color)} />
                      <Typography variant="caption">{p.text}</Typography>
                    </Button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Conversation messages */
            <div className="flex flex-col gap-3 py-3">
              {activeMood && (
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className={cn("rounded-full", activeMood.bg)}>
                    Today&apos;s mood: {activeMood.label}
                  </Badge>
                </div>
              )}
              {messages.map((msg, i) => <CompanionBubble key={i} msg={msg} />)}
              {isTyping && (
                <div className="flex gap-2.5 justify-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white mt-0.5">
                    <HeartIcon className="size-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-600">
                    <LoaderIcon className="size-3.5 animate-spin" />
                    <Typography variant="body" className="text-rose-600">ArogyaMitra is here…</Typography>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Input ──────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to ArogyaMitra…"
            disabled={isTyping}
            className="flex-1 focus-visible:ring-rose-400/60"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white border-0"
            size="sm"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
