/**
 * Comprehensive mock health data for the Vault dashboard.
 * Covers: Diabetes, Cardiac, Thyroid, CBC, Kidney, Liver panels.
 * 12 months of trend data for each metric.
 */

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

/* ═══════════════════════════════════════════════════════════════════
   HEALTH SCORE
═══════════════════════════════════════════════════════════════════ */

export const HEALTH_SCORE = {
  overall: 72,
  breakdown: [
    { label: "Diabetes", score: 58, color: "#f59e0b" },
    { label: "Cardiac", score: 81, color: "#10b981" },
    { label: "Thyroid", score: 90, color: "#10b981" },
    { label: "Blood", score: 75, color: "#10b981" },
    { label: "Kidney", score: 68, color: "#f59e0b" },
    { label: "Liver", score: 85, color: "#10b981" },
  ],
};

/* ═══════════════════════════════════════════════════════════════════
   VITALS — key metrics shown in left column
═══════════════════════════════════════════════════════════════════ */

export const VITALS: VitalMetric[] = [
  // Diabetes
  { id: "hba1c", label: "HbA1c", value: 7.2, unit: "%", status: "warning", range: "< 6.5%", category: "Diabetes", icon: "🩸", trend: "down" },
  { id: "fasting-glucose", label: "Fasting Glucose", value: 126, unit: "mg/dL", status: "warning", range: "70–100", category: "Diabetes", icon: "💉", trend: "stable" },
  { id: "pp-glucose", label: "PP Glucose", value: 185, unit: "mg/dL", status: "warning", range: "< 140", category: "Diabetes", icon: "📊", trend: "down" },

  // Cardiac
  { id: "bp-systolic", label: "Blood Pressure", value: "128/82", unit: "mmHg", status: "normal", range: "< 130/85", category: "Cardiac", icon: "❤️", trend: "stable" },
  { id: "total-cholesterol", label: "Total Cholesterol", value: 210, unit: "mg/dL", status: "warning", range: "< 200", category: "Cardiac", icon: "🫀", trend: "down" },
  { id: "ldl", label: "LDL", value: 128, unit: "mg/dL", status: "warning", range: "< 100", category: "Cardiac", icon: "⬇️", trend: "down" },
  { id: "hdl", label: "HDL", value: 52, unit: "mg/dL", status: "normal", range: "> 40", category: "Cardiac", icon: "⬆️", trend: "up" },
  { id: "triglycerides", label: "Triglycerides", value: 155, unit: "mg/dL", status: "warning", range: "< 150", category: "Cardiac", icon: "📈", trend: "stable" },

  // Thyroid
  { id: "tsh", label: "TSH", value: 3.8, unit: "mIU/L", status: "normal", range: "0.4–4.0", category: "Thyroid", icon: "🦋", trend: "stable" },
  { id: "t3", label: "T3", value: 1.2, unit: "ng/mL", status: "normal", range: "0.8–2.0", category: "Thyroid", icon: "🔬", trend: "stable" },
  { id: "t4", label: "T4", value: 8.5, unit: "µg/dL", status: "normal", range: "5.0–12.0", category: "Thyroid", icon: "🧪", trend: "stable" },

  // CBC
  { id: "hemoglobin", label: "Hemoglobin", value: 13.8, unit: "g/dL", status: "normal", range: "13.0–17.0", category: "Blood (CBC)", icon: "🩸", trend: "stable" },
  { id: "wbc", label: "WBC", value: 7.2, unit: "×10³/µL", status: "normal", range: "4.5–11.0", category: "Blood (CBC)", icon: "🛡️", trend: "stable" },
  { id: "platelets", label: "Platelets", value: 245, unit: "×10³/µL", status: "normal", range: "150–400", category: "Blood (CBC)", icon: "🔴", trend: "stable" },

  // Kidney
  { id: "creatinine", label: "Creatinine", value: 1.3, unit: "mg/dL", status: "warning", range: "0.7–1.2", category: "Kidney", icon: "🫘", trend: "up" },
  { id: "bun", label: "BUN", value: 22, unit: "mg/dL", status: "normal", range: "7–20", category: "Kidney", icon: "💧", trend: "stable" },
  { id: "egfr", label: "eGFR", value: 72, unit: "mL/min", status: "warning", range: "> 90", category: "Kidney", icon: "⚡", trend: "down" },

  // Liver
  { id: "alt", label: "ALT (SGPT)", value: 32, unit: "U/L", status: "normal", range: "7–56", category: "Liver", icon: "🟤", trend: "stable" },
  { id: "ast", label: "AST (SGOT)", value: 28, unit: "U/L", status: "normal", range: "10–40", category: "Liver", icon: "🟡", trend: "stable" },
  { id: "albumin", label: "Albumin", value: 4.2, unit: "g/dL", status: "normal", range: "3.5–5.5", category: "Liver", icon: "🧬", trend: "stable" },
];

