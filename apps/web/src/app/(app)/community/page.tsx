"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCapIcon, PillIcon, FlaskConicalIcon,
  ClipboardListIcon, MicroscopeIcon, SearchIcon,
  CheckCircle2Icon, AlertTriangleIcon, XCircleIcon,
  LeafIcon, SunIcon, WindIcon, DropletIcon, LayersIcon,
  BuildingIcon, HeartIcon, BrainIcon, BoneIcon,
  SendIcon, LinkIcon, Loader2Icon, ChevronRightIcon,
  StethoscopeIcon, ScanLineIcon, UserIcon,
  ArrowRightIcon, BrainCircuitIcon, FileTextIcon,
  BookOpenIcon, SparklesIcon, ShieldCheckIcon, TrendingUpIcon,
  XIcon,
  ArrowLeftIcon,
  FileUpIcon,
  ZapIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";

/* ── Module imports (ArogyaLearn) ──────────────────────────────── */
import { EDU_TOPICS, EDU_CATEGORIES, DRUG_INTERACTIONS, LAB_QUICK_REF, LEVEL_CONFIG } from "@/data/learn-data";
import { MEDICAL_SYSTEMS, DEPARTMENTS, BODY_REGIONS } from "@/data/medical-systems-data";
import { normDrug, lookupInteraction } from "@/lib/drug-utils";
import { getPdfAiResponse } from "@/lib/pdf-utils";
import type { EduLevel, EduTopic, MedSystem, Department, BodyRegion, BodyRegionDef, PdfMessage } from "@/models/learn";

import { CommunityWrapperContainer } from "@/components/containers/community/community-wrapper-container";

