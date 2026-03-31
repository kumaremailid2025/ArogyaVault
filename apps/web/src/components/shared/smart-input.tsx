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
import { VOICE_LANGUAGES } from "@/data/voice-languages";
import type { InputMode, SmartInputProps } from "@/models/input";
import type { AttachStep } from "@/models/user";

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
export function SmartInput({
  onSubmit,
  value = "",
  onChange,
  placeholder = "Type a message…",
  submitLabel = "Send",
  disabled = false,
  modes = ["text", "voice", "image", "attach"],
  autoFocus = false,
  onModeChange,
  maxRows = 6,
  layout = "chat",
  className,
}: SmartInputProps) {
  const [mode, setMode]         = React.useState<InputMode>("text");
  const [voiceLang, setVoiceLang] = React.useState("en-IN");

  const textareaRef  = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const voice  = useVoiceRecorder(voiceLang);
  const attach = useFileAttach();

  /* ── Auto-grow logic ──────────────────────────────────────────────── */
  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = maxRows * LINE_HEIGHT_PX + TEXTAREA_PADDING_PX;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  /* Re-run auto-grow whenever value changes externally */
  React.useEffect(() => {
    autoGrow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* ── Mode switching ───────────────────────────────────────────────── */
  function switchMode(next: InputMode) {
    if (next === mode) return;
    /* Tear down the outgoing mode */
    if (mode === "voice")                         voice.reset();
    if (mode === "image" || mode === "attach")    attach.resetAttach();
    setMode(next);
    onModeChange?.(next);
    /* Refocus textarea when going back to text */
    if (next === "text") {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }

  /* ── Submit ───────────────────────────────────────────────────────── */
  function resolveText(): string {
    if (mode === "voice") return voice.liveTranscript.trim();
    return value.trim();
  }

  function handleSubmit() {
    const text = resolveText();
    if (!text && !attach.attachedDoc) return;

    onSubmit({
      text,
      attachedDoc:    attach.attachedDoc,
      voiceRecording: voice.voiceRecording,
      mode,
    });

    /* Reset all state */
    voice.reset();
    attach.resetAttach();
    onChange?.("");
    setMode("text");
    /* Shrink textarea back to one line */
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, 0);
  }

  /* Enter = submit, Shift+Enter = newline */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

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
        <div className="p-3 space-y-2">
          {/* Language selector */}
          <Select
            value={voiceLang}
            onValueChange={setVoiceLang}
            disabled={voice.voiceState === "recording"}
          >
            <SelectTrigger size="sm" className="w-full text-xs" aria-label="Recording language">
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

          {/* Record / Stop button */}
          {voice.voiceState === "idle" || voice.voiceState === "done" ? (
            <Button
              variant="outline"
              onClick={voice.startRecording}
              aria-label="Start recording"
              className="w-full h-auto flex items-center justify-center gap-2 rounded-lg border-dashed py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              <MicIcon className="size-4" />
              {voice.voiceState === "done" ? "Record again" : "Tap to record"}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={voice.stopRecording}
              aria-label="Stop recording"
              className="w-full h-auto flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 py-3 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30"
            >
              <span className="size-2 rounded-full bg-red-500 animate-ping inline-block" />
              {voice.voiceState === "translating"
                ? "Translating…"
                : `Recording ${voice.formatSeconds(voice.recordingSeconds)} — tap to stop`}
            </Button>
          )}

          {/* Live transcript */}
          {voice.liveTranscript && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs leading-relaxed">
              {/* Show original non-English text above the translation */}
              {voice.voiceRecording && !voice.voiceRecording.lang.startsWith("en") && (
                <p className="text-muted-foreground mb-1 italic">
                  {voice.voiceRecording.original}
                </p>
              )}
              <p className="text-foreground">{voice.liveTranscript}</p>
            </div>
          )}
        </div>
      )}

      {/* ── IMAGE & ATTACH MODES (shared flow) ───────────────────── */}
      {(mode === "image" || mode === "attach") && (
        <div className="p-3 space-y-2">

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
              className="rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/20 p-6 text-center cursor-pointer transition-colors focus:outline-none focus:border-primary"
            >
              {mode === "image"
                ? <ImageIcon className="size-5 text-muted-foreground/40 mx-auto mb-1.5" />
                : <PaperclipIcon className="size-5 text-muted-foreground/40 mx-auto mb-1.5" />
              }
              <p className="text-xs font-medium text-muted-foreground">
                {mode === "image" ? "Tap to select an image" : "Tap to attach a file"}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {mode === "image" ? "JPG, PNG, WebP" : "PDF, image, Word, or text"}
              </p>

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
            return (
              <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">Analysing document…</p>
            </div>
          )}

          {/* Step: analyzed */}
          {attach.attachState.step === "analyzed" && (() => {
            const s = attach.attachState as Extract<AttachStep, { step: "analyzed" }>;
            return (
              <div className="space-y-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 p-2.5">
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    {s.docType}
                  </p>
                  <p className="text-[10px] text-foreground/70 leading-snug line-clamp-3">
                    {s.summary}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() =>
                      attach.handleUseAttachment(s.file, s.previewUrl, s.docType)
                    }
                    disabled={attach.attachedDoc !== null}
                  >
                    {attach.attachedDoc
                      ? "Attached ✓"
                      : <><ArrowRightIcon className="size-3" /> Use this</>
                    }
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
          <span className="text-[10px] font-medium text-primary flex-1 truncate">
            {attach.attachedDoc.filename}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => attach.setAttachedDoc(null)}
            aria-label="Remove attachment"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <XIcon className="size-3" />
          </Button>
        </div>
      )}

      {/* ── BOTTOM TOOLBAR ───────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 border-t border-border/50",
          layout === "compose" && "flex-col"
        )}
      >
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
        {layout === "chat" ? (
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
        ) : (
          <Button
            className="w-full mt-1 gap-1.5"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <SendIcon className="size-4" />
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
