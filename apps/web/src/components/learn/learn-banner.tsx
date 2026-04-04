"use client";

import * as React from "react";
import { BookOpenIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { EDU_TOPICS } from "@/data/learn-data";
import { MEDICAL_SYSTEMS } from "@/data/medical-systems-data";

/* ═══════════════════════════════════════════════════════════════════
   AROGYALEARN BANNER — consistent pattern with Vault & ArogyaAI
═══════════════════════════════════════════════════════════════════ */

export type LearnTab = "browse" | "systems" | "departments" | "drug-check" | "pdf-qa";

interface LearnBannerProps {
  activeTab: LearnTab;
  onTabChange: (tab: LearnTab) => void;
}

const TABS: { key: LearnTab; label: string }[] = [
  { key: "browse", label: "Browse" },
  { key: "systems", label: "Systems" },
  { key: "departments", label: "Departments" },
  { key: "drug-check", label: "Drug Check" },
  { key: "pdf-qa", label: "PDF Q&A" },
];

export const LearnBanner = React.memo(
  ({ activeTab, onTabChange }: LearnBannerProps) => {
    const descriptions: Record<LearnTab, string> = {
      browse: "Evidence-based health topics, curated for you. Filter by category, level, and condition.",
      systems: "Compare medical systems from around the world — Allopathy, Ayurveda, TCM, and more.",
      departments: "Explore clinical departments, their conditions, procedures, and anatomy.",
      "drug-check": "Check drug-drug interactions instantly. Powered by clinical pharmacology data.",
      "pdf-qa": "Upload any medical PDF and ask questions. AI extracts answers with page citations.",
    };

    return (
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          {/* Row 1 — Icon + Title + Badges + Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpenIcon className="size-5" />
            <span className="font-bold text-lg">ArogyaLearn</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              {EDU_TOPICS.length} topics
            </Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              {MEDICAL_SYSTEMS.length} systems
            </Badge>
            {/* Pill tabs — right-aligned */}
            <div className="ml-auto flex items-center gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onTabChange(t.key)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
                    activeTab === t.key
                      ? "bg-white/25 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Row 2 — Description */}
          <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">
            {descriptions[activeTab]}
          </p>
        </div>
      </div>
    );
  }
);

LearnBanner.displayName = "LearnBanner";