/* ═══════════════════════════════════════════════════════════════════
   AROGYATALK — community content
═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   AROGYALEARN — evidence-based medical knowledge hub
═══════════════════════════════════════════════════════════════════ */
export const ArogyaLearnContent = () => {
  type LearnTab = "browse" | "systems" | "departments" | "pdf";
  const [activeTab, setActiveTab] = React.useState<LearnTab>("browse");

  /* Browse tab state */
  const [level, setLevel] = React.useState<EduLevel>("patient");
  const [category, setCategory] = React.useState("all");
  const [search, setSearch] = React.useState("");

  /* Systems tab state */
  const [systemSearch, setSystemSearch] = React.useState("");
  const [selectedSystem, setSelectedSystem] = React.useState<MedSystem | null>(null);

  /* Departments tab state */
  const [deptRegion, setDeptRegion] = React.useState<BodyRegion | "all">("all");
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(null);

  /* PDF Q&A tab state */
  type PdfSource = { type: "file"; name: string } | { type: "url"; url: string } | null;
  const [pdfSource, setPdfSource] = React.useState<PdfSource>(null);
  const [pdfUrlInput, setPdfUrlInput] = React.useState("");
  const [pdfMessages, setPdfMessages] = React.useState<PdfMessage[]>([]);
  const [pdfQuestion, setPdfQuestion] = React.useState("");
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const pdfChatEndRef = React.useRef<HTMLDivElement>(null);

  type LearnPanel =
    | { view: "overview" }
    | { view: "topic"; id: string }
    | { view: "drug-check" }
    | { view: "system-detail" }
    | { view: "dept-detail" }
    | { view: "pdf-chat" };
  const [panel, setPanel] = React.useState<LearnPanel>({ view: "overview" });

  /* Drug checker state */
  const [drugs, setDrugs] = React.useState(["", ""]);
  const [interactionResults, setInteractionResults] = React.useState<
    { a: string; b: string; result: typeof DRUG_INTERACTIONS[string] | null }[]
  >([]);
  const [checked, setChecked] = React.useState(false);

  /* Filtered topics */
  const filteredTopics = EDU_TOPICS.filter((t) => {
    const matchLevel    = t.levels.includes(level);
    const matchCategory = category === "all" || t.category === category;
    const matchSearch   = !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.summary.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchCategory && matchSearch;
  });

  const activeTopic = panel.view === "topic"
    ? (EDU_TOPICS.find((t) => t.id === panel.id) ?? null)
    : null;

  const runDrugCheck = () => {
    const filled = drugs.filter((d) => d.trim());
    const pairs: typeof interactionResults = [];
    for (let i = 0; i < filled.length; i++) {
      for (let j = i + 1; j < filled.length; j++) {
        pairs.push({ a: filled[i], b: filled[j], result: lookupInteraction(filled[i], filled[j]) });
      }
    }
    setInteractionResults(pairs);
    setChecked(true);
  }

  const severityConfig = {
    none:     { label: "No interaction",    icon: CheckCircle2Icon,  color: "text-emerald-600", bg: "bg-emerald-50/80 border-emerald-200" },
    minor:    { label: "Minor",             icon: AlertTriangleIcon, color: "text-amber-600",   bg: "bg-amber-50/80 border-amber-200"    },
    moderate: { label: "Moderate",          icon: AlertTriangleIcon, color: "text-orange-600",  bg: "bg-orange-50/80 border-orange-200"  },
    major:    { label: "Major — caution",   icon: XCircleIcon,       color: "text-red-600",     bg: "bg-red-50/80 border-red-200"        },
  };

  /* ── Drug checker panel (shared between overview mini + full panel) ── */
  const DrugCheckerUI = ({ full = false }: { full?: boolean }) => {
    return (
      <div className="space-y-2.5">
        {drugs.map((d, i) => (
          <div key={i} className="flex gap-1.5">
            <Input
              suppressHydrationWarning
              type="text" value={d}
              onChange={(e) => setDrugs((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
              placeholder={`Drug ${i + 1} (e.g. Metformin)`}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
            {i >= 2 && (
              <Button onClick={() => setDrugs((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground shrink-0"><XIcon className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
        {full && drugs.length < 5 && (
          <Button
            suppressHydrationWarning
            onClick={() => setDrugs((prev) => [...prev, ""])}
            className="text-[11px] text-primary hover:underline"
          >+ Add another drug</Button>
        )}
        <Button size="sm" className="w-full" disabled={drugs.filter(d => d.trim()).length < 2} onClick={runDrugCheck}>
          Check Interactions
        </Button>
        {checked && interactionResults.length > 0 && (
          <div className="space-y-2 pt-1">
            {interactionResults.map((r, i) => {
              const severity = r.result?.severity ?? "none";
              const cfg = severityConfig[severity];
              const Icon = cfg.icon;
              return (
                <div key={i} className={cn("rounded-lg border p-2.5", cfg.bg)}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("size-3.5 shrink-0", cfg.color)} />
                    <span className={cn("text-[11px] font-semibold", cfg.color)}>{cfg.label}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{r.a} + {r.b}</span>
                  </div>
                  <p className="text-[11px] leading-snug text-foreground/80">
                    {r.result?.effect ?? "No data found for this combination. Always verify with a pharmacist or prescribing reference."}
                  </p>
                  {r.result?.advice && (
                    <p className="text-[11px] leading-snug text-foreground/70 mt-1 pt-1 border-t border-current/10 italic">
                      💡 {r.result.advice}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {checked && interactionResults.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Enter at least 2 drugs to check interactions.</p>
        )}
      </div>
    );
  }

  /* ── PDF handlers ── */
  const handlePdfFile = (file: File) => {
    setPdfSource({ type: "file", name: file.name });
    setPdfMessages([{ role: "ai", text: `Document "${file.name}" loaded. I've indexed the content. Ask me any question about it.`, citations: [] }]);
    setPanel({ view: "pdf-chat" });
  }

  const handlePdfUrl = () => {
    const url = pdfUrlInput.trim();
    if (!url) return;
    const name = url.split("/").pop() || "document.pdf";
    setPdfSource({ type: "url", url });
    setPdfMessages([{ role: "ai", text: `Document at "${url}" has been fetched and indexed. Ask me any question about its content.`, citations: [] }]);
    setPdfUrlInput("");
    setPanel({ view: "pdf-chat" });
  }

  const handlePdfAsk = () => {
    const q = pdfQuestion.trim();
    if (!q || !pdfSource) return;
    const docName = pdfSource.type === "file" ? pdfSource.name : (pdfSource.url.split("/").pop() || "document");
    setPdfMessages((prev) => [...prev, { role: "user", text: q }]);
    setPdfQuestion("");
    setPdfLoading(true);
    setTimeout(() => {
      const response = getPdfAiResponse(q, docName);
      setPdfMessages((prev) => [...prev, response]);
      setPdfLoading(false);
      setTimeout(() => pdfChatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 900);
  }

  const TAB_CONFIG: { id: LearnTab; label: string; icon: React.ElementType }[] = [
    { id: "browse",      label: "Browse",      icon: BookOpenIcon      },
    { id: "systems",     label: "Systems",     icon: LayersIcon        },
    { id: "departments", label: "Departments", icon: BuildingIcon      },
    { id: "pdf",         label: "PDF Q&A",     icon: FileUpIcon        },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header banner ── */}
      <div className="shrink-0 px-5 pt-4 pb-1 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <GraduationCapIcon className="size-4" />
            </div>
            <span className="font-bold text-lg">ArogyaLearn</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">Evidence-Based</Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">PubMed · WHO · ADA</Badge>
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed mt-2">
            Verified facts from medical literature, clinical guidelines, research, and 7 medical traditions.
          </p>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <div className="shrink-0 px-5 pt-3 pb-0 lg:px-6">
        <div className="flex gap-1 rounded-xl bg-muted/50 p-1 border border-border">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <Button
              variant={activeTab === id ? "default" : "ghost"}
              suppressHydrationWarning
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "browse") setPanel({ view: "overview" });
                else if (id === "systems") { setSelectedSystem(null); setPanel({ view: "overview" }); }
                else if (id === "departments") { setSelectedDept(null); setPanel({ view: "overview" }); }
                else if (id === "pdf") setPanel(pdfSource ? { view: "pdf-chat" } : { view: "overview" });
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[11px] font-medium transition-colors",
                activeTab === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="size-3 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex-1 overflow-hidden flex min-h-0 mt-3">

        {/* LEFT — content varies by tab */}
        <div className="flex-1 min-w-0 overflow-y-auto px-5 pb-5 lg:px-6">

        {/* ══ BROWSE TAB ══ */}
        {activeTab === "browse" && (
          <div className="space-y-4 pt-1">

            {/* Level selector */}
            <div className="flex rounded-xl border border-border overflow-hidden">
              {(Object.entries(LEVEL_CONFIG) as [EduLevel, typeof LEVEL_CONFIG[EduLevel]][]).map(([key, cfg]) => (
                <Button
                  suppressHydrationWarning
                  key={key}
                  onClick={() => { setLevel(key); setCategory("all"); }}
                  className={cn(
                    "flex-1 flex flex-col items-center py-2.5 px-1 text-center transition-colors border-r last:border-r-0 border-border",
                    level === key
                      ? `${cfg.bg} ${cfg.color} font-semibold`
                      : "bg-background text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  <span className="text-xs font-semibold">{cfg.label}</span>
                  <span className="text-[10px] leading-snug mt-0.5 hidden sm:block">{cfg.desc.split(",")[0]}</span>
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                suppressHydrationWarning
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conditions, medications, lab values…"
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
              />
              {search && (
                <Button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><XIcon className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5">
              {EDU_CATEGORIES.map((cat) => (
                <Button
                  variant={category === cat.id ? "default": 'ghost'}
                  suppressHydrationWarning
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    category === cat.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <cat.icon className={cn("size-3", category === cat.id ? "text-primary-foreground" : cat.color)} />
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Topic cards */}
            {filteredTopics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <SearchIcon className="size-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm font-medium mb-1">No topics found</p>
                <p className="text-xs text-muted-foreground">Try a different search term or level</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTopics.map((t) => {
                  const Icon = t.categoryIcon;
                  const isSelected = panel.view === "topic" && panel.id === t.id;
                  return (
                    <Button
                      suppressHydrationWarning
                      key={t.id}
                      onClick={() => setPanel({ view: "topic", id: t.id })}
                      className={cn(
                        "w-full text-left rounded-xl border p-3.5 transition-colors",
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-background hover:border-primary/20 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5", isSelected ? "bg-primary/10" : "bg-muted")}>
                          <Icon className={cn("size-4", isSelected ? "text-primary" : t.categoryColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <Badge variant="outline" className={cn("text-[9px] border-current", t.categoryColor)}>{t.category}</Badge>
                            <span className="text-[10px] text-muted-foreground">{t.readTime} read</span>
                          </div>
                          <p className="text-sm font-semibold leading-snug">{t.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{t.summary}</p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* ══ SYSTEMS TAB ══ */}
          {activeTab === "systems" && (
          <div className="space-y-3 pt-1">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                suppressHydrationWarning
                type="text" value={systemSearch} onChange={(e) => setSystemSearch(e.target.value)}
                placeholder="Search medical systems…"
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="space-y-2">
              {MEDICAL_SYSTEMS.filter((s) => !systemSearch || s.name.toLowerCase().includes(systemSearch.toLowerCase()) || s.origin.toLowerCase().includes(systemSearch.toLowerCase())).map((sys) => {
                const Icon = sys.icon;
                const isSelected = selectedSystem?.id === sys.id;
                return (
                  <Button
                    suppressHydrationWarning
                    key={sys.id}
                    onClick={() => { setSelectedSystem(sys); setPanel({ view: "system-detail" }); }}
                    className={cn(
                      "w-full text-left rounded-xl border p-3.5 transition-colors",
                      isSelected ? `${sys.border} ${sys.bg}` : "border-border bg-background hover:border-primary/20 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", isSelected ? sys.bg : "bg-muted")}>
                        <Icon className={cn("size-5", sys.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold", isSelected ? sys.color : "")}>{sys.name}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{sys.origin}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{sys.principles[0]}</p>
                      </div>
                      <ChevronRightIcon className="size-4 text-muted-foreground/50 shrink-0" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          )}

          {/* ══ DEPARTMENTS TAB ══ */}
          {activeTab === "departments" && (
          <div className="space-y-3 pt-1">
            {/* Body region filter */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Filter by Body Region</p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  suppressHydrationWarning
                  onClick={() => setDeptRegion("all")}
                  className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    deptRegion === "all" ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >All</Button>
                {BODY_REGIONS.map((r) => (
                  <Button
                    suppressHydrationWarning
                    key={r.id}
                    onClick={() => setDeptRegion(r.id)}
                    className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      deptRegion === r.id ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >{r.label}</Button>
                ))}
              </div>
            </div>

            {/* Anatomy diagram placeholder */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {BODY_REGIONS.map((r) => (
                  <Button
                    suppressHydrationWarning
                    key={r.id}
                    onClick={() => setDeptRegion(r.id === deptRegion ? "all" : r.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 min-w-[60px] transition-colors text-center",
                      deptRegion === r.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    <span className="text-base">{r.id === "head" ? "🧠" : r.id === "chest" ? "❤️" : r.id === "abdomen" ? "🫁" : r.id === "neuro" ? "🧠" : r.id === "musculo" ? "🦴" : r.id === "systemic" ? "🩺" : "🫀"}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{r.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Department cards */}
            <div className="space-y-2">
              {DEPARTMENTS.filter((d) => deptRegion === "all" || d.bodyRegion === deptRegion).map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept?.id === dept.id;
                return (
                  <Button
                    suppressHydrationWarning
                    key={dept.id}
                    onClick={() => { setSelectedDept(dept); setPanel({ view: "dept-detail" }); }}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-colors",
                      isSelected ? `${dept.bg} border-current/30` : "border-border bg-background hover:border-primary/20 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", dept.bg)}>
                        <Icon className={cn("size-4", dept.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{dept.name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{dept.focus}</p>
                      </div>
                      <ChevronRightIcon className="size-3.5 text-muted-foreground/50 shrink-0" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          )}

          {/* ══ PDF Q&A TAB ══ */}
          {activeTab === "pdf" && (
          <div className="space-y-3 pt-1">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"><FileUpIcon className="size-3.5 text-primary" /> Load a Medical Document</p>

              {/* File upload */}
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-background p-4 text-center cursor-pointer transition-colors mb-3"
              >
                <FileUpIcon className="size-5 text-muted-foreground/40 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-muted-foreground">Upload PDF</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Research paper, clinical guide, drug monograph…</p>
                <Input
                  suppressHydrationWarning
                  ref={pdfInputRef} type="file" accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfFile(f); }}
                />
              </div>

              {/* URL input */}
              <p className="text-[10px] text-muted-foreground text-center mb-2">— or paste a PDF/article URL —</p>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  <Input
                    suppressHydrationWarning
                    type="url" value={pdfUrlInput} onChange={(e) => setPdfUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePdfUrl()}
                    placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                    className="w-full rounded-lg border border-border bg-background pl-7 pr-3 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Button size="sm" className="shrink-0 h-auto py-1.5 px-3 text-xs" disabled={!pdfUrlInput.trim()} onClick={handlePdfUrl}>
                  Load
                </Button>
              </div>
            </div>

            {/* Currently loaded doc */}
            {pdfSource && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-700 truncate">
                    {pdfSource.type === "file" ? pdfSource.name : pdfSource.url.split("/").pop()}
                  </p>
                  <p className="text-[10px] text-emerald-600">{pdfMessages.length - 1} question{pdfMessages.length !== 2 ? "s" : ""} asked</p>
                </div>
                <Button
                  suppressHydrationWarning
                  onClick={() => { setPdfSource(null); setPdfMessages([]); setPanel({ view: "overview" }); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="space-y-1.5">
              {[
                { icon: MicroscopeIcon, text: "AI searches inside the PDF content" },
                { icon: BookOpenIcon,   text: "Page-level citations for every answer" },
                { icon: SearchIcon,     text: "Cross-referenced with PubMed & WHO" },
                { icon: SparklesIcon,   text: "ArogyaAI perspective on key findings" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <f.icon className="size-3.5 text-primary/60 shrink-0" /> {f.text}
                </div>
              ))}
            </div>
          </div>
          )}

        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — Panel */}
        <div className="w-72 shrink-0 overflow-y-auto flex flex-col">

          {/* ── OVERVIEW (default) ── */}
          {panel.view === "overview" && (
            <div className="p-4 space-y-5">

              {/* Drug Interaction mini-checker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <PillIcon className="size-3 text-emerald-600" /> Drug Interaction Checker
                  </p>
                  <Button
                    suppressHydrationWarning
                    onClick={() => { setPanel({ view: "drug-check" }); setChecked(false); setInteractionResults([]); }}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Full checker →
                  </Button>
                </div>
                <DrugCheckerUI />
              </div>

              {/* Lab values quick reference */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FlaskConicalIcon className="size-3 text-blue-500" /> Lab Quick Reference
                </p>
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="grid grid-cols-3 bg-muted/50 px-2 py-1.5 text-[10px] font-semibold text-muted-foreground">
                    <span>Test</span><span className="text-center">Normal</span><span className="text-right">Unit</span>
                  </div>
                  {LAB_QUICK_REF.map((r) => (
                    <div key={r.test} className="grid grid-cols-3 px-2 py-1.5 text-[10px] border-t border-border/50">
                      <span className="font-medium truncate pr-1">{r.test}</span>
                      <span className="text-center text-emerald-700 font-medium">{r.normal}</span>
                      <span className="text-right text-muted-foreground">{r.unit}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Reference ranges may vary by lab. Always interpret with clinical context.</p>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <GraduationCapIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground mb-2 leading-snug">
                  Select a topic on the left to read the full evidence-based article with AI perspective.
                </p>
              </div>
            </div>
          )}

          {/* ── TOPIC DETAIL ── */}
          {panel.view === "topic" && activeTopic && (() => {
            const Icon = activeTopic.categoryIcon;
            const lvlCfg = LEVEL_CONFIG[activeTopic.levels[activeTopic.levels.length - 1]];
            return (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Button onClick={() => setPanel({ view: "overview" })} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeftIcon className="size-4" />
                  </Button>
                  <span className="text-sm font-semibold flex-1 leading-snug line-clamp-1">{activeTopic.title}</span>
                </div>

                {/* Category + level badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", activeTopic.categoryColor, "border-current/30")}>
                    <Icon className="size-3" /> {activeTopic.category}
                  </div>
                  {activeTopic.levels.map((l) => (
                    <span key={l} className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", LEVEL_CONFIG[l].bg, LEVEL_CONFIG[l].color, LEVEL_CONFIG[l].border)}>
                      {LEVEL_CONFIG[l].label}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-muted-foreground">{activeTopic.readTime} read</span>
                </div>

                {/* Summary */}
                <p className="text-xs leading-relaxed text-foreground/80">{activeTopic.summary}</p>

                {/* Key facts */}
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Facts</p>
                  <ul className="space-y-1.5">
                    {activeTopic.keyFacts.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs leading-snug">
                        <CheckCircle2Icon className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ArogyaAI perspective */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                      <ZapIcon className="size-3 text-amber-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700">ArogyaAI Clinical Note</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground/80">{activeTopic.aiPerspective}</p>
                </div>

                {/* Source */}
                <a
                  href={activeTopic.source} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[10px] text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  <BookOpenIcon className="size-3 shrink-0" />
                  <span className="flex-1 leading-snug">{activeTopic.sourceLabel}</span>
                  <ArrowRightIcon className="size-3 shrink-0" />
                </a>
              </div>
            );
          })()}

          {/* ── DRUG CHECKER (full) ── */}
          {panel.view === "drug-check" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => { setPanel({ view: "overview" }); setChecked(false); setInteractionResults([]); setDrugs(["", ""]); }} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeftIcon className="size-4" />
                </Button>
                <span className="text-sm font-semibold flex-1">Drug Interaction Checker</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">Enter up to 5 drugs to check for known interactions. Results are based on published pharmacokinetic and pharmacodynamic data.</p>
              <DrugCheckerUI full />
              <p className="text-[10px] text-muted-foreground leading-snug border-t border-border pt-2">
                ⚠️ This tool is for reference only. Always verify interactions with a qualified pharmacist or prescribing clinician before making any medication changes.
              </p>
            </div>
          )}

          {/* ── SYSTEM DETAIL ── */}
          {panel.view === "system-detail" && selectedSystem && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={() => { setPanel({ view: "overview" }); setSelectedSystem(null); }} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeftIcon className="size-4" />
                </Button>
                <span className="text-sm font-semibold flex-1">{selectedSystem.name}</span>
              </div>

              {/* Header */}
              <div className={cn("rounded-xl border p-3 flex items-center gap-3", selectedSystem.bg, selectedSystem.border)}>
                {(() => { const Icon = selectedSystem.icon; return <Icon className={cn("size-6 shrink-0", selectedSystem.color)} />; })()}
                <div>
                  <p className={cn("text-sm font-bold", selectedSystem.color)}>{selectedSystem.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedSystem.origin}</p>
                </div>
              </div>

              {/* Govt recognition */}
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-start gap-1.5">
                <ShieldCheckIcon className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-foreground/80 leading-snug">{selectedSystem.govtRecognition}</p>
              </div>

              {/* Principles */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Core Principles</p>
                <ul className="space-y-1">
                  {selectedSystem.principles.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <span className={cn("mt-0.5 size-1.5 rounded-full shrink-0 mt-[5px]", selectedSystem.color.replace("text-", "bg-"))} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strengths */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Strengths</p>
                <ul className="space-y-1">
                  {selectedSystem.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <CheckCircle2Icon className="size-3 text-emerald-500 shrink-0 mt-0.5" /> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Limitations</p>
                <ul className="space-y-1">
                  {selectedSystem.limitations.map((l, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <AlertTriangleIcon className="size-3 text-amber-500 shrink-0 mt-0.5" /> {l}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key practices */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Key Practices</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSystem.keyPractices.map((p) => (
                    <span key={p} className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", selectedSystem.bg, selectedSystem.border, selectedSystem.color)}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Integration */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ZapIcon className="size-3.5 text-amber-600" />
                  <span className="text-[11px] font-semibold text-amber-700">Integration & Research</span>
                </div>
                <p className="text-[11px] leading-relaxed text-foreground/80">{selectedSystem.integration}</p>
              </div>
            </div>
          )}

          {/* ── DEPT DETAIL ── */}
          {panel.view === "dept-detail" && selectedDept && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={() => { setPanel({ view: "overview" }); setSelectedDept(null); }} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeftIcon className="size-4" />
                </Button>
                <span className="text-sm font-semibold flex-1">{selectedDept.name}</span>
              </div>

              {/* Header */}
              <div className={cn("rounded-xl border p-3 flex items-center gap-3", selectedDept.bg, "border-current/20")}>
                {(() => { const Icon = selectedDept.icon; return <Icon className={cn("size-6 shrink-0", selectedDept.color)} />; })()}
                <div>
                  <p className={cn("text-sm font-bold", selectedDept.color)}>{selectedDept.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedDept.focus}</p>
                </div>
              </div>

              {/* Anatomy */}
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MicroscopeIcon className="size-3 text-primary/60" /> Relevant Anatomy
                </p>
                <p className="text-[11px] leading-relaxed text-foreground/80">{selectedDept.anatomy}</p>
              </div>

              {/* Conditions */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Common Conditions</p>
                <div className="flex flex-wrap gap-1">
                  {selectedDept.conditions.map((c) => (
                    <span key={c} className="rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-foreground/80">{c}</span>
                  ))}
                </div>
              </div>

              {/* Procedures */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Key Procedures & Tests</p>
                <ul className="space-y-1">
                  {selectedDept.keyProcedures.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <ClipboardListIcon className="size-3 text-primary/50 shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ArogyaAI note */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ZapIcon className="size-3.5 text-amber-600" />
                  <span className="text-[11px] font-semibold text-amber-700">ArogyaAI Note</span>
                </div>
                <p className="text-[11px] leading-relaxed text-foreground/80">
                  {selectedDept.name} integrates with Ayurveda (herbal support), Naturopathy (lifestyle modification), and modern allopathic diagnostics for comprehensive management. Multidisciplinary care yields best patient outcomes.
                </p>
              </div>
            </div>
          )}

          {/* ── PDF CHAT ── */}
          {panel.view === "pdf-chat" && pdfSource && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="shrink-0 p-3 border-b border-border flex items-center gap-2">
                <Button onClick={() => { setPanel({ view: "overview" }); setActiveTab("pdf"); }} className="text-muted-foreground hover:text-foreground transition-colors shrink-0"><ArrowLeftIcon className="size-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">
                    {pdfSource.type === "file" ? pdfSource.name : (pdfSource.url.split("/").pop() || "Document")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">PDF Q&A</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {pdfMessages.map((msg, i) => (
                  <div key={i} className={cn("text-[11px] leading-relaxed", msg.role === "user" ? "text-right" : "")}>
                    {msg.role === "user" ? (
                      <span className="inline-block rounded-xl bg-primary text-primary-foreground px-3 py-1.5 max-w-[90%] text-left">
                        {msg.text}
                      </span>
                    ) : (
                      <div className="space-y-2">
                        <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
                          <div className="flex items-center gap-1 mb-1.5">
                            <ZapIcon className="size-3 text-amber-500" />
                            <span className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">ArogyaAI</span>
                          </div>
                          <p className="text-foreground/80">{msg.text}</p>
                        </div>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2 space-y-1">
                            <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                              <BookOpenIcon className="size-3" /> Document Citations
                            </p>
                            {msg.citations.map((c, ci) => (
                              <p key={ci} className="text-[10px] text-blue-700 flex items-center gap-1">
                                <span className="size-3 rounded-full bg-blue-100 text-blue-600 text-[8px] flex items-center justify-center font-bold shrink-0">{ci + 1}</span>
                                {c}
                              </p>
                            ))}
                          </div>
                        )}
                        {msg.related && msg.related.length > 0 && (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2 space-y-1">
                            <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                              <TrendingUpIcon className="size-3" /> Related Research
                            </p>
                            {msg.related.map((r, ri) => (
                              <p key={ri} className="text-[10px] text-emerald-700 leading-snug">{r}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {pdfLoading && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Loader2Icon className="size-3.5 animate-spin text-primary" />
                    Searching document…
                  </div>
                )}
                <div ref={pdfChatEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 p-3 border-t border-border">
                <div className="flex gap-1.5">
                  <Input
                    suppressHydrationWarning
                    type="text" value={pdfQuestion}
                    onChange={(e) => setPdfQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePdfAsk()}
                    placeholder="Ask a question about the document…"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-colors"
                  />
                  <Button size="sm" className="shrink-0 h-auto p-1.5" disabled={!pdfQuestion.trim() || pdfLoading} onClick={handlePdfAsk}>
                    <SendIcon className="size-3.5" />
                  </Button>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1.5 text-center">AI answers are for reference. Verify with a clinician.</p>
              </div>
            </div>
          )}

          {/* Default right panel when no sub-view active */}
          {panel.view === "overview" && activeTab !== "browse" && (
            <div className="p-5 flex flex-col items-center justify-center h-full text-center gap-3">
              {activeTab === "systems" && (
                <>
                  <LayersIcon className="size-8 text-muted-foreground/20" />
                  <p className="text-sm font-medium text-muted-foreground">Select a medical system</p>
                  <p className="text-xs text-muted-foreground/70">Compare principles, strengths, and clinical applications across 7 traditions</p>
                </>
              )}
              {activeTab === "departments" && (
                <>
                  <BuildingIcon className="size-8 text-muted-foreground/20" />
                  <p className="text-sm font-medium text-muted-foreground">Select a department</p>
                  <p className="text-xs text-muted-foreground/70">View anatomy, conditions, procedures, and integrative insights</p>
                </>
              )}
              {activeTab === "pdf" && (
                <>
                  <FileUpIcon className="size-8 text-muted-foreground/20" />
                  <p className="text-sm font-medium text-muted-foreground">No document loaded</p>
                  <p className="text-xs text-muted-foreground/70">Upload a PDF or paste a URL on the left to start asking questions</p>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE — /community (default community view)
═══════════════════════════════════════════════════════════════════ */
const CommunityPage = () => {
  return <CommunityWrapperContainer variant="community" group="community" tab="feed" />;
};

export default CommunityPage;
