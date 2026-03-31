import {
  FileTextIcon, UsersIcon, ClockIcon, BrainCircuitIcon,
  UserPlusIcon, EyeIcon, HeartPulseIcon, TrendingUpIcon,
  BookOpenIcon, ShieldCheckIcon,
} from "lucide-react";
import type { QuickStat, ActivityFeedItem, AiMessage, AiFeature } from "@/models/user";

export const QUICK_STATS: QuickStat[] = [
  { icon: FileTextIcon,     value: "0", label: "Documents",    sub: "Upload your first",       color: "text-primary"       },
  { icon: UsersIcon,        value: "3", label: "Groups",        sub: "Family & doctors",        color: "text-emerald-500"   },
  { icon: ClockIcon,        value: "—", label: "Last Upload",   sub: "Nothing yet",             color: "text-amber-500"     },
  { icon: BrainCircuitIcon, value: "0", label: "AI Sessions",   sub: "Ask your first question", color: "text-violet-500"    },
];

export const ACTIVITY_FEED: ActivityFeedItem[] = [
  { icon: UserPlusIcon, color: "bg-emerald-100 text-emerald-600", text: "You joined ArogyaVault",       time: "Just now"   },
  { icon: UsersIcon,    color: "bg-blue-100 text-blue-600",       text: "Group linked with Ravi Kumar",  time: "2 days ago" },
  { icon: UsersIcon,    color: "bg-amber-100 text-amber-600",     text: "Dr. Sharma's Clinic connected", time: "3 days ago" },
  { icon: EyeIcon,      color: "bg-violet-100 text-violet-600",   text: "Dr. Sharma viewed your group",  time: "3 days ago" },
];

export const AI_MESSAGES: AiMessage[] = [
  { role: "ai",   text: "Hello Kumar 👋 I'm ArogyaAI, your personal health assistant. I can answer questions about your records, explain lab values, summarise medications, and spot health trends. What would you like to know?" },
  { role: "user", text: "What medications am I currently on?" },
  { role: "ai",   text: "Based on your records: Metformin 500mg twice daily and Amlodipine 5mg once daily. Both were prescribed by Dr. Suresh Reddy on 10 Mar 2026.", citation: "Prescription · Dr. Suresh Reddy · 10 Mar 2026" },
];

export const AI_FEATURES: AiFeature[] = [
  { icon: HeartPulseIcon,  label: "Health Summary",   desc: "Get a plain-English summary of your current health status" },
  { icon: TrendingUpIcon,  label: "Lab Trends",       desc: "See how your blood sugar, cholesterol, and HbA1c change over time" },
  { icon: BookOpenIcon,    label: "Explain a Report", desc: "Upload any report and ask ArogyaAI to explain it" },
  { icon: ShieldCheckIcon, label: "Medication Check", desc: "Ask about drug interactions, missed doses, or side effects" },
];

export const AI_SUGGESTIONS: string[] = [
  "Explain my latest CBC report",
  "Is my HbA1c improving?",
  "What are the side effects of Metformin?",
  "Summarise my health for a new doctor",
  "Do I have any flagged lab values?",
  "When is my next follow-up?",
];
