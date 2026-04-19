"use client";
/**
 * SmartInput — universal, auto-growing input component
 *
 * Features:
 *  - Starts as a single line; grows smoothly up to `maxRows` as text is typed
 *  - Mode toolbar: Text | Voice | Image | Attach
 *  - Voice mode wraps useVoiceRecorder (Web Speech API, multi-language)
 *  - Image & Attach modes wrap useFileAttach (select → preview → AI-analyse → use)
 *  - Unified SmartInputSubmitPayload on every submit regardless of mode
 *  - Keyboard shortcut: Enter submits, Shift+Enter adds a new line
 *  - Fully accessible — toolbar buttons have title + aria-label
 *
 * Usage:
 *   <SmartInput
 *     value={text}
 *     onChange={setText}
 *     onSubmit={handleSubmit}
 *     placeholder="Ask ArogyaAI…"
 *     modes={["text", "voice", "image"]}
 *   />
 */
import * as React from "react";
import {
  SendIcon,
  MicIcon,
  ImageIcon,
  PaperclipIcon,
  KeyboardIcon,
  XIcon,
  ArrowRightIcon,
  StopCircleIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Textarea } from "@/core/ui/textarea";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/core/ui/select";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useFileAttach } from "@/hooks/use-file-attach";
import { useVoiceLanguages } from "@/data/voice-languages";
import type { InputMode, SmartInputProps } from "@/models/input";
import type { AttachStep } from "@/models/user";
import Typography from "@/components/ui/typography";

/* ── Constants ─────────────────────────────────────────────────────── */
/** Approx line height in px for text-sm (14px) + leading-[22px] */
const LINE_HEIGHT_PX = 22;
/** Vertical padding inside the textarea (pt-3 pb-0 = 12px top) */
const TEXTAREA_PADDING_PX = 12;

/* ── Mode metadata ─────────────────────────────────────────────────── */
const MODE_META: Record<InputMode, { icon: React.ReactNode; label: string }> = {
  text:   { icon: <KeyboardIcon className="size-4" />,    label: "Type"   },
  voice:  { icon: <MicIcon className="size-4" />,         label: "Voice"  },
  image:  { icon: <ImageIcon className="size-4" />,       label: "Image"  },
  attach: { icon: <PaperclipIcon className="size-4" />,   label: "Attach" },
};

