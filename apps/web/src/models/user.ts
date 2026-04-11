/**
 * @file user.ts
 * @description Data models for user profile, session state, voice recording,
 * and AI-assistant interactions within the ArogyaVault web app.
 *
 * @packageDocumentation
 * @category Models
 */

import type { ElementType } from "react";

// ─── Voice ──────────────────────────────────────────────────────────────────

/**
 * A supported voice-input language option.
 *
 * @category Models
 */
export type VoiceLanguage = {
  /** BCP-47 language code (e.g. `"hi-IN"`, `"ta-IN"`). */
  code: string;
  /** English display label (e.g. `"Hindi"`). */
  label: string;
  /** Native script label (e.g. `"हिंदी"`). */
  native: string;
};

/**
 * Current state of the voice-capture workflow.
 *
 * - `"idle"` — microphone is inactive.
 * - `"recording"` — actively capturing audio.
 * - `"translating"` — audio is being sent to the transcription API.
 * - `"done"` — transcription complete; result is ready.
 *
 * @category Models
 */
export type VoiceState = "idle" | "recording" | "translating" | "done";

/**
 * The result of a completed voice recording session.
 *
 * @category Models
 */
export type VoiceRecording = {
  /** BCP-47 code of the language spoken during recording. */
  lang: string;
  /** Raw transcribed text returned by the speech-to-text service. */
  original: string;
};

// ─── Dashboard widgets ──────────────────────────────────────────────────────

/**
 * A single stat card displayed on the user's dashboard overview.
 *
 * @category Models
 */
export type QuickStat = {
  /** Lucide icon component for the stat card. */
  icon: ElementType;
  /** Formatted value string (e.g. `"24"`, `"98%"`). */
  value: string;
  /** Short descriptor label (e.g. `"Records"`, `"Health Score"`). */
  label: string;
  /** Secondary sub-label with context (e.g. `"Last 30 days"`). */
  sub: string;
  /** Tailwind background-colour class for the icon badge. */
  color: string;
};

/**
 * A single item in the user's recent activity feed.
 *
 * @category Models
 */
export type ActivityFeedItem = {
  /** Lucide icon component for the activity type. */
  icon: ElementType;
  /** Tailwind text-colour class applied to the icon. */
  color: string;
  /** Human-readable activity description. */
  text: string;
  /** Relative or absolute time string (e.g. `"2h ago"`, `"Yesterday"`). */
  time: string;
};

// ─── ArogyaAI assistant ─────────────────────────────────────────────────────

/**
 * A single message in an ArogyaAI chat thread.
 *
 * @category Models
 */
export type AiMessage = {
  /** Whether the message was sent by the AI assistant or the user. */
  role: "ai" | "user";
  /** Message body text. */
  text: string;
  /**
   * Optional citation label linking the answer back to a source document.
   * Present only on AI messages that reference an uploaded file.
   */
  citation?: string;
};

/**
 * A feature capability card displayed on the ArogyaAI landing panel.
 *
 * @category Models
 */
export type AiFeature = {
  /** Icon identifier string resolved via `resolveIcon()`. */
  icon: ElementType;
  /** Short feature label (e.g. `"Summarise"`). */
  label: string;
  /** One-line feature description. */
  desc: string;
};

// ─── Document attach flow ────────────────────────────────────────────────────

/**
 * Discriminated union representing each step of the document-attach wizard
 * inside the community post composer.
 *
 * Steps progress as:
 * `"select"` → `"preview"` → `"analyzing"` → `"analyzed"`
 *
 * @category Models
 */
export type AttachStep =
  /** Initial state — no file chosen yet. */
  | { step: "select" }
  /** File selected; showing preview before analysis. */
  | { step: "preview"; file: File; previewUrl: string; caption: string }
  /** File uploaded; waiting for AI analysis result. */
  | { step: "analyzing" }
  /** Analysis complete; all extracted fields populated. */
  | {
      step: "analyzed";
      file: File;
      previewUrl: string;
      caption: string;
      /** AI-detected document type (e.g. `"Blood Test Report"`). */
      docType: string;
      /** Full text extracted from the document via OCR / parsing. */
      extractedText: string;
      /** AI-generated one-paragraph summary of the document. */
      summary: string;
    };

/**
 * A document that has been successfully attached to a community post.
 *
 * `null` when no document is attached.
 *
 * @category Models
 */
export type AttachedDoc = {
  /** Original filename of the uploaded document. */
  filename: string;
  /** Object URL for the in-memory document preview. */
  previewUrl: string;
  /** AI-detected document type label. */
  docType: string;
  /** Whether the attached file is a PDF (used to choose the preview renderer). */
  isPdf: boolean;
} | null;
