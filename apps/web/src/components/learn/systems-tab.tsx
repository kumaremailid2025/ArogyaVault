"use client";

import * as React from "react";
import {
  SearchIcon, GlobeIcon, CheckCircle2Icon,
  AlertTriangleIcon, ArrowRightIcon, ShieldCheckIcon,
  BookOpenIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDICAL_SYSTEMS } from "@/data/medical-systems-data";
import type { MedSystem } from "@/models/learn";

/* ═══════════════════════════════════════════════════════════════════
   SYSTEMS TAB — three-column layout
   Left: system list | Center: detail reader | Right: comparison/info
═══════════════════════════════════════════════════════════════════ */

/* ── Left: System List ── */
const SystemListPanel = ({
  activeId, onSelect,
}: { activeId: string | null; onSelect: (id: string) => void }) => {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return MEDICAL_SYSTEMS;
    const q = search.toLowerCase();
    return MEDICAL_SYSTEMS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.origin.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search systems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-2 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>
      <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <GlobeIcon className="size-3" /> {filtered.length} Systems
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5 pb-2">
        {filtered.map((sys) => {
          const Icon = sys.icon;
          return (
            <button
              key={sys.id}
              onClick={() => onSelect(sys.id)}
              className={cn(
                "w-full text-left px-2.5 py-3 rounded-lg transition-colors cursor-pointer",
                activeId === sys.id
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-muted/60"
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("size-4 mt-0.5 shrink-0", sys.color)} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium">{sys.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{sys.origin}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Center: System Detail ── */
const SystemDetail = ({ system }: { system: MedSystem }) => {
  const Icon = system.icon;
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", system.bg)}>
          <Icon className={cn("size-5", system.color)} />
        </div>
        <div>
          <h1 className="text-xl font-bold">{system.name}</h1>
          <p className="text-xs text-muted-foreground">{system.origin}</p>
        </div>
      </div>

      {/* Principles */}
      <div className="rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Core Principles</h3>
        <div className="space-y-2">
          {system.principles.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-primary text-sm font-bold mt-0.5 shrink-0">{i + 1}</span>
              <p className="text-sm leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Limitations — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/30 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2Icon className="size-3.5 text-emerald-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Strengths</h3>
          </div>
          <div className="space-y-1.5">
            {system.strengths.map((s, i) => (
              <p key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {s}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/30 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangleIcon className="size-3.5 text-amber-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600">Limitations</h3>
          </div>
          <div className="space-y-1.5">
            {system.limitations.map((l, i) => (
              <p key={i} className="text-xs leading-relaxed flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5 shrink-0">•</span> {l}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Key Practices */}
      <div className="rounded-xl border border-border p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Practices</h3>
        <div className="flex flex-wrap gap-2">
          {system.keyPractices.map((p) => (
            <span key={p} className={cn("text-xs px-3 py-1.5 rounded-full border", system.border, system.bg, system.color)}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Integration & Recognition */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheckIcon className="size-3.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">Integration & Recognition</h3>
        </div>
        <p className="text-sm leading-relaxed">{system.integration}</p>
        <p className="text-xs text-muted-foreground mt-2 italic">{system.govtRecognition}</p>
      </div>
    </div>
  );
};

/* ── Right: Compare & Info ── */
const SystemInfoPanel = ({ activeSystem }: { activeSystem: MedSystem | null }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Quick overview of all systems */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <GlobeIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">All Systems</span>
          </div>
          <div className="space-y-1.5">
            {MEDICAL_SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              return (
                <div
                  key={sys.id}
                  className={cn(
                    "rounded-lg p-2.5 border transition-colors",
                    activeSystem?.id === sys.id
                      ? cn(sys.border, sys.bg)
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("size-3.5", sys.color)} />
                    <span className="text-[11px] font-medium">{sys.name}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{sys.origin}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info about comparing */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpenIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">About Systems</span>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            ArogyaLearn covers major medical systems practised worldwide. Each system is presented with its principles, evidence base, and integration status to help you understand diverse approaches to health.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Landing ── */
const SystemsLanding = ({ onSelect }: { onSelect: (id: string) => void }) => {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="text-center mb-6">
        <GlobeIcon className="size-8 mx-auto text-primary mb-2" />
        <h2 className="text-lg font-bold">Medical Systems of the World</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Explore and compare different approaches to health and healing
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MEDICAL_SYSTEMS.map((sys) => {
          const Icon = sys.icon;
          return (
            <button
              key={sys.id}
              onClick={() => onSelect(sys.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all cursor-pointer hover:shadow-md group",
                sys.border, "hover:scale-[1.01]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("flex size-10 items-center justify-center rounded-xl", sys.bg)}>
                  <Icon className={cn("size-5", sys.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold">{sys.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{sys.origin}</p>
                </div>
                <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {sys.principles[0]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Tab Component ── */
export const SystemsTab = () => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeSystem = MEDICAL_SYSTEMS.find((s) => s.id === activeId) ?? null;

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — System list */}
      <div className="w-[240px] shrink-0 border-r border-border overflow-hidden">
        <SystemListPanel activeId={activeId} onSelect={setActiveId} />
      </div>

      {/* Center — Detail or Landing */}
      <div className="flex-1 overflow-y-auto px-4">
        {activeSystem ? (
          <SystemDetail system={activeSystem} />
        ) : (
          <SystemsLanding onSelect={setActiveId} />
        )}
      </div>

      {/* Right — Info panel */}
      <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
        <SystemInfoPanel activeSystem={activeSystem} />
      </div>
    </div>
  );
};