/* ── SmartInput ────────────────────────────────────────────────────── */
export const SmartInput = ({
  value,
  onChange,
  onSubmit,
  onModeChange,
  placeholder = "Ask anything…",
  disabled = false,
  autoFocus = false,
  className,
  modes = ["text", "voice", "image", "attach"],
  submitLabel = "Send",
  maxRows = 5,
}: SmartInputProps) => {
  const { VOICE_LANGUAGES } = useVoiceLanguages();
  const [mode, setMode]         = React.useState<InputMode>("text");
  const [voiceLang, setVoiceLang] = React.useState("en-IN");

  const textareaRef  = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const voice  = useVoiceRecorder(voiceLang);
  const attach = useFileAttach();

  /* ── Auto-grow logic ──────────────────────────────────────────────── */
  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = maxRows * LINE_HEIGHT_PX + TEXTAREA_PADDING_PX;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  /* Re-run auto-grow whenever value changes externally */
  React.useEffect(() => {
    autoGrow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* ── Mode switching ───────────────────────────────────────────────── */
  const switchMode = (next: InputMode) => {
    if (next === mode) return;
    /* Tear down the outgoing mode.
       For image/attach we only clear the in-progress wizard — a confirmed
       `attachedDoc` survives mode switches so the user can, e.g., attach
       an image and then switch to text to type a message. */
    if (mode === "voice")                         voice.reset();
    if (mode === "image" || mode === "attach")    attach.clearAttachWizard();
    setMode(next);
    onModeChange?.(next);
    /* Refocus textarea when going back to text */
    if (next === "text") {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };

  /* ── Submit ───────────────────────────────────────────────────────── */
  const resolveText = (): string => {
    if (mode === "voice") return voice.liveTranscript.trim();
    return (value ?? "").trim();
  };

  const handleSubmit = () => {
    /* If the user didn't type in the main textarea / transcribe anything,
       fall back to the caption they typed during the image-attach preview. */
    let text = resolveText();
    if (!text && attach.attachedDoc?.caption) {
      text = attach.attachedDoc.caption;
    }
    if (!text && !attach.attachedDoc) return;

    onSubmit({
      text,
      attachedDoc:    attach.attachedDoc,
      voiceRecording: voice.voiceRecording,
      mode,
    });

    /* Reset all state.
       IMPORTANT: use `clearAfterSubmit` (NOT `resetAttach`) — the parent
       now owns the object URL we just handed it via `attachedDoc.previewUrl`,
       and revoking it here would break any preview the parent renders. */
    voice.reset();
    attach.clearAfterSubmit();
    onChange?.("");
    setMode("text");
    /* Shrink textarea back to one line */
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, 0);
  };

  /* Enter = submit, Shift+Enter = newline */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit =
    !disabled && (resolveText().length > 0 || attach.attachedDoc !== null);

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background shadow-sm overflow-hidden transition-shadow focus-within:shadow-md focus-within:border-primary/50",
        className
      )}
    >
      {/* ── TEXT MODE ────────────────────────────────────────────── */}
      {mode === "text" && (
        <div className="px-3 pt-3 pb-1">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange?.(e.target.value);
              autoGrow();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={1}
            aria-label="Message input"
            className="w-full bg-transparent text-sm resize-none border-0 shadow-none outline-none min-h-0 p-0 placeholder:text-muted-foreground/60 leading-[22px] focus-visible:ring-0"
            style={{ overflowY: "hidden", minHeight: `${LINE_HEIGHT_PX}px` }}
          />
        </div>
      )}

      {/* ── VOICE MODE ───────────────────────────────────────────── */}
      {mode === "voice" && (
        <div className="px-3 pt-3 pb-1 space-y-1">
          <div className="flex items-center gap-1.5 h-[22px] leading-[22px]">
            <MicIcon className="size-4 text-muted-foreground/50 shrink-0" />

            <Select
              value={voiceLang}
              onValueChange={setVoiceLang}
              disabled={voice.voiceState === "recording"}
            >
              <SelectTrigger size="sm" className="shrink-0 text-xs h-5 min-h-0 border-0 shadow-none px-0 gap-0.5 w-auto [&>svg]:size-3" aria-label="Recording language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICE_LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code} className="text-xs">
                    {l.label} — {l.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-muted-foreground/30">|</span>

            {voice.voiceState === "idle" || voice.voiceState === "done" ? (
              <button
                onClick={voice.startRecording}
                aria-label="Start recording"
                className="text-sm text-muted-foreground/60 hover:text-primary/80 transition-colors"
              >
                {voice.voiceState === "done" ? "Record again" : "Tap to record"}
              </button>
            ) : (
              <button
                onClick={voice.stopRecording}
                aria-label="Stop recording"
                className="flex items-center gap-1.5 text-sm text-red-600"
              >
                <span className="size-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                {voice.voiceState === "translating"
                  ? "Translating…"
                  : `${voice.formatSeconds(voice.recordingSeconds)} — tap to stop`}
              </button>
            )}
          </div>

          {/* Live transcript */}
          {voice.liveTranscript && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs leading-relaxed">
              {voice.voiceRecording && !voice.voiceRecording.lang.startsWith("en") && (
                <Typography variant="body" color="muted" className="mb-1 italic">
                  {voice.voiceRecording.original}
                </Typography>
              )}
              <Typography variant="body">{voice.liveTranscript}</Typography>
            </div>
          )}
        </div>
      )}

      {/* ── IMAGE & ATTACH MODES (shared flow) ───────────────────── */}
      {(mode === "image" || mode === "attach") && (
        <div className="px-3 pt-3 pb-1 space-y-1">

          {/* Step: select */}
          {attach.attachState.step === "select" && (
            <div
              role="button"
              tabIndex={0}
              aria-label={mode === "image" ? "Select an image" : "Attach a file"}
              onClick={() =>
                mode === "image"
                  ? imageInputRef.current?.click()
                  : fileInputRef.current?.click()
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  mode === "image"
                    ? imageInputRef.current?.click()
                    : fileInputRef.current?.click();
                }
              }}
              className="flex items-center gap-2 min-h-[22px] cursor-pointer group"
            >
              {mode === "image"
                ? <ImageIcon className="size-4 text-muted-foreground/50 shrink-0 group-hover:text-primary/60" />
                : <PaperclipIcon className="size-4 text-muted-foreground/50 shrink-0 group-hover:text-primary/60" />
              }
              <span className="text-sm text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
                {mode === "image" ? "Tap to select an image" : "Tap to attach a file"}
              </span>
              <span className="text-[10px] text-muted-foreground/40">
                {mode === "image" ? "JPG, PNG, WebP" : "PDF, image, Word, or text"}
              </span>

              {/* Hidden file inputs */}
              <Input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) attach.handleFileSelect(f);
                  e.target.value = "";
                }}
              />
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) attach.handleFileSelect(f);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* Step: preview */}
          {attach.attachState.step === "preview" && (() => {
            const s = attach.attachState as Extract<AttachStep, { step: "preview" }>;
            const isImage = s.file.type.startsWith("image/");
            return (
              <div className="space-y-2">
                {/* Image thumbnail — shown for images in either image or attach mode */}
                {isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.previewUrl}
                    alt={s.file.name}
                    className="block max-h-40 w-auto mx-auto rounded-lg border border-border bg-muted/20 object-contain"
                  />
                )}
                <div className="rounded-lg border border-border bg-muted/30 p-2.5 flex items-center gap-2">
                  <ImageIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-xs truncate">{s.file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={attach.resetAttach}
                    aria-label="Remove file"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
                <Input
                  type="text"
                  value={s.caption}
                  onChange={(e) =>
                    attach.setAttachState({ ...s, caption: e.target.value })
                  }
                  placeholder="Add a caption (optional)…"
                  className="w-full h-8 text-xs"
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => attach.handleAnalyze(s.file, s.previewUrl, s.caption)}
                >
                  Analyse with AI
                </Button>
              </div>
            );
          })()}

          {/* Step: analyzing */}
          {attach.attachState.step === "analyzing" && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <Typography variant="caption" color="muted">Analysing document…</Typography>
            </div>
          )}

          {/* Step: analyzed — hidden once the user confirms with "Use this".
              The confirmed attachment shows up in the badge below instead. */}
          {attach.attachState.step === "analyzed" && !attach.attachedDoc && (() => {
            const s = attach.attachState as Extract<AttachStep, { step: "analyzed" }>;
            return (
              <div className="space-y-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 p-2.5">
                  <Typography variant="micro" color="success" weight="semibold" className="mb-1">
                    {s.docType}
                  </Typography>
                  <Typography variant="micro" className="text-foreground/70 leading-snug line-clamp-3">
                    {s.summary}
                  </Typography>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() =>
                      attach.handleUseAttachment(s.file, s.previewUrl, s.docType, s.caption)
                    }
                  >
                    <ArrowRightIcon className="size-3" /> Use this
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={attach.resetAttach}
                    aria-label="Remove attachment"
                    className="shrink-0"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Attached doc badge — visible in all modes once attached */}
      {attach.attachedDoc && (
        <div className="mx-3 mb-2 rounded-lg border border-primary/20 bg-primary/5 p-2 flex items-center gap-2">
          <ImageIcon className="size-3.5 text-primary shrink-0" />
          <Typography variant="micro" weight="medium" color="primary" as="span" truncate={true} className="flex-1">
            {attach.attachedDoc.filename}
          </Typography>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={attach.removeAttachedDoc}
            aria-label="Remove attachment"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      )}

      {/* ── BOTTOM TOOLBAR ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-t border-border/50">
        {/* Mode switcher */}
        <div className="flex items-center gap-0.5 flex-1">
          {modes.map((m) => (
            <Button
              key={m}
              variant="ghost"
              size="icon-sm"
              onClick={() => switchMode(m)}
              title={MODE_META[m].label}
              aria-label={`Switch to ${MODE_META[m].label} input`}
              aria-pressed={mode === m}
              className={cn(
                "rounded-md",
                mode === m
                  ? "text-primary bg-primary/10 hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {MODE_META[m].icon}
            </Button>
          ))}
        </div>

        {/* Submit button */}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label={submitLabel}
          className="gap-1.5 rounded-lg px-3 h-7"
        >
          <SendIcon className="size-3.5" />
          <span className="hidden sm:inline">{submitLabel}</span>
        </Button>
      </div>
    </div>
  );
};
