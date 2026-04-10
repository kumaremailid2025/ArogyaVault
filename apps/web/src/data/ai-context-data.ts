/**
 * AI Context Data — hook-only (data lives in backend store).
 * Returns smart suggestions, chat sessions, capabilities and contextual cards
 * for the current user. Empty for invitees / non-seed users.
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

export interface AiContextCard {
  id: string;
  type: "alert" | "insight" | "recent-file" | "trend";
  title: string;
  description: string;
  suggestedQuestion: string;
  severity?: "normal" | "warning" | "critical";
  meta?: string;
}

export interface AiCapability {
  id: string;
  icon: string;
  label: string;
  description: string;
  exampleQuestion: string;
  color: string;
}

export interface SmartSuggestion {
  text: string;
  reason: string;
  priority: number;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  date: string;
  tags: string[];
}

interface AiContextBundle {
  AI_CAPABILITIES: AiCapability[];
  AI_CONTEXT_CARDS: AiContextCard[];
  SMART_SUGGESTIONS: SmartSuggestion[];
  CHAT_SESSIONS: ChatSession[];
}

export const useAiContext = (): AiContextBundle => {
  const { data } = useAppDataContext();
  const src = (data.aiContext || {}) as Record<string, unknown>;
  return {
    AI_CAPABILITIES: (src.AI_CAPABILITIES as AiCapability[]) ?? [],
    AI_CONTEXT_CARDS: (src.AI_CONTEXT_CARDS as AiContextCard[]) ?? [],
    SMART_SUGGESTIONS: (src.SMART_SUGGESTIONS as SmartSuggestion[]) ?? [],
    CHAT_SESSIONS: (src.CHAT_SESSIONS as ChatSession[]) ?? [],
  };
};
