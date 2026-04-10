/**
 * Vault Health Data — TYPES ONLY
 *
 * All vault health data (vitals, charts, files, drilldowns, Q&A history) now
 * lives in the backend store. Frontend consumes it via `useVaultHealth()`,
 * which returns the user-scoped dataset from the `AppDataProvider` bootstrap.
 *
 * For Kumar (usr_001) the hook returns the full seeded dataset.
 * For every other (invited/new) user it returns empty collections.
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

export interface VitalMetric {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  status: "normal" | "warning" | "critical";
  /** Normal range string, e.g. "70–100 mg/dL" */
  range: string;
  category: string;
  icon: string;
  trend?: "up" | "down" | "stable";
}

export interface TrendPoint {
  month: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface ChartConfig {
  id: string;
  title: string;
  category: string;
  type: "line" | "area" | "bar" | "composed";
  data: TrendPoint[];
  series: { key: string; label: string; color: string; refLine?: number; refLabel?: string }[];
  unit: string;
  /** Ideal range shown as shaded area */
  idealRange?: { min: number; max: number };
}

export interface MedFile {
  id: number;
  name: string;
  category: "lab" | "prescription" | "imaging" | "discharge" | "insurance" | "other";
  date: string;
  size: string;
  aiSummary?: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  since: string;
}

export interface HealthAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  metric?: string;
}

export interface DrilldownData {
  metricId: string;
  title: string;
  subtitle: string;
  currentValue: string;
  unit: string;
  status: "normal" | "warning" | "critical";
  range: string;
  history: TrendPoint[];
  insights: string[];
  relatedMetrics: { label: string; value: string; status: "normal" | "warning" | "critical" }[];
}

export interface FileQAEntry {
  id: number;
  fileId: number;
  fileName: string;
  fileCategory: MedFile["category"];
  question: string;
  answer: string;
  askedAt: string;
}

export interface HealthScore {
  overall: number;
  breakdown: { label: string; score: number; color: string }[];
}

export interface CategoryOption {
  key: string;
  label: string;
}

/* ═══════════════════════════════════════════════════════════════════
   HOOK — returns the entire vault-health dataset for the current user
═══════════════════════════════════════════════════════════════════ */

interface VaultHealthBundle {
  HEALTH_SCORE: HealthScore;
  VITALS: VitalMetric[];
  CHART_CONFIGS: ChartConfig[];
  MEDICATIONS: Medication[];
  HEALTH_ALERTS: HealthAlert[];
  VAULT_FILES: MedFile[];
  DRILLDOWN_MAP: Record<string, DrilldownData>;
  FILE_QA_HISTORY: FileQAEntry[];
  VITAL_CATEGORIES: readonly CategoryOption[];
  FILE_CATEGORIES: readonly CategoryOption[];
}

const EMPTY_HEALTH_SCORE: HealthScore = { overall: 0, breakdown: [] };

export const useVaultHealth = (): VaultHealthBundle => {
  const { data } = useAppDataContext();
  const src = (data.vaultHealth || {}) as Record<string, unknown>;
  return {
    HEALTH_SCORE: (src.HEALTH_SCORE as HealthScore) ?? EMPTY_HEALTH_SCORE,
    VITALS: (src.VITALS as VitalMetric[]) ?? [],
    CHART_CONFIGS: (src.CHART_CONFIGS as ChartConfig[]) ?? [],
    MEDICATIONS: (src.MEDICATIONS as Medication[]) ?? [],
    HEALTH_ALERTS: (src.HEALTH_ALERTS as HealthAlert[]) ?? [],
    VAULT_FILES: (src.VAULT_FILES as MedFile[]) ?? [],
    DRILLDOWN_MAP:
      (src.DRILLDOWN_MAP as Record<string, DrilldownData>) ?? {},
    FILE_QA_HISTORY: (src.FILE_QA_HISTORY as FileQAEntry[]) ?? [],
    VITAL_CATEGORIES: (src.VITAL_CATEGORIES as CategoryOption[]) ?? [],
    FILE_CATEGORIES: (src.FILE_CATEGORIES as CategoryOption[]) ?? [],
  };
};
