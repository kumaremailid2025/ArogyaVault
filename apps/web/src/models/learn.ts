/**
 * @file learn.ts
 * @description Data models for the ArogyaLearn health-education feature.
 *
 * These types are consumed by the learn data layer (`/data/learn-data.ts`) and
 * all components that render educational content, drug interactions, lab
 * references, and body-system department data.
 *
 * @packageDocumentation
 * @category Models
 */

import type { ElementType } from "react";

// ─── Education ──────────────────────────────────────────────────────────────

/**
 * Reading-level tiers for an educational article.
 *
 * - `"patient"` — plain-language summary suitable for a general audience.
 * - `"advanced"` — moderate detail; assumes basic health literacy.
 * - `"clinical"` — full clinical detail; intended for healthcare providers.
 *
 * @category Models
 */
export type EduLevel = "patient" | "advanced" | "clinical";

/**
 * A single educational topic card in the ArogyaLearn library.
 *
 * @category Models
 */
export type EduTopic = {
  /** Unique slug identifier (e.g. `"diabetes-type2"`). */
  id: string;
  /** Display title of the article. */
  title: string;
  /** Category label (e.g. `"Endocrinology"`). */
  category: string;
  /** Lucide icon component used for the category badge. */
  categoryIcon: ElementType;
  /** Tailwind colour class for the category badge (e.g. `"text-blue-500"`). */
  categoryColor: string;
  /** Which reading levels this topic is available in. */
  levels: EduLevel[];
  /** Human-readable estimated read time (e.g. `"5 min"`). */
  readTime: string;
  /** One-sentence summary shown in the topic card. */
  summary: string;
  /** Bullet-point key facts shown in the detail view. */
  keyFacts: string[];
  /** URL of the primary source document or study. */
  source: string;
  /** Display label for the source link. */
  sourceLabel: string;
  /** ArogyaAI-generated perspective paragraph. */
  aiPerspective: string;
};

/**
 * A category entry used to filter the ArogyaLearn topic list.
 *
 * @category Models
 */
export type EduCategory = {
  /** Unique identifier matching `EduTopic.category` values. */
  id: string;
  /** Human-readable label rendered in the filter pill. */
  label: string;
  /** Lucide icon component for the pill. */
  icon: ElementType;
  /** Tailwind colour class applied to the icon. */
  color: string;
};

// ─── Drug interactions ──────────────────────────────────────────────────────

/**
 * Severity tier of a drug–drug interaction.
 *
 * - `"none"` — no clinically significant interaction.
 * - `"minor"` — minimal effect; monitoring recommended.
 * - `"moderate"` — may require dose adjustment or closer monitoring.
 * - `"major"` — serious risk; combination should generally be avoided.
 *
 * @category Models
 */
export type DrugSeverity = "none" | "minor" | "moderate" | "major";

/**
 * A drug–drug interaction entry.
 *
 * @category Models
 */
export type DrugInteraction = {
  /** Clinical severity of the interaction. */
  severity: DrugSeverity;
  /** Plain-language description of the interaction effect. */
  effect: string;
  /** Recommended clinical action or patient advice. */
  advice: string;
};

// ─── Lab references ─────────────────────────────────────────────────────────

/**
 * Reference range row for a single lab test, broken down by diabetes status.
 *
 * @category Models
 */
export type LabRef = {
  /** Name of the lab test (e.g. `"Fasting Blood Glucose"`). */
  test: string;
  /** Normal reference range string (e.g. `"70–99 mg/dL"`). */
  normal: string;
  /** Pre-diabetes range string. */
  prediabetes: string;
  /** Diabetes diagnostic threshold string. */
  diabetes: string;
  /** Measurement unit (e.g. `"mg/dL"`). */
  unit: string;
};

// ─── Education level config ─────────────────────────────────────────────────

/**
 * Display configuration for a single {@link EduLevel} reading tier.
 *
 * @category Models
 */
export type EduLevelConfig = {
  /** Short label shown in the level selector (e.g. `"Patient"`). */
  label: string;
  /** One-line description of the audience. */
  desc: string;
  /** Tailwind text-colour class for the active state. */
  color: string;
  /** Tailwind background-colour class for the active state. */
  bg: string;
  /** Tailwind border-colour class for the active state. */
  border: string;
};

// ─── Medical systems ────────────────────────────────────────────────────────

/**
 * A traditional or modern medical system entry (Allopathy, Ayurveda, etc.).
 *
 * @category Models
 */
export type MedSystem = {
  /** Unique identifier slug. */
  id: string;
  /** Display name (e.g. `"Ayurveda"`). */
  name: string;
  /** Geographic/cultural origin (e.g. `"India, ~1500 BCE"`). */
  origin: string;
  /** Tailwind text-colour class. */
  color: string;
  /** Tailwind background-colour class. */
  bg: string;
  /** Tailwind border-colour class. */
  border: string;
  /** Lucide icon component used in the card header. */
  icon: ElementType;
  /** Short list of core philosophical principles. */
  principles: string[];
  /** Documented clinical strengths. */
  strengths: string[];
  /** Known limitations or caveats. */
  limitations: string[];
  /** How this system integrates with or complements others. */
  integration: string;
  /** Representative practices or treatment modalities. */
  keyPractices: string[];
  /** Government / regulatory recognition status. */
  govtRecognition: string;
};

// ─── Body regions & departments ─────────────────────────────────────────────

/**
 * High-level anatomical body region identifier.
 *
 * Used to group hospital departments in the ArogyaLearn department explorer.
 *
 * @category Models
 */
export type BodyRegion =
  | "head"
  | "chest"
  | "abdomen"
  | "musculo"
  | "systemic"
  | "neuro"
  | "repro";

/**
 * A hospital department / medical specialty entry.
 *
 * @category Models
 */
export type Department = {
  /** Unique identifier slug (e.g. `"cardiology"`). */
  id: string;
  /** Display name (e.g. `"Cardiology"`). */
  name: string;
  /** Which body region this department belongs to. */
  bodyRegion: BodyRegion;
  /** Lucide icon component for the department card. */
  icon: ElementType;
  /** Tailwind text-colour class. */
  color: string;
  /** Tailwind background-colour class. */
  bg: string;
  /** One-line description of the department's focus area. */
  focus: string;
  /** Conditions commonly treated by this department. */
  conditions: string[];
  /** Key procedures performed. */
  keyProcedures: string[];
  /** Brief anatomical context paragraph. */
  anatomy: string;
};

/**
 * Maps a {@link BodyRegion} to the department IDs it contains.
 *
 * Used to power the body-map filter in the department explorer.
 *
 * @category Models
 */
export type BodyRegionDef = {
  /** Body region identifier. */
  id: BodyRegion;
  /** Human-readable label shown in the map overlay. */
  label: string;
  /** List of {@link Department} `id` values belonging to this region. */
  depts: string[];
};

// ─── PDF Q&A chat ────────────────────────────────────────────────────────────

/**
 * A single message in the ArogyaLearn document Q&A chat.
 *
 * @category Models
 */
export type PdfMessage = {
  /** Whether the message was sent by the user or generated by ArogyaAI. */
  role: "user" | "ai";
  /** Message body text. */
  text: string;
  /**
   * Page or section citations extracted from the source document.
   * Only present on AI messages.
   */
  citations?: string[];
  /**
   * Related topic slugs suggested by the AI as follow-up reading.
   * Only present on AI messages.
   */
  related?: string[];
};
