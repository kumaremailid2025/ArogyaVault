/**
 * Voice Languages — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { VoiceLanguage } from "@/models/user";

interface VoiceLanguagesBundle {
  VOICE_LANGUAGES: VoiceLanguage[];
}

export const useVoiceLanguages = (): VoiceLanguagesBundle => {
  const { data } = useAppDataContext();
  const src = (data.voiceLanguages || {}) as Record<string, unknown>;
  return {
    VOICE_LANGUAGES: (src.VOICE_LANGUAGES as VoiceLanguage[]) ?? [],
  };
};
