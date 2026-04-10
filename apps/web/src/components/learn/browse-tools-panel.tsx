"use client";

import * as React from "react";
import {
  PillIcon, FlaskConicalIcon, SparklesIcon,
  BookOpenIcon, ArrowRightIcon, BotIcon,
  AlertTriangleIcon, CheckCircle2Icon, InfoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearn } from "@/data/learn-data";
import { resolveIcon } from "@/lib/icon-resolver";
import { lookupInteraction } from "@/lib/drug-utils";
import { useLearnContext } from "@/data/learn-context-data";

/* ═══════════════════════════════════════════════════════════════════
   BROWSE TOOLS PANEL — right column
   Quick drug checker, lab reference, AI companion, related topics.
═══════════════════════════════════════════════════════════════════ */

interface BrowseToolsPanelProps {
  onSelectTopic: (topicId: string) => void;
  activeTopicId: string | null;
}

/* ── Mini Drug Checker ── */
interface MiniDrugCheckerProps {
  interactions: Record<string, any>;
}

const MiniDrugChecker = ({ interactions }: MiniDrugCheckerProps) => {
  const [drugA, setDrugA] = React.useState("");
  const [drugB, setDrugB] = React.useState("");
  const [result, setResult] = React.useState<ReturnType<typeof lookupInteraction>>(null);
  const [checked, setChecked] = React.useState(false);

  const handleCheck = () => {
    if (!drugA.trim() || !drugB.trim()) return;
    const r = lookupInteraction(drugA, drugB, interactions);
    setResult(r);
    setChecked(true);
  };

  const severityConfig = {
    none: { icon: CheckCircle2Icon, color: "text-emerald-500", bg: "bg-emerald-50", label: "No Interaction" },
    minor: { icon: InfoIcon, color: "text-blue-500", bg: "bg-blue-50", label: "Minor" },
    moderate: { icon: AlertTriangleIcon, color: "text-amber-500", bg: "bg-amber-50", label: "Moderate" },
    major: { icon: AlertTriangleIcon, color: "text-red-500", bg: "bg-red-50", label: "Major" },
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <PillIcon className="size-3 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Drug Check</span>
      </div>
      <div className="space-y-1.5">
        <input
          type="text"
          placeholder="Drug A (e.g. Metformin)"
          value={drugA}
          onChange={(e) => { setDrugA(e.target.value); setChecked(false); }}
          className="w-full h-7 px-2.5 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <input
          type="text"
          placeholder="Drug B (e.g. Amlodipine)"
          value={drugB}
          onChange={(e) => { setDrugB(e.target.value); setChecked(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleCheck(); }}
          className="w-full h-7 px-2.5 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <button
          onClick={handleCheck}
          disabled={!drugA.trim() || !drugB.trim()}
          className="w-full h-7 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 cursor-pointer hover:bg-primary/90 transition-colors"
        >
          Check Interaction
        </button>
      </div>
      {checked && (
        <div className="mt-2">
          {result ? (
            <div className={cn("rounded-lg p-2.5 text-xs", severityConfig[result.severity].bg)}>
              <div className="flex items-center gap-1.5 mb-1">
                {React.createElement(severityConfig[result.severity].icon, { className: cn("size-3.5", severityConfig[result.severity].color) })}
                <span className={cn("font-semibold", severityConfig[result.severity].color)}>
                  {severityConfig[result.severity].label}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">{result.effect}</p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">{result.advice}</p>
            </div>
          ) : (
            <div className="rounded-lg p-2.5 bg-muted/40 text-xs text-muted-foreground">
              No known interaction found in our database. This does not rule out a possible interaction — consult your doctor.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Lab Quick Reference ── */
const LabQuickRef = ({ labRefs }: { labRefs: Array<{ test: string; normal: string; prediabetes: string; diabetes: string; unit: string }> }) => {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-2">
        <FlaskConicalIcon className="size-3 text-blue-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Reference</span>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-muted/60">
              <th className="text-left px-2 py-1 font-semibold">Test</th>
              <th className="text-left px-2 py-1 font-semibold text-emerald-600">Normal</th>
              <th className="text-left px-2 py-1 font-semibold text-amber-600">Borderline</th>
            </tr>
          </thead>
          <tbody>
            {labRefs.slice(0, 6).map((lab) => (
              <tr key={lab.test} className="border-t border-border/50">
                <td className="px-2 py-1 font-medium">{lab.test}</td>
                <td className="px-2 py-1 text-emerald-600">{lab.normal}</td>
                <td className="px-2 py-1 text-amber-600">{lab.prediabetes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ── Main Panel ── */
export const BrowseToolsPanel = ({ onSelectTopic, activeTopicId }: BrowseToolsPanelProps) => {
  const { LAB_QUICK_REF, EDU_TOPICS, DRUG_INTERACTIONS } = useLearn();
  const { RECOMMENDED_TOPICS } = useLearnContext();
  /* Related topics based on active topic or recommendations */
  const relatedTopics = React.useMemo(() => {
    if (activeTopicId) {
      const current = EDU_TOPICS.find((t) => t.id === activeTopicId);
      if (current) {
        return EDU_TOPICS.filter(
          (t) => t.id !== activeTopicId && t.category === current.category
        ).slice(0, 3);
      }
    }
    return RECOMMENDED_TOPICS.slice(0, 3).map((rec) =>
      EDU_TOPICS.find((t) => t.id === rec.topicId)
    ).filter(Boolean);
  }, [activeTopicId]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Mini Drug Checker */}
        <MiniDrugChecker interactions={DRUG_INTERACTIONS} />

        {/* Lab Quick Reference */}
        <LabQuickRef labRefs={LAB_QUICK_REF} />

        {/* Related Topics */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <BookOpenIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {activeTopicId ? "Related Topics" : "Suggested"}
            </span>
          </div>
          <div className="space-y-1">
            {relatedTopics.map((topic) => {
              if (!topic) return null;
              const Icon = resolveIcon(topic.categoryIcon);
              return (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-left"
                >
                  <Icon className={cn("size-3.5 shrink-0", topic.categoryColor)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-medium line-clamp-1">{topic.title}</span>
                    <span className="text-[10px] text-muted-foreground">{topic.readTime}</span>
                  </div>
                  <ArrowRightIcon className="size-3 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Companion mini */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <BotIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Companion</span>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Have questions about what you&apos;re reading? Ask ArogyaAI for explanations, comparisons, or clinical insights.
            </p>
            <button
              onClick={() => onSelectTopic("__ask_ai__")}
              className="mt-2 w-full flex items-center justify-center gap-1.5 h-7 rounded-lg border border-primary/30 text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <SparklesIcon className="size-3" />
              Ask ArogyaAI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
