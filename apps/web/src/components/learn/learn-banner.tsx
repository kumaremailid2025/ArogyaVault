"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { useLearn } from "@/data/learn-data";
import { useMedicalSystems } from "@/data/medical-systems-data";

/* ═══════════════════════════════════════════════════════════════════
   AROGYALEARN BANNER — route-driven tab navigation
═══════════════════════════════════════════════════════════════════ */

export type LearnTab = "browse" | "systems" | "departments" | "drug-check" | "pdf-qa";

const TABS: { key: LearnTab; label: string; href: string }[] = [
  { key: "browse", label: "Browse", href: "/learn" },
  { key: "systems", label: "Systems", href: "/learn/systems" },
  { key: "departments", label: "Departments", href: "/learn/departments" },
  { key: "drug-check", label: "Drug Check", href: "/learn/drug-check" },
  { key: "pdf-qa", label: "PDF Q&A", href: "/learn/pdf-qa" },
];

const DESCRIPTIONS: Record<LearnTab, string> = {
  browse:
    "Evidence-based health topics, curated for you. Filter by category, level, and condition.",
  systems:
    "Compare medical systems from around the world — Allopathy, Ayurveda, TCM, and more.",
  departments:
    "Explore clinical departments, their conditions, procedures, and anatomy.",
  "drug-check":
    "Check drug-drug interactions instantly. Powered by clinical pharmacology data.",
  "pdf-qa":
    "Upload any medical PDF and ask questions. AI extracts answers with page citations.",
};

/** Derive the active tab from the current pathname. */
const deriveTab = (pathname: string): LearnTab => {
  if (pathname.startsWith("/learn/systems")) return "systems";
  if (pathname.startsWith("/learn/departments")) return "departments";
  if (pathname.startsWith("/learn/drug-check")) return "drug-check";
  if (pathname.startsWith("/learn/pdf-qa")) return "pdf-qa";
  return "browse";
};

export const LearnBanner = React.memo(() => {
  const { EDU_TOPICS } = useLearn();
  const { MEDICAL_SYSTEMS } = useMedicalSystems();
  const pathname = usePathname();
  const activeTab = deriveTab(pathname);

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

          {/* Pill tabs — right-aligned, route-driven */}
          <div className="ml-auto flex items-center gap-0.5">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  activeTab === t.key
                    ? "bg-white/25 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2 — Description */}
        <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">
          {DESCRIPTIONS[activeTab]}
        </p>
      </div>
    </div>
  );
});

LearnBanner.displayName = "LearnBanner";
