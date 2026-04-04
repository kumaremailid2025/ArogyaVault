/* ─────────────────────────────────────────────────────
   ArogyaLearn — personalized context data
   Recommendations based on user's vault health data.
   In production this would be dynamically generated.
───────────────────────────────────────────────────── */

export type RecommendedTopic = {
  topicId: string;
  reason: string;
  urgency: "high" | "medium" | "low";
};

export type FeaturedTopic = {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  category: string;
  gradient: string;
};

export type TrendingTopic = {
  id: string;
  title: string;
  readers: number;
  category: string;
};

export type ContinueReading = {
  topicId: string;
  progress: number; // 0-100
  lastRead: string;
};

/* ── Personalized recommendations (based on vault health data) ── */
export const RECOMMENDED_TOPICS: RecommendedTopic[] = [
  { topicId: "hba1c-basics", reason: "Your HbA1c is 7.2% — pre-diabetes range", urgency: "high" },
  { topicId: "bp-reading", reason: "Your BP reading is 138/88 mmHg", urgency: "high" },
  { topicId: "iron-anaemia-basics", reason: "Your Hb is 11.8 g/dL — below normal", urgency: "medium" },
  { topicId: "tsh-interpretation", reason: "Your TSH is 5.2 mIU/L — borderline elevated", urgency: "medium" },
  { topicId: "metformin-moa", reason: "You are prescribed Metformin 500 mg", urgency: "low" },
  { topicId: "cbc-interpretation", reason: "Recent CBC uploaded — learn to read it", urgency: "low" },
];

/* ── Featured hero topic ── */
export const FEATURED_TOPIC: FeaturedTopic = {
  id: "hba1c-basics",
  title: "HbA1c: What your number really means",
  subtitle: "Your latest HbA1c is 7.2%. Understand what this means and how to bring it down.",
  readTime: "3 min",
  category: "Lab Values",
  gradient: "from-blue-600 to-indigo-700",
};

/* ── Trending topics ── */
export const TRENDING_TOPICS: TrendingTopic[] = [
  { id: "bp-reading", title: "Reading your blood pressure numbers", readers: 12400, category: "Conditions" },
  { id: "hba1c-basics", title: "HbA1c explained", readers: 9800, category: "Lab Values" },
  { id: "metformin-moa", title: "Metformin: How it works", readers: 7200, category: "Medications" },
  { id: "iron-anaemia-basics", title: "Iron deficiency: Signs & solutions", readers: 6500, category: "Conditions" },
  { id: "glp1-sglt2-comparison", title: "GLP-1 vs SGLT-2 inhibitors", readers: 4100, category: "Research" },
];

/* ── Continue reading (mock user progress) ── */
export const CONTINUE_READING: ContinueReading[] = [
  { topicId: "hba1c-basics", progress: 65, lastRead: "2026-04-02T10:30:00" },
  { topicId: "metformin-moa", progress: 30, lastRead: "2026-03-28T14:15:00" },
];

/* ── Quick lab reference categories for right panel ── */
export const LAB_CATEGORIES = [
  "Diabetes",
  "Thyroid",
  "Blood Count",
  "Kidney",
  "Liver",
  "Cardiac",
] as const;
