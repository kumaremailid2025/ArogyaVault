/**
 * PDF Library Data — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";

export interface PdfLibraryEntry {
  name: string;
  pages: number;
  size: string;
  uploadedAt: string;
}

interface PdfLibraryBundle {
  MOCK_PDFS: PdfLibraryEntry[];
  SUGGESTION_QUESTIONS: string[];
}

export const usePdfLibrary = (): PdfLibraryBundle => {
  const { data } = useAppDataContext();
  const src = (data.pdfLibrary || {}) as Record<string, unknown>;
  return {
    MOCK_PDFS: (src.MOCK_PDFS as PdfLibraryEntry[]) ?? [],
    SUGGESTION_QUESTIONS: (src.SUGGESTION_QUESTIONS as string[]) ?? [],
  };
};
