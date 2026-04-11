/**
 * Drug Suggestions — static reference data from backend.
 *
 * Provides the COMMON_DRUGS quick-add list and SEVERITY_CONFIG styling
 * for the drug interaction checker.
 */

"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { useAppDataContext } from "@/providers/appdata-provider";
import { resolveIcon } from "@/lib/icon-resolver";

export type DrugSeverityKey = "none" | "minor" | "moderate" | "major" | "unknown";

export interface SeverityConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  label: string;
}

interface RawSeverityConfig {
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
}

interface DrugSuggestionsBundle {
  COMMON_DRUGS: string[];
  SEVERITY_CONFIG: Record<DrugSeverityKey, SeverityConfig>;
}

const EMPTY_SEVERITY: SeverityConfig = {
  icon: resolveIcon("InfoIcon"),
  color: "",
  bg: "",
  border: "",
  label: "",
};

const EMPTY_BUNDLE: DrugSuggestionsBundle = {
  COMMON_DRUGS: [],
  SEVERITY_CONFIG: {
    none: EMPTY_SEVERITY,
    minor: EMPTY_SEVERITY,
    moderate: EMPTY_SEVERITY,
    major: EMPTY_SEVERITY,
    unknown: EMPTY_SEVERITY,
  },
};

export const useDrugSuggestions = (): DrugSuggestionsBundle => {
  const { data } = useAppDataContext();
  /* Depend on the raw slice reference — NOT on a freshly-constructed
   * `{} ` fallback, which would bust the memo every render. */
  const raw = data.drugSuggestions;

  return React.useMemo(() => {
    const src = (raw || {}) as Record<string, unknown>;
    const rawSeverity = (src.SEVERITY_CONFIG || {}) as Record<string, RawSeverityConfig>;
    if (Object.keys(rawSeverity).length === 0) return EMPTY_BUNDLE;

    const severity: Record<DrugSeverityKey, SeverityConfig> = { ...EMPTY_BUNDLE.SEVERITY_CONFIG };
    (["none", "minor", "moderate", "major", "unknown"] as const).forEach((k) => {
      const v = rawSeverity[k];
      if (v) severity[k] = { ...v, icon: resolveIcon(v.icon) };
    });

    return {
      COMMON_DRUGS: (src.COMMON_DRUGS as string[]) ?? [],
      SEVERITY_CONFIG: severity,
    };
  }, [raw]);
};
