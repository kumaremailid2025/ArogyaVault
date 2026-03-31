/* ─────────────────────────────────────────────────────
   User / session data models
───────────────────────────────────────────────────── */
import type { ElementType } from "react";

export type VoiceLanguage = {
  code: string;
  label: string;
  native: string;
};

export type VoiceState = "idle" | "recording" | "translating" | "done";

export type VoiceRecording = {
  lang: string;
  original: string;
};

export type QuickStat = {
  icon: ElementType;
  value: string;
  label: string;
  sub: string;
  color: string;
};

export type ActivityFeedItem = {
  icon: ElementType;
  color: string;
  text: string;
  time: string;
};

export type AiMessage = {
  role: "ai" | "user";
  text: string;
  citation?: string;
};

export type AiFeature = {
  icon: ElementType;
  label: string;
  desc: string;
};

/* Attach-flow steps */
export type AttachStep =
  | { step: "select" }
  | { step: "preview"; file: File; previewUrl: string; caption: string }
  | { step: "analyzing" }
  | {
      step: "analyzed";
      file: File;
      previewUrl: string;
      caption: string;
      docType: string;
      extractedText: string;
      summary: string;
    };

export type AttachedDoc = {
  filename: string;
  previewUrl: string;
  docType: string;
  isPdf: boolean;
} | null;
