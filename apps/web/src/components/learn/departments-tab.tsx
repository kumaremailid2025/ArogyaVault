"use client";

import * as React from "react";
import {
  SearchIcon, LayoutGridIcon, ClipboardListIcon,
  StethoscopeIcon, ArrowRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMedicalSystems } from "@/data/medical-systems-data";
import type { RawDepartment } from "@/data/medical-systems-data";
import { resolveIcon } from "@/lib/icon-resolver";
import type { BodyRegionDef } from "@/models/learn";

/* ═══════════════════════════════════════════════════════════════════
   DEPARTMENTS TAB — three-column layout
   Left: department list with body region filters
   Center: detail view or landing
   Right: body region nav + related departments
═══════════════════════════════════════════════════════════════════ */

/* ── Left: Department List ── */
const DeptListPanel = ({
  departments, bodyRegions, activeId, onSelect, regionFilter, onRegionFilter,
}: {
  departments: RawDepartment[];
  bodyRegions: BodyRegionDef[];
  activeId: string | null;
  onSelect: (id: string) => void;
  regionFilter: string | null;
  onRegionFilter: (region: string | null) => void;
}) => {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    let depts = departments;
    if (regionFilter) {
      depts = depts.filter((d) => d.bodyRegion === regionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      depts = depts.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.focus.toLowerCase().includes(q) ||
          d.conditions.some((c) => c.toLowerCase().includes(q))
      );
    }
    return depts;
  }, [departments, search, regionFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-2 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Body region filter chips */}
      <div className="px-2 py-1.5 flex flex-wrap gap-1">
        <button
          onClick={() => onRegionFilter(null)}
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border",
            !regionFilter
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/40"
          )}
        >
          All
        </button>
        {bodyRegions.filter((r) => r.depts.length > 0).map((region) => (
          <button
            key={region.id}
            onClick={() => onRegionFilter(region.id)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border",
              regionFilter === region.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {region.label}
          </button>
        ))}
      </div>

      <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t border-border">
        <StethoscopeIcon className="size-3" /> {filtered.length} Departments
      </div>

      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5 pb-2">
        {filtered.map((dept) => {
          const Icon = resolveIcon(dept.icon);
          return (
            <button
              key={dept.id}
              onClick={() => onSelect(dept.id)}
              className={cn(
                "w-full text-left px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer",
                activeId === dept.id
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-muted/60"
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("size-4 mt-0.5 shrink-0", dept.color)} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium">{dept.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{dept.focus}</p>
                  <span className="text-[9px] text-muted-foreground">{dept.conditions.length} conditions</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Center: Department Detail ── */
const DeptDetail = ({ dept }: { dept: RawDepartment }) => {
  const Icon = resolveIcon(dept.icon);
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", dept.bg)}>
          <Icon className={cn("size-5", dept.color)} />
        </div>
        <div>
          <h1 className="text-xl font-bold">{dept.name}</h1>
          <p className="text-xs text-muted-foreground">{dept.focus}</p>
        </div>
      </div>

      {/* Conditions */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <ClipboardListIcon className="size-3.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Common Conditions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {dept.conditions.map((cond) => (
            <div key={cond} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-sm">
              <span className="text-primary">•</span>
              {cond}
            </div>
          ))}
        </div>
      </div>

      {/* Key Procedures */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <StethoscopeIcon className="size-3.5 text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Procedures</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {dept.keyProcedures.map((proc) => (
            <span key={proc} className={cn("text-xs px-3 py-1.5 rounded-full border", dept.bg, "border-border")}>
              {proc}
            </span>
          ))}
        </div>
      </div>

      {/* Anatomy */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Anatomy Overview</h3>
        <p className="text-sm leading-relaxed">{dept.anatomy}</p>
      </div>
    </div>
  );
};

/* ── Right: Body Region Nav ── */
const DeptInfoPanel = ({
  departments, bodyRegions, activeDept, onSelect,
}: {
  departments: RawDepartment[];
  bodyRegions: BodyRegionDef[];
  activeDept: RawDepartment | null;
  onSelect: (id: string) => void;
}) => {
  const relatedDepts = activeDept
    ? departments.filter((d) => d.bodyRegion === activeDept.bodyRegion && d.id !== activeDept.id)
    : [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Body regions overview */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <LayoutGridIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Body Regions</span>
          </div>
          <div className="space-y-1">
            {bodyRegions.filter((r) => r.depts.length > 0).map((region) => {
              const regionDepts = departments.filter((d) => d.bodyRegion === region.id);
              return (
                <div key={region.id} className="rounded-lg border border-border p-2">
                  <span className="text-[11px] font-medium">{region.label}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {regionDepts.map((d) => {
                      const DIcon = resolveIcon(d.icon);
                      return (
                        <button
                          key={d.id}
                          onClick={() => onSelect(d.id)}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] cursor-pointer transition-colors",
                            activeDept?.id === d.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <DIcon className="size-2.5" />
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Related departments */}
        {relatedDepts.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <StethoscopeIcon className="size-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Related</span>
            </div>
            <div className="space-y-1">
              {relatedDepts.map((d) => {
                const DIcon = resolveIcon(d.icon);
                return (
                  <button
                    key={d.id}
                    onClick={() => onSelect(d.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-left"
                  >
                    <DIcon className={cn("size-3.5 shrink-0", d.color)} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-medium">{d.name}</span>
                      <p className="text-[10px] text-muted-foreground truncate">{d.focus}</p>
                    </div>
                    <ArrowRightIcon className="size-3 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Landing ── */
const DepartmentsLanding = ({
  departments, onSelect,
}: {
  departments: RawDepartment[];
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="text-center mb-4">
        <StethoscopeIcon className="size-8 mx-auto text-primary mb-2" />
        <h2 className="text-lg font-bold">Clinical Departments</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Explore specialties, conditions, procedures, and anatomy
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {departments.map((dept) => {
          const Icon = resolveIcon(dept.icon);
          return (
            <button
              key={dept.id}
              onClick={() => onSelect(dept.id)}
              className="rounded-xl border border-border p-4 text-center transition-all cursor-pointer hover:border-primary/30 hover:shadow-sm group"
            >
              <div className={cn("flex size-10 items-center justify-center rounded-xl mx-auto", dept.bg)}>
                <Icon className={cn("size-5", dept.color)} />
              </div>
              <h3 className="text-xs font-semibold mt-2">{dept.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{dept.focus}</p>
              <span className="text-[9px] text-muted-foreground mt-1 block">{dept.conditions.length} conditions</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Tab Component ── */
export const DepartmentsTab = () => {
  const { DEPARTMENTS, BODY_REGIONS } = useMedicalSystems();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [regionFilter, setRegionFilter] = React.useState<string | null>(null);
  const activeDept = DEPARTMENTS.find((d) => d.id === activeId) ?? null;

  /* Auto-select the first department once data loads */
  React.useEffect(() => {
    if (!activeId && DEPARTMENTS.length > 0) {
      setActiveId(DEPARTMENTS[0].id);
    }
  }, [DEPARTMENTS, activeId]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left */}
      <div className="w-[240px] shrink-0 border-r border-border overflow-hidden">
        <DeptListPanel
          departments={DEPARTMENTS}
          bodyRegions={BODY_REGIONS}
          activeId={activeId}
          onSelect={setActiveId}
          regionFilter={regionFilter}
          onRegionFilter={setRegionFilter}
        />
      </div>

      {/* Center */}
      <div className="flex-1 overflow-y-auto px-4">
        {activeDept ? (
          <DeptDetail dept={activeDept} />
        ) : (
          <DepartmentsLanding departments={DEPARTMENTS} onSelect={setActiveId} />
        )}
      </div>

      {/* Right */}
      <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
        <DeptInfoPanel
          departments={DEPARTMENTS}
          bodyRegions={BODY_REGIONS}
          activeDept={activeDept}
          onSelect={setActiveId}
        />
      </div>
    </div>
  );
};
