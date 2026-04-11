"use client";

/**
 * @file use-file-attach.ts
 * @description React hook for the full file-attach → preview → AI-analyse → use workflow.
 *
 * @packageDocumentation
 * @category Hooks
 */

import * as React from "react";
import type { AttachStep, AttachedDoc } from "@/models/user";

export type { AttachStep, AttachedDoc };

/**
 * Return value of the {@link useFileAttach} hook.
 *
 * @category Hooks
 */
export interface UseFileAttachReturn {
  /** Current step in the attach flow (select → preview → analyzing → analyzed). */
  attachState: AttachStep;
  /** Setter for `attachState`. */
  setAttachState: React.Dispatch<React.SetStateAction<AttachStep>>;
  /** The document that has been confirmed for use, or `null` if none. */
  attachedDoc: AttachedDoc;
  /** Setter for `attachedDoc`. */
  setAttachedDoc: React.Dispatch<React.SetStateAction<AttachedDoc>>;
  /** Transition to the `preview` step with an object URL for the selected file. */
  handleFileSelect: (file: File) => void;
  /** Revoke the object URL and reset all attach state back to `select`. */
  resetAttach: () => void;
  /**
   * Send the file to the AI analysis endpoint and transition to `analyzed`.
   * Falls back to `preview` on network error.
   */
  handleAnalyze: (file: File, previewUrl: string, caption: string) => Promise<void>;
  /** Mark the analyzed document as the active attached document. */
  handleUseAttachment: (file: File, previewUrl: string, docType: string) => void;
}

/**
 * Encapsulates the full file-attach → preview → AI-analyse → use flow.
 *
 * Calls `POST /api/analyze-image` with `{ filename, mimeType }`.
 * In production this should be backed by a real Vision / OCR API.
 *
 * @returns All state, setters, and handlers needed to drive the attach UI.
 *
 * @example
 * ```tsx
 * const { attachState, handleFileSelect, resetAttach } = useFileAttach();
 * ```
 *
 * @category Hooks
 */
export const useFileAttach = (): UseFileAttachReturn => {
  const [attachState, setAttachState] = React.useState<AttachStep>({ step: "select" });
  const [attachedDoc, setAttachedDoc] = React.useState<AttachedDoc>(null);

  const handleFileSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setAttachState({ step: "preview", file, previewUrl, caption: "" });
  };

  const resetAttach = () => {
    /* Revoke any object URL to prevent memory leaks */
    if (attachState.step === "preview" || attachState.step === "analyzed") {
      URL.revokeObjectURL(attachState.previewUrl);
    }
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  };

  const handleAnalyze = async (file: File, previewUrl: string, caption: string) => {
    setAttachState({ step: "analyzing" });
    try {
      const res  = await fetch("/api/analyze-image", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ filename: file.name, mimeType: file.type }),
      });
      const data = await res.json() as { docType: string; extractedText: string; summary: string };
      setAttachState({ step: "analyzed", file, previewUrl, caption, ...data });
    } catch {
      setAttachState({ step: "preview", file, previewUrl, caption });
    }
  };

  const handleUseAttachment = (file: File, previewUrl: string, docType: string) => {
    setAttachedDoc({
      filename:   file.name,
      previewUrl,
      docType,
      isPdf: file.type === "application/pdf",
    });
  };

  return {
    attachState,
    setAttachState,
    attachedDoc,
    setAttachedDoc,
    handleFileSelect,
    resetAttach,
    handleAnalyze,
    handleUseAttachment,
  };
};
