"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ThumbsUpIcon, MessageSquareIcon,
  ArrowRightLeftIcon,
  GlobeIcon, FlameIcon, MapPinIcon, TrophyIcon, ZapIcon, XIcon,
  MicIcon, ArrowLeftIcon,
  PaperclipIcon, ImageIcon,
  GraduationCapIcon, PillIcon, FlaskConicalIcon,
  ClipboardListIcon, MicroscopeIcon, SearchIcon,
  CheckCircle2Icon, AlertTriangleIcon, XCircleIcon,
  LeafIcon, SunIcon, WindIcon, DropletIcon, LayersIcon,
  BuildingIcon, HeartIcon, BrainIcon, BoneIcon,
  SendIcon, FileUpIcon, LinkIcon, Loader2Icon, ChevronRightIcon,
  StethoscopeIcon, ScanLineIcon, UserIcon,
  ArrowRightIcon, BrainCircuitIcon, FileTextIcon, UsersIcon,
  BookOpenIcon, SparklesIcon, ShieldCheckIcon, TrendingUpIcon, UserPlusIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

/* ── New module imports ─────────────────────────────────────────── */
import { YoursContent } from "@/components/liveboard/yours-content";
import { ArogyaAIContent } from "@/components/liveboard/arogyaai-content";
import { COMMUNITY_POSTS, TRENDING_TOPICS, TOP_CONTRIBUTORS, REGION_ACTIVITY, POST_SUMMARIES, POST_AI_RESPONSES } from "@/data/community-data";
import { LINKED_MEMBER_DATA, LINKED_POST_SUMMARIES, LINKED_POST_AI_RESPONSES } from "@/data/linked-member-data";
import { VOICE_LANGUAGES } from "@/data/voice-languages";
import { EDU_TOPICS, EDU_CATEGORIES, DRUG_INTERACTIONS, LAB_QUICK_REF, LEVEL_CONFIG } from "@/data/learn-data";
import { MEDICAL_SYSTEMS, DEPARTMENTS, BODY_REGIONS } from "@/data/medical-systems-data";
import { generateRephrasings } from "@/lib/post-utils";
import { normDrug, lookupInteraction } from "@/lib/drug-utils";
import { getPdfAiResponse } from "@/lib/pdf-utils";
import type { CommunityPost } from "@/models/community";
import type { LinkedPost, LinkedMember } from "@/models/community";
import type { EduLevel, EduTopic, MedSystem, Department, BodyRegion, BodyRegionDef, PdfMessage } from "@/models/learn";

/* Lazy-loaded: tab nav skeleton keeps height so layout doesn't shift */
const ContentTabs = dynamic(
  () => import("@/components/app/content-tabs").then((m) => ({ default: m.ContentTabs })),
  {
    loading: () => (
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
      </div>
    ),
  }
);

/* Lazy-loaded: modal only fetched when Invite button is clicked */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null }
);

