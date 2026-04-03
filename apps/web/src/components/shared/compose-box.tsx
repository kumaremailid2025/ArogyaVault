"use client";
/**
 * ComposeBox — fully self-contained compose input.
 *
 * Manages ALL internal state (text, voice, attachments, images) autonomously.
 * Parent only provides:
 *  - onSubmit callback → receives the final ComposeSubmitPayload
 *  - Optional display props: placeholder, submitLabel, modes
 *
 * Parent does NOT pass any data to ComposeBox. It only gets data out on submit.
 */
import * as React from "react";
import { SmartInput } from "@/components/shared/smart-input";
import type { InputMode, SmartInputSubmitPayload } from "@/models/input";
import type { AttachedDoc } from "@/models/user";

/* ── Public types (re-exported for call-site convenience) ─────────── */
export type { AttachedDoc };

/** Unified payload emitted by ComposeBox on submit */
export interface ComposeSubmitPayload {
  text: string;
  attachedDoc: AttachedDoc;
  voiceRecording: { lang: string; original: string } | null;
}

/** Props accepted by <ComposeBox /> */
export interface ComposeBoxProps {
  /** Called with the final payload when the user submits */
  onSubmit: (payload: ComposeSubmitPayload) => void;
  /** Disable the submit button */
  disabled?: boolean;
  /** Input placeholder text */
  placeholder?: string;
  /** Label on the submit button */
  submitLabel?: string;
  /** Which input modes to expose (default: text, voice, image, attach) */
  modes?: InputMode[];
}

/* ── ComposeBox ────────────────────────────────────────────────────── */
export function ComposeBox({
  onSubmit,
  disabled = false,
  placeholder = "Write your reply…",
  submitLabel = "Send",
  modes = ["text", "voice", "image", "attach"],
}: ComposeBoxProps) {
  /* All state lives here — parent never touches it */
  const [text, setText] = React.useState("");

  const handleChange = React.useCallback((val: string) => {
    setText(val);
  }, []);

  const handleSubmit = React.useCallback(
    (payload: SmartInputSubmitPayload) => {
      onSubmit({
        text: payload.text,
        attachedDoc: payload.attachedDoc,
        voiceRecording: payload.voiceRecording,
      });
      /* Reset text after submit — voice/attach are reset by SmartInput internally */
      setText("");
    },
    [onSubmit],
  );

  return (
    <SmartInput
      value={text}
      onChange={handleChange}
      onSubmit={handleSubmit}
      placeholder={placeholder}
      submitLabel={submitLabel}
      disabled={disabled}
      modes={modes}
      maxRows={5}
      layout="compose"
    />
  );
}
