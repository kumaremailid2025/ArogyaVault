/* ─────────────────────────────────────────────────────
   ArogyaLearn data models
───────────────────────────────────────────────────── */
import type { ElementType } from "react";

export type EduLevel = "patient" | "advanced" | "clinical";

export type EduTopic = {
  id: string;
  title: string;
  category: string;
  categoryIcon: ElementType;
  categoryColor: string;
  levels: EduLevel[];
  readTime: string;
  summary: string;
  keyFacts: string[];
  source: string;
  sourceLabel: string;
  aiPerspective: string;
};

export type EduCategory = {
  id: string;
  label: string;
  icon: ElementType;
  color: string;
};

export type DrugSeverity = "none" | "minor" | "moderate" | "major";

export type DrugInteraction = {
  severity: DrugSeverity;
  effect: string;
  advice: string;
};

export type LabRef = {
  test: string;
  normal: string;
  prediabetes: string;
  diabetes: string;
  unit: string;
};

export type EduLevelConfig = {
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
};

export type MedSystem = {
  id: string;
  name: string;
  origin: string;
  color: string;
  bg: string;
  border: string;
  icon: ElementType;
  principles: string[];
  strengths: string[];
  limitations: string[];
  integration: string;
  keyPractices: string[];
  govtRecognition: string;
};

export type BodyRegion =
  | "head"
  | "chest"
  | "abdomen"
  | "musculo"
  | "systemic"
  | "neuro"
  | "repro";

export type Department = {
  id: string;
  name: string;
  bodyRegion: BodyRegion;
  icon: ElementType;
  color: string;
  bg: string;
  focus: string;
  conditions: string[];
  keyProcedures: string[];
  anatomy: string;
};

export type BodyRegionDef = {
  id: BodyRegion;
  label: string;
  depts: string[];
};

export type PdfMessage = {
  role: "user" | "ai";
  text: string;
  citations?: string[];
  related?: string[];
};
