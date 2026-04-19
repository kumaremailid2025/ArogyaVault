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
  /**
   * Full reset — revokes any live preview URLs (including the confirmed
   * `attachedDoc`) and returns to the `select` step with no attached doc.
   * Use for explicit user-driven cancellation.
   */
  resetAttach: () => void;
  /**
   * Reset the in-progress wizard (preview / analyzing / analyzed) back to
   * `select`, but PRESERVE a confirmed `attachedDoc`. Safe to call on
   * input-mode switches — users don't lose their confirmed attachment.
   * Skips URL revocation when the URL is still referenced by `attachedDoc`.
   */
  clearAttachWizard: () => void;
  /**
   * Clear all attach state after a successful submit. Does **not** revoke
   * the object URL — ownership is transferred to the submit consumer, which
   * is now responsible for the URL's lifecycle (e.g., until the file is
   * uploaded to storage and the URL is swapped out).
   */
  clearAfterSubmit: () => void;
  /**
   * Remove the confirmed `attachedDoc` and revoke its preview URL (unless
   * it's still referenced by the in-progress `attachState`).
   */
  removeAttachedDoc: () => void;
  /**
   * Send the file to the AI analysis endpoint and transition to `analyzed`.
   * Falls back to `preview` on network error.
   */
  handleAnalyze: (file: File, previewUrl: string, caption: string) => Promise<void>;
  /** Mark the analyzed document as the active attached document. */
  handleUseAttachment: (file: File, previewUrl: string, docType: string, caption: string) => void;
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

  /** Extract the in-progress wizard URL, if any. */
  const wizardUrl = (s: AttachStep): string | null =>
    s.step === "preview" || s.step === "analyzed" ? s.previewUrl : null;

  const handleFileSelect = (file: File) => {
    /* If the user reopens the picker while a wizard is mid-flow (and the
       URL isn't already owned by a confirmed attachedDoc), revoke the old
       one before creating a fresh one — avoids leaking the previous URL. */
    const prev = wizardUrl(attachState);
    if (prev && (!attachedDoc || attachedDoc.previewUrl !== prev)) {
      URL.revokeObjectURL(prev);
    }
    const previewUrl = URL.createObjectURL(file);
    setAttachState({ step: "preview", file, previewUrl, caption: "" });
  };

  const resetAttach = () => {
    /* Revoke every unique URL we're currently holding. */
    const urls = new Set<string>();
    const w = wizardUrl(attachState);
    if (w) urls.add(w);
    if (attachedDoc) urls.add(attachedDoc.previewUrl);
    urls.forEach((u) => URL.revokeObjectURL(u));
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  };

  const clearAttachWizard = () => {
    /* Reset only the wizard. Keep `attachedDoc` intact so it survives
       mode switches. Only revoke the wizard URL if it's NOT the same URL
       that `attachedDoc` is referencing. */
    const w = wizardUrl(attachState);
    if (w && (!attachedDoc || attachedDoc.previewUrl !== w)) {
      URL.revokeObjectURL(w);
    }
    setAttachState({ step: "select" });
  };

  const clearAfterSubmit = () => {
    /* Hand URL ownership off to the submit consumer. Do not revoke — the
       parent is now responsible for the object URL's lifecycle. */
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  };

  const removeAttachedDoc = () => {
    if (attachedDoc) {
      const w = wizardUrl(attachState);
      /* Don't revoke a URL still referenced by the in-progress wizard. */
      if (w !== attachedDoc.previewUrl) {
        URL.revokeObjectURL(attachedDoc.previewUrl);
      }
    }
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

  const handleUseAttachment = (
    file: File,
    previewUrl: string,
    docType: string,
    caption: string,
  ) => {
    /* If we're replacing a previously confirmed attachment whose URL is
       different, revoke the old URL before we drop the reference. */
    setAttachedDoc((prev) => {
      if (prev && prev.previewUrl !== previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      const trimmed = caption.trim();
      return {
        filename: file.name,
        previewUrl,
        docType,
        isPdf: file.type === "application/pdf",
        ...(trimmed ? { caption: trimmed } : {}),
      };
    });
  };

  return {
    attachState,
    setAttachState,
    attachedDoc,
    setAttachedDoc,
    handleFileSelect,
    resetAttach,
    clearAttachWizard,
    clearAfterSubmit,
    removeAttachedDoc,
    handleAnalyze,
    handleUseAttachment,
  };
};
