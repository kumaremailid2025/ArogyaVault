/**
 * Mock endpoint hooks — backed by /mocks/* routes on the backend.
 *
 * These replace the old frontend helpers `mockAiResponse()`,
 * `getPdfAiResponse()` and `generateRephrasings()`.
 */

import { useMutation } from "@tanstack/react-query";

import {
  mocksApi,
  type AiRespondRequest,
  type AiRespondResponse,
  type PdfRespondRequest,
  type PdfRespondResponse,
  type RephraseRequest,
  type RephraseResponse,
} from "@/lib/api/mocks";

export const useSendAiMessage = () =>
  useMutation<AiRespondResponse, Error, AiRespondRequest>({
    mutationFn: (body) => mocksApi.aiRespond(body),
  });

export const useSendPdfQuestion = () =>
  useMutation<PdfRespondResponse, Error, PdfRespondRequest>({
    mutationFn: (body) => mocksApi.pdfRespond(body),
  });

export const useRephrasePost = () =>
  useMutation<RephraseResponse, Error, RephraseRequest>({
    mutationFn: (body) => mocksApi.rephrasePost(body),
  });