/* ═══════════════════════════════════════════════════════════════════
   AROGYATALK — community content
═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   AROGYALEARN — evidence-based medical knowledge hub
═══════════════════════════════════════════════════════════════════ */
function ArogyaLearnContent() {
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

  function runDrugCheck() {
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
  function DrugCheckerUI({ full = false }: { full?: boolean }) {
    return (
      <div className="space-y-2.5">
        {drugs.map((d, i) => (
          <div key={i} className="flex gap-1.5">
            <input
              type="text" value={d}
              onChange={(e) => setDrugs((prev) => prev.map((v, idx) => idx === i ? e.target.value : v))}
              placeholder={`Drug ${i + 1} (e.g. Metformin)`}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
            />
            {i >= 2 && (
              <button onClick={() => setDrugs((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground shrink-0">
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {full && drugs.length < 5 && (
          <button
            onClick={() => setDrugs((prev) => [...prev, ""])}
            className="text-[11px] text-primary hover:underline"
          >+ Add another drug</button>
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
  function handlePdfFile(file: File) {
    setPdfSource({ type: "file", name: file.name });
    setPdfMessages([{ role: "ai", text: `Document "${file.name}" loaded. I've indexed the content. Ask me any question about it.`, citations: [] }]);
    setPanel({ view: "pdf-chat" });
  }

  function handlePdfUrl() {
    const url = pdfUrlInput.trim();
    if (!url) return;
    const name = url.split("/").pop() || "document.pdf";
    setPdfSource({ type: "url", url });
    setPdfMessages([{ role: "ai", text: `Document at "${url}" has been fetched and indexed. Ask me any question about its content.`, citations: [] }]);
    setPdfUrlInput("");
    setPanel({ view: "pdf-chat" });
  }

  function handlePdfAsk() {
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
            <button
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
            </button>
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
                <button
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
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conditions, medications, lab values…"
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5">
              {EDU_CATEGORIES.map((cat) => (
                <button
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
                </button>
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
                    <button
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
                    </button>
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
              <input
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
                  <button
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
                  </button>
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
                <button
                  onClick={() => setDeptRegion("all")}
                  className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    deptRegion === "all" ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                  )}
                >All</button>
                {BODY_REGIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setDeptRegion(r.id)}
                    className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      deptRegion === r.id ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >{r.label}</button>
                ))}
              </div>
            </div>

            {/* Anatomy diagram placeholder */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {BODY_REGIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setDeptRegion(r.id === deptRegion ? "all" : r.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-2 min-w-[60px] transition-colors text-center",
                      deptRegion === r.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/30"
                    )}
                  >
                    <span className="text-base">{r.id === "head" ? "🧠" : r.id === "chest" ? "❤️" : r.id === "abdomen" ? "🫁" : r.id === "neuro" ? "🧠" : r.id === "musculo" ? "🦴" : r.id === "systemic" ? "🩺" : "🫀"}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Department cards */}
            <div className="space-y-2">
              {DEPARTMENTS.filter((d) => deptRegion === "all" || d.bodyRegion === deptRegion).map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept?.id === dept.id;
                return (
                  <button
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
                  </button>
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
                <input
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
                  <input
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
                <button
                  onClick={() => { setPdfSource(null); setPdfMessages([]); setPanel({ view: "overview" }); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
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
                  <button
                    onClick={() => { setPanel({ view: "drug-check" }); setChecked(false); setInteractionResults([]); }}
                    className="text-[10px] text-primary hover:underline"
                  >
                    Full checker →
                  </button>
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
                  <button onClick={() => setPanel({ view: "overview" })} className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeftIcon className="size-4" />
                  </button>
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
                <button onClick={() => { setPanel({ view: "overview" }); setChecked(false); setInteractionResults([]); setDrugs(["", ""]); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeftIcon className="size-4" />
                </button>
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
                <button onClick={() => { setPanel({ view: "overview" }); setSelectedSystem(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeftIcon className="size-4" />
                </button>
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
                <button onClick={() => { setPanel({ view: "overview" }); setSelectedDept(null); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeftIcon className="size-4" />
                </button>
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
                <button onClick={() => { setPanel({ view: "overview" }); setActiveTab("pdf"); }} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <ArrowLeftIcon className="size-4" />
                </button>
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
                  <input
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

function ArogyaTalkContent() {
  type PanelState =
    | { view: "analytics" }
    | { view: "summary"; postId: number }
    | { view: "replies"; postId: number }
    | { view: "reply-preview"; postId: number; original: string; rephrasings: [string, string] };

  const [posts, setPosts] = React.useState<CommunityPost[]>(COMMUNITY_POSTS);
  const [composeText, setComposeText] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());
  const nextPostIdRef = React.useRef(COMMUNITY_POSTS.length);

  const [panel, setPanel] = React.useState<PanelState>({ view: "analytics" });
  const [replyText, setReplyText] = React.useState("");
  const [replyTab, setReplyTab] = React.useState<"text" | "voice" | "attach">("text");

  type AttachStep =
    | { step: "select" }
    | { step: "preview"; file: File; previewUrl: string; caption: string }
    | { step: "analyzing" }
    | { step: "analyzed"; file: File; previewUrl: string; caption: string; docType: string; extractedText: string; summary: string };
  const [attachState, setAttachState] = React.useState<AttachStep>({ step: "select" });
  const [attachedDoc, setAttachedDoc] = React.useState<{
    filename: string; previewUrl: string; docType: string; isPdf: boolean;
  } | null>(null);
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const [voiceState, setVoiceState] = React.useState<"idle" | "recording" | "translating" | "done">("idle");
  const [voiceLang, setVoiceLang] = React.useState("en-IN");
  const [liveTranscript, setLiveTranscript] = React.useState("");
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  /** Stores the native-language transcript + lang code after voice recording */
  const [voiceRecording, setVoiceRecording] = React.useState<{ lang: string; original: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = React.useRef<any>(null);
  const finalTranscriptRef = React.useRef("");
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const activePostId = panel.view !== "analytics" ? panel.postId : null;
  const activePost = activePostId !== null
    ? posts.find((p) => p.id === activePostId) ?? null
    : null;
  /** True when we have a non-English voice recording to display alongside the translation */
  const hasNativeTranscript = voiceRecording !== null && !voiceRecording.lang.startsWith("en");
  const voiceLangInfo = hasNativeTranscript
    ? (VOICE_LANGUAGES.find((l) => l.code === voiceRecording!.lang) ?? null)
    : null;

  function openReplies(postId: number) {
    setPanel({ view: "replies", postId });
    setReplyText("");
    setReplyTab("text");
    setVoiceRecording(null);
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  }

  function openSummary(postId: number) {
    setPanel({ view: "summary", postId });
  }

  function closePanel() {
    setPanel({ view: "analytics" });
    setReplyText("");
    setVoiceRecording(null);
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  }

  function handlePreviewSend() {
    if (panel.view !== "replies") return;
    const rephrasings = generateRephrasings(replyText);
    setSelectedVersion(1);
    setPanel({ view: "reply-preview", postId: panel.postId, original: replyText, rephrasings });
  }

  function handleBackToCompose() {
    if (panel.view !== "reply-preview") return;
    const { postId, original } = panel;
    setReplyText(original);
    setPanel({ view: "replies", postId });
  }

  /* ── Compose new post ── */
  function handlePost() {
    const trimmed = composeText.trim();
    if (!trimmed) return;
    const newPost: CommunityPost = {
      id: nextPostIdRef.current++,
      initials: "KU", author: "Kumar", location: "Hyderabad", time: "Just now",
      text: trimmed, likes: 0, replyCount: 0, tag: "Discussion",
      replies: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setComposeText("");
  }

  /* ── Like toggle ── */
  function toggleLike(postId: number) {
    const isLiked = likedPosts.has(postId);
    setLikedPosts((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p)
    );
  }

  /* ── Submit reply (from preview panel) ── */
  function handleSubmitReply() {
    if (panel.view !== "reply-preview") return;
    const { postId } = panel;
    const versions: string[] = [panel.original, ...panel.rephrasings];
    const text = versions[selectedVersion];
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replyCount: p.replyCount + 1,
              replies: [
                ...p.replies,
                { initials: "KU", author: "Kumar", time: "Just now", text },
              ],
            }
          : p
      )
    );
    closePanel();
  }

  /* ── Image / PDF attachment ── */
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAttachState({ step: "preview", file, previewUrl, caption: "" });
    // reset input so same file can be re-selected after reset
    e.target.value = "";
  }

  function resetAttach() {
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  }

  async function handleAnalyzeImage() {
    if (attachState.step !== "preview") return;
    const { file, previewUrl, caption } = attachState;
    setAttachState({ step: "analyzing" });
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type }),
      });
      const data = await res.json() as { docType: string; extractedText: string; summary: string };
      setAttachState({ step: "analyzed", file, previewUrl, caption, ...data });
    } catch {
      // On failure return to preview
      setAttachState({ step: "preview", file, previewUrl, caption });
    }
  }

  function handleUseAttachment() {
    if (attachState.step !== "analyzed") return;
    const { file, previewUrl, caption, docType, summary } = attachState;
    const replyContent = caption ? `${caption}\n\n${summary}` : summary;
    setAttachedDoc({
      filename: file.name,
      previewUrl,
      docType,
      isPdf: file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
    });
    setReplyText(replyContent);
    setReplyTab("text");
  }

  /* ── Voice recording ── */
  function stopVoiceTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function stopVoiceRecording() {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    stopVoiceTimer();
  }

  function formatSeconds(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function startVoiceRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice recording requires Chrome or Edge. Please type your reply instead.");
      return;
    }
    finalTranscriptRef.current = "";
    setLiveTranscript("");
    setRecordingSeconds(0);
    setVoiceState("recording");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLang;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setLiveTranscript((finalTranscriptRef.current + interim).trim());
    };

    recognition.onend = () => {
      stopVoiceTimer();
      const text = finalTranscriptRef.current.trim();
      if (!text) { setVoiceState("idle"); return; }

      const isEnglish = voiceLang === "en-IN" || voiceLang.startsWith("en");

      if (isEnglish) {
        // No translation needed — go straight to done
        setVoiceRecording(null);
        setReplyText(text);
        setVoiceState("done");
        setTimeout(() => { setReplyTab("text"); setVoiceState("idle"); setLiveTranscript(""); }, 1200);
      } else {
        // Store original native-language transcript so we can show it alongside the translation
        setVoiceRecording({ lang: voiceLang, original: text });
        setVoiceState("translating");
        (async () => {
          try {
            const res = await fetch(
              `/api/translate?text=${encodeURIComponent(text)}&from=${encodeURIComponent(voiceLang)}`
            );
            const data = await res.json() as { translated: string; original: string };
            setReplyText(data.translated || text);
          } catch {
            setReplyText(text); // graceful fallback: use original transcript
          }
          setVoiceState("done");
          setTimeout(() => { setReplyTab("text"); setVoiceState("idle"); setLiveTranscript(""); }, 1200);
        })();
      }
    };

    recognition.onerror = () => { stopVoiceTimer(); setVoiceState("idle"); };

    recognitionRef.current = recognition;
    recognition.start();
    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  }

  /* Stop recording on unmount */
  React.useEffect(() => {
    return () => { stopVoiceRecording(); }; // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  /* Stop recording when user navigates away from the replies panel */
  React.useEffect(() => {
    if (panel.view !== "replies") { stopVoiceRecording(); setVoiceState("idle"); }
  }, [panel.view]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header banner ── */}
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <MessageSquareIcon className="size-4" />
            </div>
            <span className="font-bold text-lg">ArogyaTalk</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">Community</Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              <GlobeIcon className="size-2.5" /> Public
            </Badge>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              <UsersIcon className="size-2.5" /> 12,847 members
            </Badge>
          </div>
          <p className="text-sm text-primary-foreground/80 leading-relaxed mt-2">
            Connect with other ArogyaVault members. Ask questions, share experiences, support each other.{" "}
            <a
              href="/arogyatalk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 text-primary-foreground/90 hover:text-primary-foreground"
            >
              Learn more →
            </a>
          </p>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex-1 overflow-hidden flex min-h-0">

        {/* LEFT — Compose + Posts (no max-w-xl so posts fill the column) */}
        <div className="flex-1 min-w-0 overflow-y-auto px-5 pb-5 lg:px-6">
          <div className="space-y-3 pt-1">

            {/* Compose box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex gap-2 items-start">
                <Avatar className="size-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">KU</AvatarFallback>
                </Avatar>
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="Share a tip, ask the community, or start a discussion…"
                  rows={2}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
                />
                <Button
                  size="sm"
                  className="shrink-0"
                  disabled={!composeText.trim()}
                  onClick={handlePost}
                >
                  Post
                </Button>
              </div>
            </div>

            {/* Post cards */}
            {posts.map((p) => (
              <div
                key={p.id}
                onClick={() => openReplies(p.id)}
                className={cn(
                  "rounded-xl border bg-background p-4 cursor-pointer transition-colors",
                  activePostId === p.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/20 hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{p.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{p.author}</span>
                      <span className="text-xs text-muted-foreground">{p.location} · {p.time}</span>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{p.tag}</Badge>
                    </div>
                    <p className="text-sm mt-1.5 leading-relaxed">{p.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {/* Like */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          likedPosts.has(p.id) ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        <ThumbsUpIcon className={cn("size-3.5", likedPosts.has(p.id) && "fill-current")} /> {p.likes}
                      </button>
                      {/* Replies */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openReplies(p.id); }}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          panel.view === "replies" && activePostId === p.id
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        <MessageSquareIcon className="size-3.5" />
                        {p.replyCount} {p.replyCount === 1 ? "reply" : "replies"}
                      </button>
                      {/* AI Summary */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openSummary(p.id); }}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          panel.view === "summary" && activePostId === p.id
                            ? "text-violet-600 font-medium"
                            : "text-muted-foreground hover:text-violet-600"
                        )}
                      >
                        <SparklesIcon className="size-3.5" /> AI Summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — State-machine panel */}
        <div className="w-72 shrink-0 overflow-y-auto">

          {/* ── ANALYTICS ── */}
          {panel.view === "analytics" && (
            <div className="p-4 space-y-5">
              {/* Community Pulse */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ZapIcon className="size-3 text-primary" /> Community Pulse
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Members",    value: "12,847" },
                    { label: "Today",      value: "23 posts" },
                    { label: "Active now", value: "156" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border bg-background p-2 text-center">
                      <p className="text-sm font-bold text-primary leading-tight">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FlameIcon className="size-3 text-orange-500" /> Trending Topics
                </p>
                <div className="space-y-2">
                  {TRENDING_TOPICS.map((t) => (
                    <div key={t.topic}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs truncate flex-1">{t.topic}</span>
                        <span className="text-[10px] text-muted-foreground ml-1 shrink-0">{t.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Regions */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPinIcon className="size-3 text-primary" /> Active Regions
                </p>
                <div className="space-y-2">
                  {REGION_ACTIVITY.map((r) => (
                    <div key={r.region}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs">{r.region}</span>
                        <span className="text-[10px] text-muted-foreground">{r.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TrophyIcon className="size-3 text-amber-500" /> Top Contributors
                </p>
                <div className="space-y-2.5">
                  {TOP_CONTRIBUTORS.map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground w-3 shrink-0">{i + 1}</span>
                      <Avatar className="size-6 shrink-0">
                        <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{c.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.helpful} helpful votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground mb-2 leading-snug">
                  Click any post to read replies or tap <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI Summary for a quick digest.
                </p>
                <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
                  Ask the Community
                </Button>
              </div>
            </div>
          )}

          {/* ── AI SUMMARY ── */}
          {panel.view === "summary" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="size-4 text-violet-600" />
                  <span className="text-sm font-semibold">AI Summary</span>
                </div>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Original question */}
              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-primary mb-1">
                  {activePost.author} · {activePost.location}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{activePost.text}</p>
              </div>

              {/* AI-synthesised summary */}
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-violet-100">
                    <SparklesIcon className="size-3 text-violet-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-violet-700">ArogyaAI Summary</span>
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-[9px] ml-auto">
                    {activePost.replyCount} replies analysed
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  {POST_SUMMARIES[activePost.id]}
                </p>
              </div>

              {/* View replies CTA */}
              <button
                onClick={() => openReplies(activePost.id)}
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquareIcon className="size-3.5" /> View all {activePost.replyCount} replies
              </button>
            </div>
          )}

          {/* ── REPLIES + COMPOSE ── */}
          {panel.view === "replies" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{activePost.replyCount} Replies</span>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Post preview */}
              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-primary mb-1">
                  {activePost.author} · {activePost.location}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {activePost.text}
                </p>
              </div>

              {/* Reply list */}
              <div className="space-y-3">
                {activePost.replies.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <Avatar className="size-6 shrink-0 mt-0.5">
                      <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{r.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-xl rounded-tl-sm bg-muted border border-border/60 px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-semibold">{r.author}</span>
                        <span className="text-[10px] text-muted-foreground">{r.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compose area */}
              <div className="space-y-2.5 pt-1 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground pt-2">Add your reply</p>

                {/* Text / Voice / Attach tabs */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setReplyTab("text")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors",
                      replyTab === "text"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageSquareIcon className="size-3" /> Text
                  </button>
                  <button
                    onClick={() => setReplyTab("voice")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors",
                      replyTab === "voice"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MicIcon className="size-3" /> Voice
                  </button>
                  <button
                    onClick={() => setReplyTab("attach")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors",
                      replyTab === "attach"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <PaperclipIcon className="size-3" /> Attach
                  </button>
                </div>

                {replyTab === "text" ? (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a helpful reply…"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />

                    {/* Original native-language transcript reference */}
                    {hasNativeTranscript && voiceRecording && (
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MicIcon className="size-3 text-muted-foreground/60" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {voiceLangInfo?.native ?? voiceRecording.lang} · Original
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                          {voiceRecording.original}
                        </p>
                      </div>
                    )}

                    {/* Attached document reference */}
                    {attachedDoc && (
                      <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                        {attachedDoc.isPdf ? (
                          <FileTextIcon className="size-5 text-red-400 shrink-0" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={attachedDoc.previewUrl} alt="" className="size-8 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">📎 Attachment</p>
                          <p className="text-xs font-medium truncate">{attachedDoc.docType}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{attachedDoc.filename}</p>
                        </div>
                        <button onClick={() => setAttachedDoc(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!replyText.trim()}
                      onClick={handlePreviewSend}
                    >
                      Preview &amp; Send
                    </Button>
                  </>
                ) : replyTab === "attach" ? (
                  /* ════════════════════════════════
                     ATTACH TAB — 4-step flow
                  ════════════════════════════════ */
                  <div className="space-y-2.5">

                    {/* STEP 1 — SELECT */}
                    {attachState.step === "select" && (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="sr-only"
                          onChange={handleFileSelect}
                        />
                        <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-5 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors">
                          <div className="flex gap-2 justify-center mb-3">
                            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                              <ImageIcon className="size-4 text-primary" />
                            </div>
                            <div className="size-9 rounded-xl bg-red-50 flex items-center justify-center">
                              <FileTextIcon className="size-4 text-red-500" />
                            </div>
                          </div>
                          <p className="text-xs font-semibold mb-1">Share a document or photo</p>
                          <p className="text-[11px] text-muted-foreground leading-snug mb-3">
                            Prescription, lab report, scan — show your proof to the community
                          </p>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                            <PaperclipIcon className="size-3" /> Browse Files
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-2">JPG · PNG · PDF supported</p>
                        </div>
                      </label>
                    )}

                    {/* STEP 2 — PREVIEW */}
                    {attachState.step === "preview" && (
                      <>
                        {/* File preview */}
                        <div className="relative rounded-lg border border-border overflow-hidden">
                          {attachState.file.type === "application/pdf" || attachState.file.name.toLowerCase().endsWith(".pdf") ? (
                            <div className="bg-red-50 p-3 flex items-center gap-3">
                              <FileTextIcon className="size-8 text-red-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{attachState.file.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {(attachState.file.size / 1024).toFixed(0)} KB · PDF Document
                                </p>
                              </div>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={attachState.previewUrl}
                              alt="Preview"
                              className="w-full max-h-36 object-cover"
                            />
                          )}
                          <button
                            onClick={resetAttach}
                            className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                          >
                            <XIcon className="size-3" />
                          </button>
                        </div>

                        {/* Caption */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Caption <span className="normal-case font-normal">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={attachState.caption}
                            onChange={(e) =>
                              setAttachState((prev) =>
                                prev.step === "preview" ? { ...prev, caption: e.target.value } : prev
                              )
                            }
                            placeholder="e.g. My latest HbA1c report showing 6.9%…"
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                          />
                        </div>

                        <Button size="sm" className="w-full" onClick={handleAnalyzeImage}>
                          <SparklesIcon className="size-3.5 mr-1.5" /> Analyze with AI
                        </Button>
                      </>
                    )}

                    {/* STEP 3 — ANALYZING */}
                    {attachState.step === "analyzing" && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                        <div
                          className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto animate-spin"
                          style={{ animationDuration: "1.8s" }}
                        >
                          <SparklesIcon className="size-5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold text-primary">AI is reading your document…</p>
                        <p className="text-[11px] text-muted-foreground">Extracting text and generating summary</p>
                      </div>
                    )}

                    {/* STEP 4 — ANALYZED */}
                    {attachState.step === "analyzed" && (
                      <>
                        {/* Mini file header */}
                        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          {attachState.file.type === "application/pdf" || attachState.file.name.toLowerCase().endsWith(".pdf") ? (
                            <FileTextIcon className="size-6 text-red-400 shrink-0" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={attachState.previewUrl}
                              alt=""
                              className="size-10 rounded-md object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{attachState.file.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {attachState.docType} · AI Analyzed ✓
                            </p>
                          </div>
                          <button
                            onClick={resetAttach}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <XIcon className="size-3.5" />
                          </button>
                        </div>

                        {/* Extracted text */}
                        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                            Extracted Text
                          </p>
                          <pre className="text-[11px] text-foreground/70 leading-relaxed font-sans whitespace-pre-wrap line-clamp-5">
                            {attachState.extractedText}
                          </pre>
                        </div>

                        {/* AI Summary */}
                        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <SparklesIcon className="size-3.5 text-violet-600" />
                            <span className="text-[11px] font-semibold text-violet-700">AI Summary</span>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/80">
                            {attachState.summary}
                          </p>
                        </div>

                        <Button size="sm" className="w-full" onClick={handleUseAttachment}>
                          Use as Reply
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">

                    {/* ── IDLE ── */}
                    {voiceState === "idle" && (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                          <MicIcon className="size-5 text-primary" />
                        </div>

                        {/* Language picker */}
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            Speak in
                          </label>
                          <select
                            value={voiceLang}
                            onChange={(e) => setVoiceLang(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary transition-colors cursor-pointer"
                          >
                            {VOICE_LANGUAGES.map((l) => (
                              <option key={l.code} value={l.code}>
                                {l.native}  —  {l.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-snug text-center">
                          ArogyaAI will transcribe your speech live as you speak.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-primary/30 text-primary"
                          onClick={startVoiceRecording}
                        >
                          Start Recording
                        </Button>
                      </div>
                    )}

                    {/* ── RECORDING ── */}
                    {voiceState === "recording" && (
                      <div className="space-y-2.5">
                        {/* Pulsing mic + timer */}
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                            <div className="relative flex size-12 items-center justify-center rounded-full bg-red-500 shadow-md">
                              <MicIcon className="size-5 text-white" />
                            </div>
                          </div>
                          <span className="text-sm font-mono font-bold text-red-500 tabular-nums">
                            {formatSeconds(recordingSeconds)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Listening in</span>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.native ?? voiceLang}
                            </span>
                          </div>
                        </div>
                        {/* Live transcript preview */}
                        <div className="rounded-lg border border-border bg-background px-3 py-2.5 min-h-[60px] flex items-start">
                          {liveTranscript ? (
                            <p className="text-xs leading-relaxed text-foreground/70 italic">{liveTranscript}</p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/50 italic m-auto self-center w-full text-center">
                              Start speaking…
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs"
                          onClick={stopVoiceRecording}
                        >
                          Stop Recording
                        </Button>
                      </div>
                    )}

                    {/* ── TRANSLATING ── */}
                    {voiceState === "translating" && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                        {/* Spinning sparkles icon */}
                        <div
                          className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto animate-spin"
                          style={{ animationDuration: "1.8s" }}
                        >
                          <SparklesIcon className="size-5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold text-primary">Translating to English…</p>
                        {/* Show source → target */}
                        <p className="text-[11px] text-muted-foreground">
                          {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.native ?? voiceLang}
                          {" → "}
                          <span className="font-medium text-foreground/70">English</span>
                        </p>
                        {/* Original transcript preview */}
                        {liveTranscript && (
                          <p className="text-[11px] text-muted-foreground/60 italic leading-snug line-clamp-3 pt-1 border-t border-border/50">
                            {liveTranscript}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── DONE — briefly shown before auto-switch to text tab ── */}
                    {voiceState === "done" && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-2">
                          <span className="text-emerald-600 text-lg font-bold leading-none">✓</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">Transcribed successfully!</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Opening text editor…</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REPLY PREVIEW ── */}
          {panel.view === "reply-preview" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToCompose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="size-4" />
                </button>
                <span className="text-sm font-semibold flex-1">Review Your Reply</span>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              {/* Your reply — English (translated if voice was in another language) */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {hasNativeTranscript ? "Your reply · English (Translated)" : "Your reply"}
                </p>
                <button
                  onClick={() => setSelectedVersion(0)}
                  className={cn(
                    "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                    selectedVersion === 0
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  )}
                >
                  <p className="text-xs leading-relaxed">{panel.original}</p>
                  {selectedVersion === 0 && (
                    <span className="text-[10px] text-primary font-medium mt-1 block">✓ Selected</span>
                  )}
                </button>
              </div>

              {/* Attached document — shown when reply came from the Attach tab */}
              {attachedDoc && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <PaperclipIcon className="size-3" /> Attached Document
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    {attachedDoc.isPdf ? (
                      <div className="flex items-center gap-3 bg-red-50 px-3 py-2.5">
                        <FileTextIcon className="size-7 text-red-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{attachedDoc.filename}</p>
                          <p className="text-[10px] text-muted-foreground">{attachedDoc.docType}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-muted/30 px-3 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={attachedDoc.previewUrl} alt="" className="size-12 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{attachedDoc.filename}</p>
                          <p className="text-[10px] text-muted-foreground">{attachedDoc.docType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Original native-language recording — shown only when voice was non-English */}
              {hasNativeTranscript && voiceRecording && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MicIcon className="size-3" />
                    {voiceLangInfo?.native ?? voiceRecording.lang} · Recorded
                  </p>
                  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {voiceLangInfo?.label ?? voiceRecording.lang}
                      </span>
                      <span className="text-[10px] text-muted-foreground">→ Translated to English above</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {voiceRecording.original}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Rephrasings */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <SparklesIcon className="size-3 text-violet-500" /> AI Rephrasings
                </p>
                <div className="space-y-2">
                  {panel.rephrasings.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVersion((i + 1) as 1 | 2)}
                      className={cn(
                        "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                        selectedVersion === i + 1
                          ? "border-violet-400 bg-violet-50/50"
                          : "border-border bg-background hover:border-violet-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-violet-600">Version {i + 1}</span>
                        {selectedVersion === i + 1 && (
                          <span className="text-[10px] text-violet-600 font-medium">✓ Selected</span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed">{r}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ArogyaAI perspective */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                    <ZapIcon className="size-3 text-amber-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700">ArogyaAI's perspective</span>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">
                  {POST_AI_RESPONSES[activePost.id]}
                </p>
              </div>

              {/* Submit */}
              <Button size="sm" className="w-full" onClick={handleSubmitReply}>
                Submit Reply
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LINKED MEMBER — info card + post feed (like ArogyaTalk)
═══════════════════════════════════════════════════════════════════ */
function LinkedMemberContent({ id }: { id: string }) {
  const member = LINKED_MEMBER_DATA[id];
  const [inviteOpen, setInviteOpen] = React.useState(false);

  type LPanelState =
    | { view: "connection-info" }
    | { view: "summary"; postId: number }
    | { view: "replies"; postId: number }
    | { view: "reply-preview"; postId: number; original: string; rephrasings: [string, string] };

  const [panel, setPanel] = React.useState<LPanelState>({ view: "connection-info" });
  const [posts, setPosts] = React.useState<LinkedPost[]>(member?.posts ?? []);
  const [composeText, setComposeText] = React.useState("");
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set());
  const [replyText, setReplyText] = React.useState("");
  const [replyTab, setReplyTab] = React.useState<"text" | "voice" | "attach">("text");
  const [selectedVersion, setSelectedVersion] = React.useState<0 | 1 | 2>(1);
  const nextPostIdRef = React.useRef((member?.posts.length ?? 0) + 100);

  /* ── Attach state ── */
  type LAttachStep =
    | { step: "select" }
    | { step: "preview"; file: File; previewUrl: string; caption: string }
    | { step: "analyzing" }
    | { step: "analyzed"; file: File; previewUrl: string; caption: string; docType: string; extractedText: string; summary: string };
  const [attachState, setAttachState] = React.useState<LAttachStep>({ step: "select" });
  const [attachedDoc, setAttachedDoc] = React.useState<{ filename: string; previewUrl: string; docType: string; isPdf: boolean } | null>(null);

  /* ── Voice state ── */
  const [voiceState, setVoiceState] = React.useState<"idle" | "recording" | "translating" | "done">("idle");
  const [voiceLang, setVoiceLang] = React.useState("en-IN");
  const [liveTranscript, setLiveTranscript] = React.useState("");
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const [voiceRecording, setVoiceRecording] = React.useState<{ lang: string; original: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lRecognitionRef = React.useRef<any>(null);
  const lFinalTranscriptRef = React.useRef("");
  const lTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  if (!member) return null;

  const activePostId = panel.view !== "connection-info" ? panel.postId : null;
  const activePost = activePostId !== null ? posts.find((p) => p.id === activePostId) ?? null : null;
  const lHasNative = voiceRecording !== null && !voiceRecording.lang.startsWith("en");
  const lVoiceLangInfo = lHasNative ? (VOICE_LANGUAGES.find((l) => l.code === voiceRecording!.lang) ?? null) : null;

  function resetVoiceAttach() {
    setReplyTab("text");
    setVoiceRecording(null);
    setAttachState({ step: "select" });
    setAttachedDoc(null);
  }

  function openReplies(postId: number) {
    setPanel({ view: "replies", postId });
    setReplyText("");
    resetVoiceAttach();
  }
  function openSummary(postId: number) { setPanel({ view: "summary", postId }); }
  function closePanel() {
    setPanel({ view: "connection-info" });
    setReplyText("");
    resetVoiceAttach();
  }

  function handlePreviewSend() {
    if (panel.view !== "replies") return;
    setSelectedVersion(1);
    setPanel({ view: "reply-preview", postId: panel.postId, original: replyText, rephrasings: generateRephrasings(replyText) });
  }
  function handleBackToCompose() {
    if (panel.view !== "reply-preview") return;
    setReplyText(panel.original);
    setPanel({ view: "replies", postId: panel.postId });
  }
  function handlePost() {
    const trimmed = composeText.trim();
    if (!trimmed) return;
    const newPost: LinkedPost = {
      id: nextPostIdRef.current++, initials: "KU", author: "You",
      time: "Just now", text: trimmed, likes: 0, replyCount: 0, tag: "Update", replies: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setComposeText("");
  }
  function toggleLike(postId: number) {
    const isLiked = likedPosts.has(postId);
    setLikedPosts((prev) => { const n = new Set(prev); isLiked ? n.delete(postId) : n.add(postId); return n; });
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p));
  }
  function handleSubmitReply() {
    if (panel.view !== "reply-preview") return;
    const { postId } = panel;
    const versions: string[] = [panel.original, ...panel.rephrasings];
    const text = versions[selectedVersion];
    setPosts((prev) => prev.map((p) => p.id === postId
      ? { ...p, replyCount: p.replyCount + 1, replies: [...p.replies, { initials: "KU", author: "You", time: "Just now", text }] }
      : p
    ));
    closePanel();
  }

  /* ── Attach helpers ── */
  function lHandleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setAttachState({ step: "preview", file, previewUrl: URL.createObjectURL(file), caption: "" });
    e.target.value = "";
  }
  function lResetAttach() { setAttachState({ step: "select" }); setAttachedDoc(null); }
  async function lHandleAnalyzeImage() {
    if (attachState.step !== "preview") return;
    const { file, previewUrl, caption } = attachState;
    setAttachState({ step: "analyzing" });
    try {
      const res = await fetch("/api/analyze-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, mimeType: file.type }) });
      const data = await res.json() as { docType: string; extractedText: string; summary: string };
      setAttachState({ step: "analyzed", file, previewUrl, caption, ...data });
    } catch {
      setAttachState({ step: "preview", file, previewUrl, caption });
    }
  }
  function lHandleUseAttachment() {
    if (attachState.step !== "analyzed") return;
    const { file, previewUrl, caption, docType, summary } = attachState;
    setAttachedDoc({ filename: file.name, previewUrl, docType, isPdf: file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") });
    setReplyText(caption ? `${caption}\n\n${summary}` : summary);
    setReplyTab("text");
  }

  /* ── Voice helpers ── */
  function lStopVoiceTimer() { if (lTimerRef.current) { clearInterval(lTimerRef.current); lTimerRef.current = null; } }
  function lStopVoiceRecording() { if (lRecognitionRef.current) { lRecognitionRef.current.stop(); lRecognitionRef.current = null; } lStopVoiceTimer(); }
  function lFormatSeconds(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

  function lStartVoiceRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice recording requires Chrome or Edge."); return; }
    lFinalTranscriptRef.current = "";
    setLiveTranscript(""); setRecordingSeconds(0); setVoiceState("recording");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = voiceLang;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) lFinalTranscriptRef.current += event.results[i][0].transcript + " ";
        else interim += event.results[i][0].transcript;
      }
      setLiveTranscript((lFinalTranscriptRef.current + interim).trim());
    };
    recognition.onend = () => {
      lStopVoiceTimer();
      const text = lFinalTranscriptRef.current.trim();
      if (!text) { setVoiceState("idle"); return; }
      if (voiceLang === "en-IN" || voiceLang.startsWith("en")) {
        setVoiceRecording(null); setReplyText(text); setVoiceState("done");
        setTimeout(() => { setReplyTab("text"); setVoiceState("idle"); setLiveTranscript(""); }, 1200);
      } else {
        setVoiceRecording({ lang: voiceLang, original: text }); setVoiceState("translating");
        (async () => {
          try {
            const res = await fetch(`/api/translate?text=${encodeURIComponent(text)}&from=${encodeURIComponent(voiceLang)}`);
            const data = await res.json() as { translated: string; original: string };
            setReplyText(data.translated || text);
          } catch { setReplyText(text); }
          setVoiceState("done");
          setTimeout(() => { setReplyTab("text"); setVoiceState("idle"); setLiveTranscript(""); }, 1200);
        })();
      }
    };
    recognition.onerror = () => { lStopVoiceTimer(); setVoiceState("idle"); };
    lRecognitionRef.current = recognition; recognition.start();
    lTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
  }

  /* Stop recording on unmount */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => { lStopVoiceRecording(); }, []);
  /* Stop recording when leaving replies panel */
  React.useEffect(() => {
    if (panel.view !== "replies") { lStopVoiceRecording(); setVoiceState("idle"); }
  }, [panel.view]); // eslint-disable-line react-hooks/exhaustive-deps

  const linkedSummary = activePostId !== null
    ? (LINKED_POST_SUMMARIES[id]?.[activePostId] ?? (activePost && activePost.replyCount === 0 ? "No replies yet on this post." : `${activePost?.replyCount ?? 0} ${activePost?.replyCount === 1 ? "reply" : "replies"} received.`))
    : "";
  const linkedAiResponse = activePostId !== null
    ? (LINKED_POST_AI_RESPONSES[id]?.[activePostId] ?? "")
    : "";

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Header banner ── */}
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {member.initials}
            </div>
            <span className="font-bold text-lg">{member.name}</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">{member.badgeLabel}</Badge>
            <Button
              size="sm" variant="outline"
              className="ml-auto shrink-0 border-white/30 text-primary-foreground hover:bg-white/10 text-xs gap-1.5"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlusIcon className="size-3.5" /> Invite
            </Button>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <ArrowRightLeftIcon className="size-3 text-primary-foreground/60 shrink-0" />
            <span className="text-xs text-primary-foreground/70">{member.direction}</span>
            <span className="text-xs text-primary-foreground/50 mx-1">·</span>
            <span className="text-xs text-primary-foreground/70">{member.scope}</span>
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex-1 overflow-hidden flex min-h-0">

        {/* LEFT — Compose + Posts */}
        <div className="flex-1 min-w-0 overflow-y-auto px-5 pb-5 lg:px-6">
          <div className="space-y-3 pt-1">

            {/* Compose */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex gap-2 items-start">
                <Avatar className="size-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">KU</AvatarFallback>
                </Avatar>
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder={`Share an update, note, or question with ${member.name.split(" ")[0]}…`}
                  rows={2}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
                />
                <Button size="sm" className="shrink-0" disabled={!composeText.trim()} onClick={handlePost}>Post</Button>
              </div>
            </div>

            {/* Posts */}
            {posts.map((p) => (
              <div
                key={p.id}
                onClick={() => openReplies(p.id)}
                className={cn(
                  "rounded-xl border bg-background p-4 cursor-pointer transition-colors",
                  activePostId === p.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/20 hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{p.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{p.author}</span>
                      <span className="text-xs text-muted-foreground">{p.time}</span>
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{p.tag}</Badge>
                    </div>
                    <p className="text-sm mt-1.5 leading-relaxed">{p.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(p.id); }}
                        className={cn("flex items-center gap-1 text-xs transition-colors", likedPosts.has(p.id) ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}
                      >
                        <ThumbsUpIcon className={cn("size-3.5", likedPosts.has(p.id) && "fill-current")} /> {p.likes}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openReplies(p.id); }}
                        className={cn("flex items-center gap-1 text-xs transition-colors", panel.view === "replies" && activePostId === p.id ? "text-primary font-medium" : "text-muted-foreground hover:text-primary")}
                      >
                        <MessageSquareIcon className="size-3.5" /> {p.replyCount} {p.replyCount === 1 ? "reply" : "replies"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openSummary(p.id); }}
                        className={cn("flex items-center gap-1 text-xs transition-colors", panel.view === "summary" && activePostId === p.id ? "text-violet-600 font-medium" : "text-muted-foreground hover:text-violet-600")}
                      >
                        <SparklesIcon className="size-3.5" /> AI Summary
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — State-machine panel */}
        <div className="w-72 shrink-0 overflow-y-auto">

          {/* ── CONNECTION INFO ── */}
          {panel.view === "connection-info" && (
            <div className="p-4 space-y-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Connection Details</p>

              <div className="space-y-2">
                {[
                  { label: "Relation",  value: member.relation },
                  { label: "Direction", value: member.direction },
                  { label: "Access",    value: member.scope },
                ].map((row) => (
                  <div key={row.label} className="rounded-lg border border-border bg-background px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{row.label}</p>
                    <p className="text-xs leading-relaxed">{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-background px-3 py-2.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Shared Feed</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-primary/5 p-2 text-center">
                    <p className="text-sm font-bold text-primary">{posts.length}</p>
                    <p className="text-[10px] text-muted-foreground">posts</p>
                  </div>
                  <div className="rounded-md bg-primary/5 p-2 text-center">
                    <p className="text-sm font-bold text-primary">{posts.reduce((s, p) => s + p.replyCount, 0)}</p>
                    <p className="text-[10px] text-muted-foreground">replies</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
                <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground mb-2 leading-snug">
                  Click any post to view replies, or tap <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI Summary for a quick digest.
                </p>
                <Button
                  asChild size="sm" variant="outline"
                  className="text-xs border-primary/30 text-primary w-full"
                >
                  <Link href={`/groups?g=${id}`} className="flex items-center gap-1.5">
                    Manage Group <ArrowRightIcon className="size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* ── AI SUMMARY ── */}
          {panel.view === "summary" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <SparklesIcon className="size-4 text-violet-600" />
                  <span className="text-sm font-semibold">AI Summary</span>
                </div>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-primary mb-1">{activePost.author} · {activePost.time}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{activePost.text}</p>
              </div>

              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-violet-100">
                    <SparklesIcon className="size-3 text-violet-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-violet-700">ArogyaAI Summary</span>
                  <Badge className="bg-violet-100 text-violet-700 border-0 text-[9px] ml-auto">
                    {activePost.replyCount} {activePost.replyCount === 1 ? "reply" : "replies"} analysed
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-foreground/80">{linkedSummary}</p>
              </div>

              {linkedAiResponse && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                      <ZapIcon className="size-3 text-amber-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700">ArogyaAI's perspective</span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">{linkedAiResponse}</p>
                </div>
              )}

              <button
                onClick={() => openReplies(activePost.id)}
                className="w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquareIcon className="size-3.5" /> View all {activePost.replyCount} {activePost.replyCount === 1 ? "reply" : "replies"}
              </button>
            </div>
          )}

          {/* ── REPLIES + COMPOSE ── */}
          {panel.view === "replies" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{activePost.replyCount} {activePost.replyCount === 1 ? "Reply" : "Replies"}</span>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-semibold text-primary mb-1">{activePost.author} · {activePost.time}</p>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{activePost.text}</p>
              </div>

              <div className="space-y-3">
                {activePost.replies.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No replies yet — be the first.</p>
                ) : (
                  activePost.replies.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <Avatar className="size-6 shrink-0 mt-0.5">
                        <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">{r.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 rounded-xl rounded-tl-sm bg-muted border border-border/60 px-3 py-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-semibold">{r.author}</span>
                          <span className="text-[10px] text-muted-foreground">{r.time}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{r.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2.5 pt-1 border-t border-border">
                <p className="text-[11px] font-semibold text-muted-foreground pt-2">Add your reply</p>

                {/* Text / Voice / Attach tabs */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["text", "voice", "attach"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setReplyTab(tab)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors",
                        replyTab === tab ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === "text"   && <><MessageSquareIcon className="size-3" /> Text</>}
                      {tab === "voice"  && <><MicIcon className="size-3" /> Voice</>}
                      {tab === "attach" && <><PaperclipIcon className="size-3" /> Attach</>}
                    </button>
                  ))}
                </div>

                {/* ── TEXT tab ── */}
                {replyTab === "text" && (
                  <>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a helpful reply…"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                    {lHasNative && voiceRecording && (
                      <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MicIcon className="size-3 text-muted-foreground/60" />
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {lVoiceLangInfo?.native ?? voiceRecording.lang} · Original
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">{voiceRecording.original}</p>
                      </div>
                    )}
                    {attachedDoc && (
                      <div className="flex items-center gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                        {attachedDoc.isPdf ? <FileTextIcon className="size-5 text-red-400 shrink-0" /> : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={attachedDoc.previewUrl} alt="" className="size-8 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">📎 Attachment</p>
                          <p className="text-xs font-medium truncate">{attachedDoc.docType}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{attachedDoc.filename}</p>
                        </div>
                        <button onClick={() => setAttachedDoc(null)} className="shrink-0 text-muted-foreground hover:text-foreground">
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    )}
                    <Button size="sm" className="w-full" disabled={!replyText.trim()} onClick={handlePreviewSend}>
                      Preview &amp; Send
                    </Button>
                  </>
                )}

                {/* ── ATTACH tab ── */}
                {replyTab === "attach" && (
                  <div className="space-y-2.5">
                    {attachState.step === "select" && (
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={lHandleFileSelect} />
                        <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-5 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors">
                          <div className="flex gap-2 justify-center mb-3">
                            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center"><ImageIcon className="size-4 text-primary" /></div>
                            <div className="size-9 rounded-xl bg-red-50 flex items-center justify-center"><FileTextIcon className="size-4 text-red-500" /></div>
                          </div>
                          <p className="text-xs font-semibold mb-1">Share a document or photo</p>
                          <p className="text-[11px] text-muted-foreground leading-snug mb-3">Prescription, lab report, scan — share as proof</p>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                            <PaperclipIcon className="size-3" /> Browse Files
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-2">JPG · PNG · PDF supported</p>
                        </div>
                      </label>
                    )}
                    {attachState.step === "preview" && (
                      <>
                        <div className="relative rounded-lg border border-border overflow-hidden">
                          {attachState.file.type === "application/pdf" || attachState.file.name.toLowerCase().endsWith(".pdf") ? (
                            <div className="bg-red-50 p-3 flex items-center gap-3">
                              <FileTextIcon className="size-8 text-red-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">{attachState.file.name}</p>
                                <p className="text-[10px] text-muted-foreground">{(attachState.file.size / 1024).toFixed(0)} KB · PDF</p>
                              </div>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={attachState.previewUrl} alt="Preview" className="w-full max-h-36 object-cover" />
                          )}
                          <button onClick={lResetAttach} className="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80">
                            <XIcon className="size-3" />
                          </button>
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                            Caption <span className="normal-case font-normal">(optional)</span>
                          </label>
                          <input
                            type="text" value={attachState.caption}
                            onChange={(e) => setAttachState((prev) => prev.step === "preview" ? { ...prev, caption: e.target.value } : prev)}
                            placeholder="e.g. My latest HbA1c showing 6.9%…"
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary placeholder:text-muted-foreground"
                          />
                        </div>
                        <Button size="sm" className="w-full" onClick={lHandleAnalyzeImage}>
                          <SparklesIcon className="size-3.5 mr-1.5" /> Analyze with AI
                        </Button>
                      </>
                    )}
                    {attachState.step === "analyzing" && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto animate-spin" style={{ animationDuration: "1.8s" }}>
                          <SparklesIcon className="size-5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold text-primary">AI is reading your document…</p>
                        <p className="text-[11px] text-muted-foreground">Extracting text and generating summary</p>
                      </div>
                    )}
                    {attachState.step === "analyzed" && (
                      <>
                        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
                          {attachState.file.type === "application/pdf" || attachState.file.name.toLowerCase().endsWith(".pdf") ? (
                            <FileTextIcon className="size-6 text-red-400 shrink-0" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={attachState.previewUrl} alt="" className="size-10 rounded-md object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{attachState.file.name}</p>
                            <p className="text-[10px] text-muted-foreground">{attachState.docType} · AI Analyzed ✓</p>
                          </div>
                          <button onClick={lResetAttach} className="shrink-0 text-muted-foreground hover:text-foreground"><XIcon className="size-3.5" /></button>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Extracted Text</p>
                          <pre className="text-[11px] text-foreground/70 leading-relaxed font-sans whitespace-pre-wrap line-clamp-5">{attachState.extractedText}</pre>
                        </div>
                        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <SparklesIcon className="size-3.5 text-violet-600" />
                            <span className="text-[11px] font-semibold text-violet-700">AI Summary</span>
                          </div>
                          <p className="text-xs leading-relaxed text-foreground/80">{attachState.summary}</p>
                        </div>
                        <Button size="sm" className="w-full" onClick={lHandleUseAttachment}>Use as Reply</Button>
                      </>
                    )}
                  </div>
                )}

                {/* ── VOICE tab ── */}
                {replyTab === "voice" && (
                  <div className="space-y-2.5">
                    {voiceState === "idle" && (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto">
                          <MicIcon className="size-5 text-primary" />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Speak in</label>
                          <select
                            value={voiceLang} onChange={(e) => setVoiceLang(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary cursor-pointer"
                          >
                            {VOICE_LANGUAGES.map((l) => (
                              <option key={l.code} value={l.code}>{l.native}  —  {l.label}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug text-center">ArogyaAI will transcribe your speech live.</p>
                        <Button size="sm" variant="outline" className="w-full text-xs border-primary/30 text-primary" onClick={lStartVoiceRecording}>
                          Start Recording
                        </Button>
                      </div>
                    )}
                    {voiceState === "recording" && (
                      <div className="space-y-2.5">
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                            <div className="relative flex size-12 items-center justify-center rounded-full bg-red-500 shadow-md">
                              <MicIcon className="size-5 text-white" />
                            </div>
                          </div>
                          <span className="text-sm font-mono font-bold text-red-500 tabular-nums">{lFormatSeconds(recordingSeconds)}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-muted-foreground">Listening in</span>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.native ?? voiceLang}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-background px-3 py-2.5 min-h-[60px] flex items-start">
                          {liveTranscript
                            ? <p className="text-xs leading-relaxed text-foreground/70 italic">{liveTranscript}</p>
                            : <p className="text-[11px] text-muted-foreground/50 italic m-auto self-center w-full text-center">Start speaking…</p>
                          }
                        </div>
                        <Button size="sm" variant="destructive" className="w-full text-xs" onClick={lStopVoiceRecording}>Stop Recording</Button>
                      </div>
                    )}
                    {voiceState === "translating" && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center space-y-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mx-auto animate-spin" style={{ animationDuration: "1.8s" }}>
                          <SparklesIcon className="size-5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold text-primary">Translating to English…</p>
                        <p className="text-[11px] text-muted-foreground">
                          {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.native ?? voiceLang}{" → "}<span className="font-medium text-foreground/70">English</span>
                        </p>
                        {liveTranscript && (
                          <p className="text-[11px] text-muted-foreground/60 italic leading-snug line-clamp-3 pt-1 border-t border-border/50">{liveTranscript}</p>
                        )}
                      </div>
                    )}
                    {voiceState === "done" && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center">
                        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-2">
                          <span className="text-emerald-600 text-lg font-bold leading-none">✓</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">Transcribed successfully!</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Opening text editor…</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── REPLY PREVIEW ── */}
          {panel.view === "reply-preview" && activePost && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={handleBackToCompose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeftIcon className="size-4" />
                </button>
                <span className="text-sm font-semibold flex-1">Review Your Reply</span>
                <button onClick={closePanel} className="text-muted-foreground hover:text-foreground transition-colors">
                  <XIcon className="size-4" />
                </button>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  {lHasNative ? "Your reply · English (Translated)" : "Your reply"}
                </p>
                <button
                  onClick={() => setSelectedVersion(0)}
                  className={cn("w-full text-left rounded-lg border px-3 py-2.5 transition-colors", selectedVersion === 0 ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30")}
                >
                  <p className="text-xs leading-relaxed">{panel.original}</p>
                  {selectedVersion === 0 && <span className="text-[10px] text-primary font-medium mt-1 block">✓ Selected</span>}
                </button>
              </div>

              {/* Attached document */}
              {attachedDoc && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <PaperclipIcon className="size-3" /> Attached Document
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    {attachedDoc.isPdf ? (
                      <div className="flex items-center gap-3 bg-red-50 px-3 py-2.5">
                        <FileTextIcon className="size-7 text-red-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{attachedDoc.filename}</p>
                          <p className="text-[10px] text-muted-foreground">{attachedDoc.docType}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-muted/30 px-3 py-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={attachedDoc.previewUrl} alt="" className="size-12 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{attachedDoc.filename}</p>
                          <p className="text-[10px] text-muted-foreground">{attachedDoc.docType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Native language recording reference */}
              {lHasNative && voiceRecording && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MicIcon className="size-3" /> {lVoiceLangInfo?.native ?? voiceRecording.lang} · Recorded
                  </p>
                  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {lVoiceLangInfo?.label ?? voiceRecording.lang}
                      </span>
                      <span className="text-[10px] text-muted-foreground">→ Translated to English above</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{voiceRecording.original}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <SparklesIcon className="size-3 text-violet-500" /> AI Rephrasings
                </p>
                <div className="space-y-2">
                  {panel.rephrasings.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVersion((i + 1) as 1 | 2)}
                      className={cn("w-full text-left rounded-lg border px-3 py-2.5 transition-colors", selectedVersion === i + 1 ? "border-violet-400 bg-violet-50/50" : "border-border bg-background hover:border-violet-200")}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-violet-600">Version {i + 1}</span>
                        {selectedVersion === i + 1 && <span className="text-[10px] text-violet-600 font-medium">✓ Selected</span>}
                      </div>
                      <p className="text-xs leading-relaxed">{r}</p>
                    </button>
                  ))}
                </div>
              </div>

              {linkedAiResponse && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-amber-100">
                      <ZapIcon className="size-3 text-amber-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700">ArogyaAI's perspective</span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/80">{linkedAiResponse}</p>
                </div>
              )}

              <Button size="sm" className="w-full" onClick={handleSubmitReply}>
                Submit Reply
              </Button>
            </div>
          )}

        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        groupContext={`${member.name}'s group`}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function LiveboardPage() {
  const searchParams = useSearchParams();
  const group = searchParams.get("g") ?? "yours";

  const isLinked = group === "ravi" || group === "sharma" || group === "priya";

  const isSystem = !isLinked; // yours, arogyaai, community

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sticky ContentTabs — never scrolls away */}
      <div className="shrink-0 px-5 pt-5 lg:px-6 lg:pt-6">
        {isSystem && <ContentTabs active="home" showGroupSettings={false} />}
        {isLinked && <ContentTabs active="home" showGroupSettings={true} />}
      </div>

      {/* ArogyaTalk: full-height two-column layout */}
      {group === "community" && (
        <div className="flex-1 overflow-hidden min-h-0">
          <ArogyaTalkContent />
        </div>
      )}

      {/* ArogyaLearn: full-height two-column layout */}
      {group === "learn" && (
        <div className="flex-1 overflow-hidden min-h-0">
          <ArogyaLearnContent />
        </div>
      )}

      {/* Linked member groups: full-height two-column layout */}
      {isLinked && (
        <div className="flex-1 overflow-hidden min-h-0">
          <LinkedMemberContent id={group} />
        </div>
      )}

      {/* Yours / ArogyaAI: standard single-column scroll */}
      {!isLinked && group !== "community" && group !== "learn" && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pb-5 pt-4 lg:px-6 lg:pb-6 max-w-4xl space-y-4">
            {group === "yours"     && <YoursContent />}
            {group === "arogyaai"  && <ArogyaAIContent />}
          </div>
        </div>
      )}
    </div>
  );
}
