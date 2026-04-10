"use client";

import * as React from "react";
import {
  SparklesIcon, AlertTriangleIcon, TrendingUpIcon,
  FileTextIcon, ChevronRightIcon, ArrowRightIcon,
  BrainCircuitIcon, ShieldCheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAiContext,
  type AiCapability, type AiContextCard,
} from "@/data/ai-context-data";
import { useVaultHealth } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   ASK-AI LANDING — rich, data-aware landing shown before first message.
   Collapses into full-width chat once the user sends a question.
═══════════════════════════════════════════════════════════════════ */

interface AskAiLandingProps {
  onAsk: (question: string) => void;
}

/* ── Health score mini ring ─────────────────────────────────────── */

const MiniScoreRing = ({ score }: { score: number }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative size-12">
      <svg className="size-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
};

/* ── Context card ──────────────────────────────────────────────── */

const ContextCard = ({ card, onAsk }: { card: AiContextCard; onAsk: (q: string) => void }) => {
  const iconMap = {
    alert: <AlertTriangleIcon className={cn("size-4",
      card.severity === "critical" ? "text-red-500" :
      card.severity === "warning" ? "text-amber-500" : "text-blue-500"
    )} />,
    insight: <TrendingUpIcon className="size-4 text-emerald-500" />,
    "recent-file": <FileTextIcon className="size-4 text-primary" />,
    trend: <TrendingUpIcon className="size-4 text-blue-500" />,
  };

  return (
    <button
      onClick={() => onAsk(card.suggestedQuestion)}
      className={cn(
        "text-left rounded-xl border p-3 transition-all cursor-pointer group",
        "hover:border-primary/30 hover:shadow-sm",
        card.severity === "warning" && "border-amber-200 dark:border-amber-800/40",
        card.severity === "critical" && "border-red-200 dark:border-red-800/40",
        card.severity === "normal" && "border-emerald-200 dark:border-emerald-800/40",
        !card.severity && "border-border",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{iconMap[card.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold truncate">{card.title}</h3>
            {card.meta && <span className="text-[10px] text-muted-foreground shrink-0">{card.meta}</span>}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{card.description}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <SparklesIcon className="size-2.5" />
            Ask about this
            <ArrowRightIcon className="size-2.5" />
          </div>
        </div>
      </div>
    </button>
  );
};

/* ── Capability card ───────────────────────────────────────────── */

const CapabilityCard = ({ cap, onAsk }: { cap: AiCapability; onAsk: (q: string) => void }) => {
  return (
    <button
      onClick={() => onAsk(cap.exampleQuestion)}
      className={cn(
        "text-left rounded-xl border p-3 transition-all cursor-pointer group",
        cap.color, "hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-lg shrink-0">{cap.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold">{cap.label}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{cap.description}</p>
        </div>
        <ChevronRightIcon className="size-3.5 text-muted-foreground mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

/* ── Main landing ──────────────────────────────────────────────── */

export const AskAiLanding = ({ onAsk }: AskAiLandingProps) => {
  const { AI_CAPABILITIES, AI_CONTEXT_CARDS, SMART_SUGGESTIONS } = useAiContext();
  const { HEALTH_SCORE, VAULT_FILES, HEALTH_ALERTS } = useVaultHealth();
  const warningAlerts = HEALTH_ALERTS.filter((a) => a.severity !== "info");

  return (
    <div className="max-w-3xl mx-auto px-1 space-y-6">
      {/* Greeting + health score row */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <BrainCircuitIcon className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold">What would you like to know, Kumar?</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ArogyaAI has analyzed <span className="font-medium text-foreground">{VAULT_FILES.length} documents</span> in your vault
              {warningAlerts.length > 0 && (
                <> and found <span className="font-medium text-amber-600">{warningAlerts.length} items needing attention</span></>
              )}
            </p>
          </div>
        </div>
        <MiniScoreRing score={HEALTH_SCORE.overall} />
      </div>

      {/* Health context cards — what AI sees in your data */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <ShieldCheckIcon className="size-3.5 text-primary" />
          <span className="text-xs font-semibold">Your Health Insights</span>
          <span className="text-[10px] text-muted-foreground ml-auto">Tap any card to ask</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AI_CONTEXT_CARDS.map((card) => (
            <ContextCard key={card.id} card={card} onAsk={onAsk} />
          ))}
        </div>
      </div>

      {/* AI Capabilities — what ArogyaAI can do */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-xs font-semibold">What ArogyaAI Can Do</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {AI_CAPABILITIES.map((cap) => (
            <CapabilityCard key={cap.id} cap={cap} onAsk={onAsk} />
          ))}
        </div>
      </div>

      {/* Smart suggestions — contextual quick-tap chips */}
      <div className="pb-2">
        <div className="flex items-center gap-1.5 mb-2.5">
          <SparklesIcon className="size-3.5 text-amber-500" />
          <span className="text-xs font-semibold">Suggested for You</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SMART_SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              onClick={() => onAsk(s.text)}
              className="group flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer"
            >
              <span>{s.text}</span>
              <span className="hidden group-hover:inline text-[10px] text-primary font-medium">· {s.reason}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