/* ═══════════════════════════════════════════════════════════════════
   TREND DATA — 12 months for charts
═══════════════════════════════════════════════════════════════════ */

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

export const CHART_CONFIGS: ChartConfig[] = [
  {
    id: "hba1c-trend",
    title: "HbA1c Trend",
    category: "Diabetes",
    type: "area",
    unit: "%",
    idealRange: { min: 4.0, max: 6.5 },
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [8.1, 7.9, 7.8, 7.6, 7.5, 7.5, 7.4, 7.3, 7.3, 7.2, 7.2, 7.2][i],
    })),
    series: [
      { key: "value", label: "HbA1c", color: "#f59e0b", refLine: 6.5, refLabel: "Target" },
    ],
  },
  {
    id: "glucose-trend",
    title: "Blood Glucose",
    category: "Diabetes",
    type: "line",
    unit: "mg/dL",
    idealRange: { min: 70, max: 140 },
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [142, 138, 135, 132, 130, 128, 130, 128, 127, 126, 126, 126][i],
      value2: [220, 210, 205, 198, 195, 190, 192, 188, 186, 185, 184, 185][i],
    })),
    series: [
      { key: "value", label: "Fasting", color: "#3b82f6" },
      { key: "value2", label: "Post-Prandial", color: "#ef4444", refLine: 140, refLabel: "Target" },
    ],
  },
  {
    id: "bp-trend",
    title: "Blood Pressure",
    category: "Cardiac",
    type: "line",
    unit: "mmHg",
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [135, 132, 130, 132, 130, 128, 130, 129, 128, 128, 128, 128][i],
      value2: [88, 86, 85, 84, 84, 83, 84, 83, 82, 82, 82, 82][i],
    })),
    series: [
      { key: "value", label: "Systolic", color: "#ef4444", refLine: 130, refLabel: "Target SBP" },
      { key: "value2", label: "Diastolic", color: "#3b82f6", refLine: 85, refLabel: "Target DBP" },
    ],
  },
  {
    id: "cholesterol-trend",
    title: "Lipid Panel",
    category: "Cardiac",
    type: "bar",
    unit: "mg/dL",
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [145, 142, 140, 138, 135, 133, 132, 130, 130, 128, 128, 128][i],
      value2: [42, 44, 44, 46, 48, 48, 50, 50, 51, 52, 52, 52][i],
      value3: [180, 175, 172, 168, 165, 162, 160, 158, 156, 155, 155, 155][i],
    })),
    series: [
      { key: "value", label: "LDL", color: "#ef4444", refLine: 100, refLabel: "LDL Target" },
      { key: "value2", label: "HDL", color: "#10b981" },
      { key: "value3", label: "Triglycerides", color: "#f59e0b", refLine: 150, refLabel: "Trig Target" },
    ],
  },
  {
    id: "tsh-trend",
    title: "Thyroid (TSH)",
    category: "Thyroid",
    type: "area",
    unit: "mIU/L",
    idealRange: { min: 0.4, max: 4.0 },
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [4.5, 4.2, 4.1, 4.0, 3.9, 3.9, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8][i],
    })),
    series: [
      { key: "value", label: "TSH", color: "#8b5cf6" },
    ],
  },
  {
    id: "kidney-trend",
    title: "Kidney Function",
    category: "Kidney",
    type: "composed",
    unit: "",
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [1.1, 1.1, 1.15, 1.18, 1.2, 1.22, 1.24, 1.25, 1.28, 1.3, 1.3, 1.3][i],
      value2: [85, 83, 82, 80, 78, 77, 76, 75, 74, 72, 72, 72][i],
    })),
    series: [
      { key: "value", label: "Creatinine (mg/dL)", color: "#f59e0b", refLine: 1.2, refLabel: "Creat Max" },
      { key: "value2", label: "eGFR (mL/min)", color: "#3b82f6", refLine: 90, refLabel: "eGFR Target" },
    ],
  },
  {
    id: "liver-trend",
    title: "Liver Function",
    category: "Liver",
    type: "bar",
    unit: "U/L",
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [38, 36, 35, 34, 34, 33, 33, 32, 32, 32, 32, 32][i],
      value2: [32, 31, 30, 30, 29, 29, 28, 28, 28, 28, 28, 28][i],
    })),
    series: [
      { key: "value", label: "ALT", color: "#f59e0b", refLine: 56, refLabel: "ALT Max" },
      { key: "value2", label: "AST", color: "#10b981", refLine: 40, refLabel: "AST Max" },
    ],
  },
  {
    id: "cbc-trend",
    title: "Blood Count (CBC)",
    category: "Blood (CBC)",
    type: "line",
    unit: "",
    data: MONTHS.map((m, i) => ({
      month: m,
      value: [13.2, 13.4, 13.5, 13.5, 13.6, 13.6, 13.7, 13.7, 13.8, 13.8, 13.8, 13.8][i],
      value2: [6.8, 7.0, 7.0, 7.1, 7.1, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2, 7.2][i],
    })),
    series: [
      { key: "value", label: "Hemoglobin (g/dL)", color: "#ef4444" },
      { key: "value2", label: "WBC (×10³/µL)", color: "#3b82f6" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MEDICATIONS
═══════════════════════════════════════════════════════════════════ */

export const MEDICATIONS: Medication[] = [
  { name: "Metformin", dose: "500mg", frequency: "Twice daily", since: "Jan 2024" },
  { name: "Atorvastatin", dose: "20mg", frequency: "Once daily (night)", since: "Mar 2024" },
  { name: "Telmisartan", dose: "40mg", frequency: "Once daily (morning)", since: "Jun 2024" },
  { name: "Aspirin", dose: "75mg", frequency: "Once daily", since: "Mar 2024" },
  { name: "Levothyroxine", dose: "50mcg", frequency: "Once daily (empty stomach)", since: "Sep 2025" },
];

/* ═══════════════════════════════════════════════════════════════════
   ALERTS
═══════════════════════════════════════════════════════════════════ */

export const HEALTH_ALERTS: HealthAlert[] = [
  { id: "a1", severity: "warning", message: "HbA1c above target — review diabetes management", metric: "hba1c" },
  { id: "a2", severity: "warning", message: "eGFR declining — monitor kidney function closely", metric: "egfr" },
  { id: "a3", severity: "info", message: "LDL trending down — current statin dose effective", metric: "ldl" },
  { id: "a4", severity: "info", message: "TSH normalizing — thyroid well controlled", metric: "tsh" },
];

/* ═══════════════════════════════════════════════════════════════════
   FILES — 18 mock medical documents
═══════════════════════════════════════════════════════════════════ */

export const VAULT_FILES: MedFile[] = [
  { id: 1, name: "HbA1c Report — Mar 2026.pdf", category: "lab", date: "2026-03-15", size: "245 KB", aiSummary: "HbA1c 7.2%, fasting glucose 126 mg/dL. Slight improvement from previous quarter." },
  { id: 2, name: "Complete Lipid Panel — Mar 2026.pdf", category: "lab", date: "2026-03-15", size: "312 KB", aiSummary: "Total cholesterol 210, LDL 128, HDL 52, Triglycerides 155. LDL still above target." },
  { id: 3, name: "Thyroid Panel — Feb 2026.pdf", category: "lab", date: "2026-02-20", size: "198 KB", aiSummary: "TSH 3.8, T3 1.2, T4 8.5. All within normal range. Thyroid well controlled." },
  { id: 4, name: "Complete Blood Count — Mar 2026.pdf", category: "lab", date: "2026-03-10", size: "276 KB", aiSummary: "Hemoglobin 13.8, WBC 7.2, Platelets 245. All values normal." },
  { id: 5, name: "Kidney Function Test — Mar 2026.pdf", category: "lab", date: "2026-03-15", size: "220 KB", aiSummary: "Creatinine 1.3 (slightly elevated), BUN 22, eGFR 72. Monitor kidney function." },
  { id: 6, name: "Liver Function Test — Mar 2026.pdf", category: "lab", date: "2026-03-15", size: "195 KB", aiSummary: "ALT 32, AST 28, Albumin 4.2. All within normal limits." },
  { id: 7, name: "Fasting Blood Sugar — Feb 2026.pdf", category: "lab", date: "2026-02-10", size: "142 KB", aiSummary: "Fasting glucose 126 mg/dL. Slightly above normal range." },
  { id: 8, name: "ECG Report — Jan 2026.pdf", category: "lab", date: "2026-01-25", size: "450 KB", aiSummary: "Normal sinus rhythm. No ST changes. Rate 72 bpm." },
  { id: 9, name: "2D Echo — Jan 2026.pdf", category: "imaging", date: "2026-01-25", size: "1.2 MB", aiSummary: "EF 60%, normal chamber dimensions, no valve abnormalities." },
  { id: 10, name: "Prescription — Dr. Sharma — Mar 2026.pdf", category: "prescription", date: "2026-03-16", size: "89 KB", aiSummary: "Metformin 500mg BD, Atorvastatin 20mg HS, Telmisartan 40mg OD." },
  { id: 11, name: "Prescription — Dr. Patel — Feb 2026.pdf", category: "prescription", date: "2026-02-21", size: "76 KB", aiSummary: "Levothyroxine 50mcg OD on empty stomach. Follow-up in 3 months." },
  { id: 12, name: "Chest X-Ray — Dec 2025.pdf", category: "imaging", date: "2025-12-15", size: "2.1 MB", aiSummary: "Clear lung fields. Normal cardiac silhouette. No active disease." },
  { id: 13, name: "Urine Routine — Mar 2026.pdf", category: "lab", date: "2026-03-15", size: "165 KB", aiSummary: "Trace protein, otherwise normal. Correlate with kidney function." },
  { id: 14, name: "HbA1c Report — Dec 2025.pdf", category: "lab", date: "2025-12-10", size: "240 KB", aiSummary: "HbA1c 7.3%. Gradual improvement noted." },
  { id: 15, name: "Annual Health Check — Nov 2025.pdf", category: "other", date: "2025-11-20", size: "890 KB", aiSummary: "Comprehensive screening. Key concerns: pre-diabetes management, lipid control." },
  { id: 16, name: "Discharge Summary — Oct 2025.pdf", category: "discharge", date: "2025-10-05", size: "520 KB", aiSummary: "Admitted for hyperglycemia management. Discharge with revised medications." },
  { id: 17, name: "Insurance Claim — Nov 2025.pdf", category: "insurance", date: "2025-11-10", size: "340 KB" },
  { id: 18, name: "Vitamin D & B12 — Jan 2026.pdf", category: "lab", date: "2026-01-15", size: "180 KB", aiSummary: "Vitamin D 22 ng/mL (insufficient), B12 380 pg/mL (normal). Supplement Vitamin D." },
];

/* ═══════════════════════════════════════════════════════════════════
   DRILLDOWN DATA — detailed view for each metric category
═══════════════════════════════════════════════════════════════════ */

export const DRILLDOWN_MAP: Record<string, DrilldownData> = {
  "hba1c": {
    metricId: "hba1c",
    title: "HbA1c — Glycated Hemoglobin",
    subtitle: "3-month average blood sugar control",
    currentValue: "7.2",
    unit: "%",
    status: "warning",
    range: "Normal: < 5.7% | Pre-diabetic: 5.7–6.4% | Diabetic: > 6.5%",
    history: MONTHS.map((m, i) => ({ month: m, value: [8.1, 7.9, 7.8, 7.6, 7.5, 7.5, 7.4, 7.3, 7.3, 7.2, 7.2, 7.2][i] })),
    insights: [
      "Trending downward over 12 months — good progress",
      "Still above 6.5% target — consider medication adjustment",
      "Correlated with improved fasting glucose levels",
      "Recommend dietary review and increased physical activity",
    ],
    relatedMetrics: [
      { label: "Fasting Glucose", value: "126 mg/dL", status: "warning" },
      { label: "PP Glucose", value: "185 mg/dL", status: "warning" },
      { label: "eGFR", value: "72 mL/min", status: "warning" },
    ],
  },
  "fasting-glucose": {
    metricId: "fasting-glucose",
    title: "Fasting Blood Glucose",
    subtitle: "Measured after 8+ hours fasting",
    currentValue: "126",
    unit: "mg/dL",
    status: "warning",
    range: "Normal: 70–100 | Pre-diabetic: 100–125 | Diabetic: > 126",
    history: MONTHS.map((m, i) => ({ month: m, value: [142, 138, 135, 132, 130, 128, 130, 128, 127, 126, 126, 126][i] })),
    insights: [
      "Borderline diabetic range — closely monitor",
      "Trending down from 142 to 126 over 12 months",
      "Metformin appears to be helping control levels",
      "Consider CGMS (continuous glucose monitoring) for better insights",
    ],
    relatedMetrics: [
      { label: "HbA1c", value: "7.2%", status: "warning" },
      { label: "PP Glucose", value: "185 mg/dL", status: "warning" },
      { label: "Creatinine", value: "1.3 mg/dL", status: "warning" },
    ],
  },
  "bp-systolic": {
    metricId: "bp-systolic",
    title: "Blood Pressure",
    subtitle: "Systolic / Diastolic",
    currentValue: "128/82",
    unit: "mmHg",
    status: "normal",
    range: "Normal: < 120/80 | Elevated: 120–129/< 80 | High: ≥ 130/≥ 80",
    history: MONTHS.map((m, i) => ({ month: m, value: [135, 132, 130, 132, 130, 128, 130, 129, 128, 128, 128, 128][i], value2: [88, 86, 85, 84, 84, 83, 84, 83, 82, 82, 82, 82][i] })),
    insights: [
      "Well controlled with Telmisartan 40mg",
      "Systolic reduced from 135 to 128 over 12 months",
      "Diastolic stable around 82 — within target",
      "Continue current medication and salt restriction",
    ],
    relatedMetrics: [
      { label: "Total Cholesterol", value: "210 mg/dL", status: "warning" },
      { label: "LDL", value: "128 mg/dL", status: "warning" },
      { label: "eGFR", value: "72 mL/min", status: "warning" },
    ],
  },
  "total-cholesterol": {
    metricId: "total-cholesterol",
    title: "Total Cholesterol",
    subtitle: "Complete lipid profile overview",
    currentValue: "210",
    unit: "mg/dL",
    status: "warning",
    range: "Desirable: < 200 | Borderline: 200–239 | High: ≥ 240",
    history: MONTHS.map((m, i) => ({ month: m, value: [235, 230, 228, 224, 220, 218, 216, 214, 212, 210, 210, 210][i] })),
    insights: [
      "Borderline high — statin showing effect",
      "Reduced from 235 to 210 over 12 months",
      "LDL remains primary concern at 128",
      "HDL improving — now at 52, target > 40",
    ],
    relatedMetrics: [
      { label: "LDL", value: "128 mg/dL", status: "warning" },
      { label: "HDL", value: "52 mg/dL", status: "normal" },
      { label: "Triglycerides", value: "155 mg/dL", status: "warning" },
    ],
  },
  "creatinine": {
    metricId: "creatinine",
    title: "Serum Creatinine",
    subtitle: "Kidney filtration marker",
    currentValue: "1.3",
    unit: "mg/dL",
    status: "warning",
    range: "Normal: 0.7–1.2 mg/dL",
    history: MONTHS.map((m, i) => ({ month: m, value: [1.1, 1.1, 1.15, 1.18, 1.2, 1.22, 1.24, 1.25, 1.28, 1.3, 1.3, 1.3][i] })),
    insights: [
      "Gradually rising — needs close monitoring",
      "Correlates with declining eGFR trend",
      "Diabetic nephropathy risk — optimize glucose control",
      "Avoid nephrotoxic medications, stay well hydrated",
    ],
    relatedMetrics: [
      { label: "eGFR", value: "72 mL/min", status: "warning" },
      { label: "BUN", value: "22 mg/dL", status: "normal" },
      { label: "Urine Protein", value: "Trace", status: "warning" },
    ],
  },
  "tsh": {
    metricId: "tsh",
    title: "TSH — Thyroid Stimulating Hormone",
    subtitle: "Thyroid function marker",
    currentValue: "3.8",
    unit: "mIU/L",
    status: "normal",
    range: "Normal: 0.4–4.0 mIU/L",
    history: MONTHS.map((m, i) => ({ month: m, value: [4.5, 4.2, 4.1, 4.0, 3.9, 3.9, 3.8, 3.8, 3.8, 3.8, 3.8, 3.8][i] })),
    insights: [
      "TSH now within normal range after Levothyroxine start",
      "Previously subclinical hypothyroid at 4.5",
      "Stable at 3.8 for past 4 months",
      "Continue current Levothyroxine 50mcg dose",
    ],
    relatedMetrics: [
      { label: "T3", value: "1.2 ng/mL", status: "normal" },
      { label: "T4", value: "8.5 µg/dL", status: "normal" },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════════
   FILE Q&A HISTORY — all questions asked across files, newest first
═══════════════════════════════════════════════════════════════════ */

export interface FileQAEntry {
  id: number;
  fileId: number;
  fileName: string;
  fileCategory: MedFile["category"];
  question: string;
  answer: string;
  askedAt: string;
}

export const FILE_QA_HISTORY: FileQAEntry[] = [
  {
    id: 1, fileId: 1, fileName: "HbA1c Report — Mar 2026.pdf", fileCategory: "lab",
    question: "Is my HbA1c improving compared to last time?",
    answer: "Yes, your HbA1c has come down from 7.3% (Dec 2025) to 7.2% (Mar 2026). While still above the 6.5% target, the trend is positive and shows your diabetes management plan is working.",
    askedAt: "2026-04-03T14:22:00",
  },
  {
    id: 2, fileId: 5, fileName: "Kidney Function Test — Mar 2026.pdf", fileCategory: "lab",
    question: "Should I be worried about my creatinine levels?",
    answer: "Your creatinine is 1.3 mg/dL, which is slightly above the normal upper limit of 1.2. Combined with an eGFR of 72 (below the ideal >90), it suggests early kidney stress. Given your diabetes, this needs close monitoring. Discuss with your doctor about optimizing glucose control and staying well hydrated.",
    askedAt: "2026-04-03T13:45:00",
  },
  {
    id: 3, fileId: 2, fileName: "Complete Lipid Panel — Mar 2026.pdf", fileCategory: "lab",
    question: "What does my LDL number mean?",
    answer: "Your LDL is 128 mg/dL. For someone with diabetes and cardiac risk factors, the recommended LDL target is under 100 mg/dL. While your Atorvastatin is helping (LDL was higher previously), your doctor may consider adjusting the dose or adding lifestyle modifications to reach the target.",
    askedAt: "2026-04-02T10:30:00",
  },
  {
    id: 4, fileId: 10, fileName: "Prescription — Dr. Sharma — Mar 2026.pdf", fileCategory: "prescription",
    question: "Can I take Metformin with food?",
    answer: "Yes, Metformin is typically taken with meals to reduce gastrointestinal side effects like nausea or stomach upset. Your prescription shows Metformin 500mg BD (twice daily), so take it with breakfast and dinner for best results.",
    askedAt: "2026-04-01T09:15:00",
  },
  {
    id: 5, fileId: 9, fileName: "2D Echo — Jan 2026.pdf", fileCategory: "imaging",
    question: "Is my heart function normal?",
    answer: "Your 2D Echo shows an ejection fraction (EF) of 60%, which is within the normal range (55-70%). Chamber dimensions are normal and there are no valve abnormalities. Overall, your heart function looks healthy.",
    askedAt: "2026-03-30T16:50:00",
  },
  {
    id: 6, fileId: 3, fileName: "Thyroid Panel — Feb 2026.pdf", fileCategory: "lab",
    question: "Do I still need thyroid medication?",
    answer: "Your TSH is 3.8 mIU/L, which is within the normal range (0.4–4.0) since you started Levothyroxine 50mcg. However, stopping the medication would likely cause TSH to rise again. Continue the medication and discuss with Dr. Patel at your next follow-up.",
    askedAt: "2026-03-28T11:20:00",
  },
  {
    id: 7, fileId: 18, fileName: "Vitamin D & B12 — Jan 2026.pdf", fileCategory: "lab",
    question: "How low is my Vitamin D?",
    answer: "Your Vitamin D level is 22 ng/mL, classified as insufficient (normal is 30-100 ng/mL). This is common in India and can affect bone health, immunity, and mood. Your doctor should prescribe a Vitamin D supplement — typically 60,000 IU weekly for 8 weeks, then monthly maintenance.",
    askedAt: "2026-03-25T14:05:00",
  },
  {
    id: 8, fileId: 8, fileName: "ECG Report — Jan 2026.pdf", fileCategory: "lab",
    question: "Is my heart rhythm normal?",
    answer: "Yes, your ECG shows normal sinus rhythm with a heart rate of 72 bpm. There are no ST segment changes, which means no signs of ischemia or heart strain. This is a reassuring result.",
    askedAt: "2026-03-22T08:40:00",
  },
  {
    id: 9, fileId: 16, fileName: "Discharge Summary — Oct 2025.pdf", fileCategory: "discharge",
    question: "Why was I admitted to the hospital?",
    answer: "You were admitted for hyperglycemia management — meaning your blood sugar levels were too high and needed hospital-level intervention. You were discharged with revised medications, which is the current regimen you're following (Metformin, Atorvastatin, Telmisartan).",
    askedAt: "2026-03-18T17:30:00",
  },
  {
    id: 10, fileId: 15, fileName: "Annual Health Check — Nov 2025.pdf", fileCategory: "other",
    question: "What were the main concerns from my annual checkup?",
    answer: "The comprehensive screening identified two key concerns: pre-diabetes management (your HbA1c and glucose were elevated) and lipid control (cholesterol levels were above target). These have been addressed with your current medications and lifestyle modifications over the past months.",
    askedAt: "2026-03-15T12:10:00",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   CATEGORIES — for filtering and grouping
═══════════════════════════════════════════════════════════════════ */

export const VITAL_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Diabetes", label: "Diabetes" },
  { key: "Cardiac", label: "Cardiac" },
  { key: "Thyroid", label: "Thyroid" },
  { key: "Blood (CBC)", label: "CBC" },
  { key: "Kidney", label: "Kidney" },
  { key: "Liver", label: "Liver" },
] as const;

export const FILE_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "lab", label: "Lab Reports" },
  { key: "prescription", label: "Prescriptions" },
  { key: "imaging", label: "Imaging" },
  { key: "discharge", label: "Discharge" },
  { key: "insurance", label: "Insurance" },
  { key: "other", label: "Other" },
] as const;
