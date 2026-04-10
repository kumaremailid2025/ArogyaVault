"use client";

import * as React from "react";
import {
  PillIcon, AlertTriangleIcon,
  XIcon, PlusIcon,
  BookOpenIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { lookupInteraction } from "@/lib/drug-utils";
import { useLearn } from "@/data/learn-data";
import { useDrugSuggestions, type SeverityConfig, type DrugSeverityKey } from "@/data/drug-suggestions-data";
import type { DrugSeverity } from "@/models/learn";

/* ═══════════════════════════════════════════════════════════════════
   DRUG CHECK TAB — full-width interaction checker
   Left: drug input list | Center: results | Right: info & history
═══════════════════════════════════════════════════════════════════ */

type CheckResult = {
  drugA: string;
  drugB: string;
  severity: DrugSeverity;
  effect: string;
  advice: string;
} | {
  drugA: string;
  drugB: string;
  severity: "unknown";
  effect: string;
  advice: string;
};

/* ── Left: Drug Input Panel ── */
const DrugInputPanel = ({
  drugs, onAddDrug, onRemoveDrug, onCheck, commonDrugs,
}: {
  drugs: string[];
  onAddDrug: (drug: string) => void;
  onRemoveDrug: (index: number) => void;
  onCheck: () => void;
  commonDrugs: string[];
}) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleAdd = () => {
    const val = inputValue.trim();
    if (val && !drugs.some((d) => d.toLowerCase() === val.toLowerCase())) {
      onAddDrug(val);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-1.5 mb-3">
          <PillIcon className="size-4 text-primary" />
          <span className="text-xs font-semibold">Your Medications</span>
        </div>

        {/* Add drug input */}
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Enter drug name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            className="flex-1 h-8 px-2.5 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <Button size="sm" onClick={handleAdd} disabled={!inputValue.trim()} className="h-8 px-2.5">
            <PlusIcon className="size-3.5" />
          </Button>
        </div>

        {/* Quick add chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          {commonDrugs.filter((d) => !drugs.some((dd) => dd.toLowerCase() === d.toLowerCase())).slice(0, 6).map((drug) => (
            <button
              key={drug}
              onClick={() => onAddDrug(drug)}
              className="px-2 py-0.5 rounded-full text-[10px] border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
            >
              + {drug}
            </button>
          ))}
        </div>
      </div>

      {/* Drug list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {drugs.map((drug, i) => (
          <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-muted/40 border border-border">
            <PillIcon className="size-3.5 text-primary shrink-0" />
            <span className="text-xs font-medium flex-1">{drug}</span>
            <button onClick={() => onRemoveDrug(i)} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <XIcon className="size-3" />
            </button>
          </div>
        ))}

        {drugs.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Add at least 2 medications to check interactions.
          </div>
        )}
      </div>

      {/* Check button */}
      <div className="px-3 pb-3 pt-2 border-t border-border">
        <Button
          onClick={onCheck}
          disabled={drugs.length < 2}
          className="w-full gap-1.5"
          size="sm"
        >
          <AlertTriangleIcon className="size-3.5" />
          Check All Interactions ({drugs.length} drugs)
        </Button>
      </div>
    </div>
  );
};

/* ── Center: Results ── */
const ResultsPanel = ({
  results,
  severityConfig,
}: {
  results: CheckResult[];
  severityConfig: Record<DrugSeverityKey, SeverityConfig>;
}) => {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <PillIcon className="size-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold">Drug Interaction Checker</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Add your medications on the left and click &quot;Check All Interactions&quot; to see potential drug-drug interactions, severity levels, and clinical advice.
        </p>
      </div>
    );
  }

  const sorted = [...results].sort((a, b) => {
    const order: Record<string, number> = { major: 0, moderate: 1, minor: 2, none: 3, unknown: 4 };
    return (order[a.severity] ?? 5) - (order[b.severity] ?? 5);
  });

  const majorCount = sorted.filter((r) => r.severity === "major").length;
  const modCount = sorted.filter((r) => r.severity === "moderate").length;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3 rounded-xl border border-border p-3">
        <span className="text-sm font-semibold">{results.length} pairs checked</span>
        {majorCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
            {majorCount} major
          </span>
        )}
        {modCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
            {modCount} moderate
          </span>
        )}
      </div>

      {/* Result cards */}
      <div className="space-y-2">
        {sorted.map((r, i) => {
          const config = severityConfig[r.severity];
          const SevIcon = config.icon;
          return (
            <div
              key={i}
              className={cn("rounded-xl border p-4", config.border, config.bg)}
            >
              <div className="flex items-center gap-2 mb-2">
                <SevIcon className={cn("size-4", config.color)} />
                <span className={cn("text-xs font-bold", config.color)}>{config.label}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {r.drugA} + {r.drugB}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{r.effect}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{r.advice}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Right: Info Panel ── */
const DrugInfoPanel = ({
  drugInteractions,
  severityConfig,
}: {
  drugInteractions: Record<string, unknown>;
  severityConfig: Record<DrugSeverityKey, SeverityConfig>;
}) => {
  /* Extract unique drug names from known interactions */
  const knownDrugs = React.useMemo(() => {
    const drugs = new Set<string>();
    Object.keys(drugInteractions).forEach((key) => {
      const [a, b] = key.split("+");
      drugs.add(a.charAt(0).toUpperCase() + a.slice(1));
      drugs.add(b.charAt(0).toUpperCase() + b.slice(1));
    });
    return Array.from(drugs).sort();
  }, [drugInteractions]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Severity legend */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <AlertTriangleIcon className="size-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severity Guide</span>
          </div>
          <div className="space-y-1.5">
            {(["major", "moderate", "minor", "none"] as const).map((sev) => {
              const config = severityConfig[sev];
              const SevIcon = config.icon;
              return (
                <div key={sev} className={cn("rounded-lg border p-2", config.border, config.bg)}>
                  <div className="flex items-center gap-1.5">
                    <SevIcon className={cn("size-3", config.color)} />
                    <span className={cn("text-[11px] font-semibold", config.color)}>{config.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Known drugs in database */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <BookOpenIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Database</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {knownDrugs.map((drug) => (
              <span key={drug} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {drug}
              </span>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-2 px-1">
            {Object.keys(drugInteractions).length / 2} interaction pairs in database. Always consult your doctor.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20 p-2.5">
          <p className="text-[10px] leading-relaxed text-amber-700 dark:text-amber-400">
            This tool checks against a curated database and may not cover all interactions. Always consult a healthcare professional before changing medications.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Main Tab Component ── */
export const DrugCheckTab = () => {
  const { DRUG_INTERACTIONS } = useLearn();
  const { COMMON_DRUGS, SEVERITY_CONFIG } = useDrugSuggestions();
  const [drugs, setDrugs] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<CheckResult[]>([]);

  const handleAddDrug = (drug: string) => {
    setDrugs((prev) => [...prev, drug]);
    setResults([]);
  };

  const handleRemoveDrug = (index: number) => {
    setDrugs((prev) => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const handleCheck = () => {
    const checks: CheckResult[] = [];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const result = lookupInteraction(drugs[i], drugs[j], DRUG_INTERACTIONS);
        if (result) {
          checks.push({ drugA: drugs[i], drugB: drugs[j], ...result });
        } else {
          checks.push({
            drugA: drugs[i],
            drugB: drugs[j],
            severity: "unknown",
            effect: `No known interaction between ${drugs[i]} and ${drugs[j]} in our database.`,
            advice: "This does not rule out a possible interaction. Consult your healthcare provider.",
          });
        }
      }
    }
    setResults(checks);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — Drug input */}
      <div className="w-[260px] shrink-0 border-r border-border overflow-hidden">
        <DrugInputPanel
          drugs={drugs}
          onAddDrug={handleAddDrug}
          onRemoveDrug={handleRemoveDrug}
          onCheck={handleCheck}
          commonDrugs={COMMON_DRUGS}
        />
      </div>

      {/* Center — Results */}
      <div className="flex-1 overflow-y-auto px-4">
        <ResultsPanel results={results} severityConfig={SEVERITY_CONFIG} />
      </div>

      {/* Right — Info */}
      <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
        <DrugInfoPanel drugInteractions={DRUG_INTERACTIONS} severityConfig={SEVERITY_CONFIG} />
      </div>
    </div>
  );
};
