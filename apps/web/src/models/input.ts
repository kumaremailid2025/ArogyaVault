/* ─────────────────────────────────────────────────────────────────
   Input model — unified types for the SmartInput component system
───────────────────────────────────────────────────────────────── */
import type { AttachedDoc, VoiceRecording } from "./user";

/**
 * All supported input modes.
 *
 * - "text"   — keyboard / plain text
 * - "voice"  — microphone via Web Speech API (supports multi-language)
 * - "image"  — camera or photo library (images only)
 * - "attach" — file picker (PDF, Word, image, text)
 */
export type InputMode = "text" | "voice" | "image" | "attach";

/**
 * Unified payload emitted by SmartInput on every submit.
 * Consumers only need to handle one callback signature regardless
 * of which input mode the user chose.
 */
export interface SmartInputSubmitPayload {
  /** Final text — typed, voice transcript, or file caption */
  text: string;
  /** Attached document, null when nothing is attached */
  attachedDoc: AttachedDoc;
  /** Voice metadata (language, original transcript), null if not recorded */
  voiceRecording: VoiceRecording | null;
  /** The mode that was active when the user hit Send */
  mode: InputMode;
}

/**
 * All props accepted by <SmartInput />.
 *
 * The component is intentionally uncontrolled for the voice and attach
 * flows (state lives in dedicated hooks), but the text value is fully
 * controlled to allow parent components to clear / pre-fill it.
 */
export interface SmartInputProps {
  /** Fires when the user submits via any mode */
  onSubmit: (payload: SmartInputSubmitPayload) => void;

  /** Controlled text value (only applies to text mode) */
  value?: string;
  /** Called whenever the text textarea changes */
  onChange?: (value: string) => void;

  /** Placeholder shown in the textarea */
  placeholder?: string;
  /** Label on the submit button */
  submitLabel?: string;
  /** Externally disable the submit button */
  disabled?: boolean;

  /**
   * Which mode buttons to display in the toolbar.
   * Order in this array determines display order.
   * Defaults to all four: ["text", "voice", "image", "attach"].
   */
  modes?: InputMode[];

  /** Auto-focus the textarea on mount */
  autoFocus?: boolean;
  /** Notified when the user switches between modes */
  onModeChange?: (mode: InputMode) => void;

  /**
   * Maximum number of visible text rows before the textarea scrolls.
   * The textarea grows from 1 row up to this limit. Default: 6.
   */
  maxRows?: number;

  /**
   * Visual layout variant.
   * - "chat"    — compact, send button inline in toolbar (default)
   * - "compose" — send button full-width below the toolbar
   */
  layout?: "chat" | "compose";

  /** Additional className applied to the outermost wrapper div */
  className?: string;
}

/* ── Re-exports for convenience ─────────────────────────────────── */
export type { AttachedDoc, VoiceRecording };
