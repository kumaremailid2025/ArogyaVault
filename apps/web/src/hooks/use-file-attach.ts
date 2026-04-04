"use client";
import * as React from "react";
import type { AttachStep, AttachedDoc } from "@/models/user";

export type { AttachStep, AttachedDoc };

export interface UseFileAttachReturn {
  attachState: AttachStep;
  setAttachState: React.Dispatch<React.SetStateAction<AttachStep>>;
  attachedDoc: AttachedDoc;
  setAttachedDoc: React.Dispatch<React.SetStateAction<AttachedDoc>>;
  handleFileSelect: (file: File) => void;
  resetAttach: () => void;
  handleAnalyze: (file: File, previewUrl: string, caption: string) => Promise<void>;
  handleUseAttachment: (file: File, previewUrl: string, docType: string) => void;
}

/**
 * Encapsulates the full file-attach → preview → AI-analyse → use flow.
 *
 * Calls POST /api/analyze-image with { filename, mimeType }.
 * In production this should call a real Vision / OCR API.
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
