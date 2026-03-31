"use client";
/**
 * ComposeBox — shared 3-tab reply/compose component
 *
 * Tabs: Text | Voice | Attach
 *
 * Used in:
 *  - ArogyaTalk replies panel
 *  - LinkedMemberContent replies panel
 *
 * The parent only needs to handle the final onSubmit callback.
 * All voice recording and file-attach state lives here.
 */
import * as React from "react";
import {
  MicIcon, PaperclipIcon, XIcon,
  ImageIcon, ArrowRightIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useFileAttach } from "@/hooks/use-file-attach";
import { VOICE_LANGUAGES } from "@/data/voice-languages";
import type { AttachedDoc } from "@/models/user";

/* ── Types ─────────────────────────────────────────────────────── */
type ComposeTab = "text" | "voice" | "attach";

export interface ComposeSubmitPayload {
  text: string;
  attachedDoc: AttachedDoc;
  voiceRecording: { lang: string; original: string } | null;
}

interface ComposeBoxProps {
  /** Called when the user clicks "Send" with composed content */
  onSubmit: (payload: ComposeSubmitPayload) => void;
  /** Reset external state (e.g. panel text) after submission */
  externalText?: string;
  onExternalTextChange?: (t: string) => void;
  /** Whether the submit button should be disabled */
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;
  /** Called when the user switches tabs (so parent can reset if needed) */
  onTabChange?: (tab: ComposeTab) => void;
}

/* ── Component ─────────────────────────────────────────────────── */
export function ComposeBox({
  onSubmit,
  externalText = "",
  onExternalTextChange,
  disabled = false,
  placeholder = "Write your reply…",
  submitLabel = "Send",
  onTabChange,
}: ComposeBoxProps) {
  const [tab, setTab] = React.useState<ComposeTab>("text");
  const [voiceLang, setVoiceLang] = React.useState("en-IN");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const voice = useVoiceRecorder(voiceLang);
  const attach = useFileAttach();

  /* Switch tab — reset attach/voice state */
  function switchTab(next: ComposeTab) {
    if (next !== tab) {
      voice.reset();
      attach.resetAttach();
    }
    setTab(next);
    onTabChange?.(next);
  }

  /* Build final text from whichever tab is active */
  function resolveText(): string {
    if (tab === "voice") return voice.liveTranscript.trim();
    return externalText.trim();
  }

  function handleSubmit() {
    const text = resolveText();
    if (!text && !attach.attachedDoc) return;
    onSubmit({
      text,
      attachedDoc: attach.attachedDoc,
      voiceRecording: voice.voiceRecording,
    });
    /* Reset */
    voice.reset();
    attach.resetAttach();
    onExternalTextChange?.("");
    setTab("text");
  }

  const canSubmit =
    !disabled &&
    (resolveText().length > 0 || attach.attachedDoc !== null);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        {(["text", "voice", "attach"] as ComposeTab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0 border-border",
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "text"   && "Text"}
            {t === "voice"  && <><MicIcon className="size-3" /> Voice</>}
            {t === "attach" && <><PaperclipIcon className="size-3" /> Attach</>}
          </button>
        ))}
      </div>

      {/* ── TEXT TAB ─────────────────────────────────────────── */}
      {tab === "text" && (
        <textarea
          value={externalText}
          onChange={(e) => onExternalTextChange?.(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
        />
      )}

      {/* ── VOICE TAB ────────────────────────────────────────── */}
      {tab === "voice" && (
        <div className="space-y-2">
          {/* Language selector */}
          <select
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            disabled={voice.voiceState === "recording"}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-colors"
          >
            {VOICE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} — {l.native}
              </option>
            ))}
          </select>

          {/* Record button */}
          {voice.voiceState === "idle" || voice.voiceState === "done" ? (
            <button
              onClick={voice.startRecording}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <MicIcon className="size-4" />
              {voice.voiceState === "done" ? "Record again" : "Tap to record"}
            </button>
          ) : (
            <button
              onClick={voice.stopRecording}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <span className="size-2 rounded-full bg-red-500 animate-ping inline-block" />
              {voice.voiceState === "translating"
                ? "Translating…"
                : `Recording ${voice.formatSeconds(voice.recordingSeconds)} — tap to stop`}
            </button>
          )}

          {/* Live transcript */}
          {voice.liveTranscript && (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs leading-relaxed">
              {/* Bilingual display for non-English */}
              {voice.voiceRecording && !voice.voiceRecording.lang.startsWith("en") && (
                <p className="text-muted-foreground mb-1 italic">
                  {voice.voiceRecording.original}
                </p>
              )}
              <p>{voice.liveTranscript}</p>
            </div>
          )}
        </div>
      )}

      {/* ── ATTACH TAB ───────────────────────────────────────── */}
      {tab === "attach" && (
        <div className="space-y-2">
          {attach.attachState.step === "select" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/20 p-5 text-center cursor-pointer transition-colors"
            >
              <PaperclipIcon className="size-5 text-muted-foreground/40 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-muted-foreground">Tap to attach a file</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">PDF, image, or document</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) attach.handleFileSelect(f);
                }}
              />
            </div>
          )}

          {attach.attachState.step === "preview" && (
            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-muted/30 p-2.5 flex items-center gap-2">
                <ImageIcon className="size-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-xs truncate">{(attach.attachState as Extract<typeof attach.attachState, { step: "preview" }>).file.name}</span>
                <button onClick={attach.resetAttach} className="text-muted-foreground hover:text-foreground shrink-0">
                  <XIcon className="size-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={(attach.attachState as Extract<typeof attach.attachState, { step: "preview" }>).caption}
                onChange={(e) =>
                  attach.setAttachState({
                    ...attach.attachState,
                    step: "preview",
                    caption: e.target.value,
                  } as typeof attach.attachState)
                }
                placeholder="Add a caption (optional)…"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-colors"
              />
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  const s = attach.attachState as Extract<typeof attach.attachState, { step: "preview" }>;
                  attach.handleAnalyze(s.file, s.previewUrl, s.caption);
                }}
              >
                Analyse with AI
              </Button>
            </div>
          )}

          {attach.attachState.step === "analyzing" && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Analysing document…</p>
            </div>
          )}

          {attach.attachState.step === "analyzed" && (
            <div className="space-y-2">
              {(() => {
                const s = attach.attachState as Extract<typeof attach.attachState, { step: "analyzed" }>;
                return (
                  <>
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                      <p className="text-[10px] font-semibold text-emerald-700 mb-1">{s.docType}</p>
                      <p className="text-[10px] text-foreground/70 leading-snug line-clamp-3">{s.summary}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => attach.handleUseAttachment(s.file, s.previewUrl, s.docType)}
                        disabled={attach.attachedDoc !== null}
                      >
                        {attach.attachedDoc ? "Attached ✓" : <><ArrowRightIcon className="size-3" /> Use this</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={attach.resetAttach} className="shrink-0">
                        <XIcon className="size-3.5" />
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Attached doc badge */}
          {attach.attachedDoc && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 flex items-center gap-2">
              <ImageIcon className="size-3.5 text-primary shrink-0" />
              <span className="text-[10px] font-medium text-primary flex-1 truncate">{attach.attachedDoc.filename}</span>
              <button onClick={() => attach.setAttachedDoc(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                <XIcon className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Submit button */}
      <Button
        size="sm"
        className="w-full"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
