"use client";

import * as React from "react";
import {
  SearchIcon, GlobeIcon, CheckCircle2Icon,
  AlertTriangleIcon, ArrowRightIcon, ShieldCheckIcon,
  BookOpenIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedicalSystems } from "@/data/medical-systems-data";
import type { RawMedSystem } from "@/data/medical-systems-data";
import { resolveIcon } from "@/lib/icon-resolver";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   SYSTEMS TAB — three-column layout
   Left: system list | Center: detail reader | Right: comparison/info
═══════════════════════════════════════════════════════════════════ */

/* ── Left: System List ── */
const SystemListPanel = ({
  systems, activeId, onSelect,
}: {
  systems: RawMedSystem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) => {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return systems;
    const q = search.toLowerCase();
    return systems.filter(
      (s) => s.name.toLowerCase().includes(q) || s.origin.toLowerCase().includes(q)
    );
  }, [systems, search]);

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
          const Icon = resolveIcon(sys.icon);
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
                  <Typography variant="caption" weight="medium" as="h4">{sys.name}</Typography>
                  <Typography variant="micro" color="muted">{sys.origin}</Typography>
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
const SystemDetail = ({ system }: { system: RawMedSystem }) => {
  const Icon = resolveIcon(system.icon);
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", system.bg)}>
          <Icon className={cn("size-5", system.color)} />
        </div>
        <div>
          <Typography variant="h1">{system.name}</Typography>
          <Typography variant="caption" color="muted">{system.origin}</Typography>
        </div>
      </div>

      {/* Principles */}
      <div className="rounded-xl border border-border p-4">
        <Typography variant="h5" as="h3">Core Principles</Typography>
        <div className="space-y-2">
          {system.principles.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Typography variant="body-sm" weight="bold" color="primary" as="span" className="mt-0.5 shrink-0">{i + 1}</Typography>
              <Typography variant="body">{p}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Limitations — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/30 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2Icon className="size-3.5 text-emerald-500" />
            <Typography variant="h5" as="h3">Strengths</Typography>
          </div>
          <div className="space-y-1.5">
            {system.strengths.map((s, i) => (
              <Typography key={i} variant="body-sm" className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5 shrink-0">•</span> {s}
              </Typography>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/30 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangleIcon className="size-3.5 text-amber-500" />
            <Typography variant="h5" as="h3">Limitations</Typography>
          </div>
          <div className="space-y-1.5">
            {system.limitations.map((l, i) => (
              <Typography key={i} variant="body-sm" className="flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5 shrink-0">•</span> {l}
              </Typography>
            ))}
          </div>
        </div>
      </div>

      {/* Key Practices */}
      <div className="rounded-xl border border-border p-4">
        <Typography variant="h5" as="h3">Key Practices</Typography>
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
          <Typography variant="h5" as="h3">Integration & Recognition</Typography>
        </div>
        <Typography variant="body">{system.integration}</Typography>
        <Typography variant="caption" color="muted" className="mt-2 italic">{system.govtRecognition}</Typography>
      </div>
    </div>
  );
};

/* ── Right: Compare & Info ── */
const SystemInfoPanel = ({
  systems, activeSystem,
}: {
  systems: RawMedSystem[];
  activeSystem: RawMedSystem | null;
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Quick overview of all systems */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <GlobeIcon className="size-3 text-primary" />
            <Typography variant="overline" color="muted" as="span">All Systems</Typography>
          </div>
          <div className="space-y-1.5">
            {systems.map((sys) => {
              const Icon = resolveIcon(sys.icon);
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
                    <Typography variant="micro" weight="medium" as="span">{sys.name}</Typography>
                  </div>
                  <Typography variant="micro" color="muted">{sys.origin}</Typography>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info about comparing */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpenIcon className="size-3 text-primary" />
            <Typography variant="micro" weight="semibold" color="primary" as="span">About Systems</Typography>
          </div>
          <Typography variant="micro" color="muted">
            ArogyaLearn covers major medical systems practised worldwide. Each system is presented with its principles, evidence base, and integration status to help you understand diverse approaches to health.
          </Typography>
        </div>
      </div>
    </div>
  );
};

/* ── Landing ── */
const SystemsLanding = ({
  systems, onSelect,
}: {
  systems: RawMedSystem[];
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="text-center mb-6">
        <GlobeIcon className="size-8 mx-auto text-primary mb-2" />
        <Typography variant="h2" as="h2">Medical Systems of the World</Typography>
        <Typography variant="body" color="muted" className="mt-1">
          Explore and compare different approaches to health and healing
        </Typography>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {systems.map((sys) => {
          const Icon = resolveIcon(sys.icon);
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
                  <Typography variant="h4" as="h3">{sys.name}</Typography>
                  <Typography variant="micro" color="muted">{sys.origin}</Typography>
                </div>
                <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <Typography variant="caption" color="muted" className="mt-2 line-clamp-2">
                {sys.principles[0]}
              </Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Tab Component ── */
export const SystemsTab = () => {
  const { MEDICAL_SYSTEMS } = useMedicalSystems();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeSystem = MEDICAL_SYSTEMS.find((s) => s.id === activeId) ?? null;

  /* Auto-select the first system once data loads */
  React.useEffect(() => {
    if (!activeId && MEDICAL_SYSTEMS.length > 0) {
      setActiveId(MEDICAL_SYSTEMS[0].id);
    }
  }, [MEDICAL_SYSTEMS, activeId]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left — System list */}
      <div className="w-[240px] shrink-0 border-r border-border overflow-hidden">
        <SystemListPanel systems={MEDICAL_SYSTEMS} activeId={activeId} onSelect={setActiveId} />
      </div>

      {/* Center — Detail or Landing */}
      <div className="flex-1 overflow-y-auto px-4">
        {activeSystem ? (
          <SystemDetail system={activeSystem} />
        ) : (
          <SystemsLanding systems={MEDICAL_SYSTEMS} onSelect={setActiveId} />
        )}
      </div>

      {/* Right — Info panel */}
      <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
        <SystemInfoPanel systems={MEDICAL_SYSTEMS} activeSystem={activeSystem} />
      </div>
    </div>
  );
};
