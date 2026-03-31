"use client";
/**
 * ComposeBox — lightweight wrapper around SmartInput.
 *
 * Keeps the same external API (ComposeSubmitPayload, ComposeBoxProps) so
 * all existing call-sites work without changes, while the actual input
 * UI is now provided by SmartInput (growing textarea, mode toolbar, etc.)
 *
 * Used in:
 *  - ArogyaTalk replies panel
 *  - LinkedMemberContent replies panel
 *  - Any other "reply / compose" context
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
  /** Called when the user submits composed content */
  onSubmit: (payload: ComposeSubmitPayload) => void;

  /**
   * Controlled text value — parent manages this string.
   * Maps to SmartInput's `value` + `onChange`.
   */
  externalText?: string;
  onExternalTextChange?: (t: string) => void;

  /** Disable the submit button */
  disabled?: boolean;
  placeholder?: string;
  submitLabel?: string;

  /**
   * Which input modes to expose.
   * Defaults to text + voice + attach (no dedicated image tab, matching
   * the original compose-box behaviour).
   */
  modes?: InputMode[];

  /** Notified when the user switches input modes */
  onTabChange?: (tab: InputMode) => void;
}

/* ── ComposeBox ────────────────────────────────────────────────────── */
export function ComposeBox({
  onSubmit,
  externalText = "",
  onExternalTextChange,
  disabled = false,
  placeholder = "Write your reply…",
  submitLabel = "Send",
  modes = ["text", "voice", "attach"],
  onTabChange,
}: ComposeBoxProps) {

  /* Bridge SmartInput's unified payload → ComposeSubmitPayload */
  function handleSubmit(payload: SmartInputSubmitPayload) {
    onSubmit({
      text:           payload.text,
      attachedDoc:    payload.attachedDoc,
      voiceRecording: payload.voiceRecording,
    });
  }

  return (
    <SmartInput
      value={externalText}
      onChange={onExternalTextChange}
      onSubmit={handleSubmit}
      onModeChange={onTabChange}
      placeholder={placeholder}
      submitLabel={submitLabel}
      disabled={disabled}
      modes={modes}
      maxRows={5}
      layout="compose"
    />
  );
}
