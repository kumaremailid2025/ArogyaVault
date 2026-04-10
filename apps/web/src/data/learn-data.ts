/**
 * Learn Data — hook-only (data lives in backend store).
 *
 * Icon fields are stored as strings in the seed JSON and must be resolved
 * via `resolveIcon()` from `@/lib/icon-resolver` at render time.
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type {
  EduTopic,
  EduCategory,
  DrugInteraction,
  LabRef,
  EduLevelConfig,
  EduLevel,
} from "@/models/learn";

/* Raw shapes: icons arrive as string names rather than React components */
type RawEduTopic = Omit<EduTopic, "categoryIcon"> & { categoryIcon: string };
type RawEduCategory = Omit<EduCategory, "icon"> & { icon: string };

interface LearnBundle {
  EDU_TOPICS: RawEduTopic[];
  EDU_CATEGORIES: RawEduCategory[];
  DRUG_INTERACTIONS: Record<string, DrugInteraction>;
  LAB_QUICK_REF: LabRef[];
  LEVEL_CONFIG: Record<EduLevel, EduLevelConfig>;
}

const EMPTY_LEVEL_CONFIG: Record<EduLevel, EduLevelConfig> = {
  patient: {
    label: "Patient",
    desc: "",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
  },
  advanced: {
    label: "Advanced",
    desc: "",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
  },
  clinical: {
    label: "Clinical",
    desc: "",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-300",
  },
};

export const useLearn = (): LearnBundle => {
  const { data } = useAppDataContext();
  const src = (data.learn || {}) as Record<string, unknown>;
  return {
    EDU_TOPICS: (src.EDU_TOPICS as RawEduTopic[]) ?? [],
    EDU_CATEGORIES: (src.EDU_CATEGORIES as RawEduCategory[]) ?? [],
    DRUG_INTERACTIONS:
      (src.DRUG_INTERACTIONS as Record<string, DrugInteraction>) ?? {},
    LAB_QUICK_REF: (src.LAB_QUICK_REF as LabRef[]) ?? [],
    LEVEL_CONFIG:
      (src.LEVEL_CONFIG as Record<EduLevel, EduLevelConfig>) ??
      EMPTY_LEVEL_CONFIG,
  };
};
