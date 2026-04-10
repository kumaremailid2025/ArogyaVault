/**
 * Mocks API — stub generators for AI chat, PDF Q&A and post rephrasings.
 *
 * Backed by the backend `/mocks/*` routes which run simple keyword-based
 * response banks loaded from seed JSON. These replace the frontend utility
 * functions `mockAiResponse()`, `getPdfAiResponse()` and `generateRephrasings()`.
 */

import { apiClient } from "./client";

/* ── AI respond ─────────────────────────────────────────────────────── */

export interface AiRespondRequest {
  query: string;
}

export interface AiRespondResponse {
  role: "ai";
  text: string;
  list?: string[];
  citations?: string[];
  note?: string;
}

/* ── PDF respond ────────────────────────────────────────────────────── */

export interface PdfRespondRequest {
  question: string;
  docName: string;
}

export interface PdfRespondResponse {
  role: "ai";
  text: string;
  citations?: string[];
  related?: string[];
}

/* ── Post rephrase ──────────────────────────────────────────────────── */

export interface RephraseRequest {
  text: string;
}

export interface RephraseResponse {
  formal: string;
  concise: string;
}

export const mocksApi = {
  aiRespond: (body: AiRespondRequest) =>
    apiClient<AiRespondResponse>("/mocks/ai/respond", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  pdfRespond: (body: PdfRespondRequest) =>
    apiClient<PdfRespondResponse>("/mocks/pdf/respond", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  rephrasePost: (body: RephraseRequest) =>
    apiClient<RephraseResponse>("/mocks/posts/rephrase", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
