"use client";

import * as React from "react";
import {
  SparklesIcon, AlertTriangleIcon, TrendingUpIcon,
  FileTextIcon, ShieldCheckIcon, BotIcon, ArrowRightIcon,
  HeartPulseIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAiContext,
  type AiContextCard, type AiCapability,
} from "@/data/ai-context-data";
import { useVaultHealth } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   AI CONTEXT PANEL — right column
   Shows health insights, capabilities, and quick actions.
   Content is always visible, providing context to the conversation.
═══════════════════════════════════════════════════════════════════ */

interface AiContextPanelProps {
  onAsk: (question: string) => void;
}

/* ── Mini score ────────────────────────────────────────────────── */

const MiniScore = ({ score }: { score: number }) => {
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("text-lg font-bold", color)}>{score}</span>
      <span className="text-[10px] text-muted-foreground">/100</span>
    </div>
  );
};

/* ── Context card ──────────────────────────────────────────────── */

const ContextCard = ({ card, onAsk }: { card: AiContextCard; onAsk: (q: string) => void }) => {
  const iconMap = {
    alert: <AlertTriangleIcon className={cn("size-3.5",
      card.severity === "critical" ? "text-red-500" :
      card.severity === "warning" ? "text-amber-500" : "text-blue-500"
    )} />,
    insight: <TrendingUpIcon className="size-3.5 text-emerald-500" />,
    "recent-file": <FileTextIcon className="size-3.5 text-primary" />,
    trend: <TrendingUpIcon className="size-3.5 text-blue-500" />,
  };

  return (
    <button
      onClick={() => onAsk(card.suggestedQuestion)}
      className={cn(
        "w-full text-left rounded-lg border p-2.5 transition-all cursor-pointer group",
        "hover:border-primary/30 hover:shadow-sm",
        card.severity === "warning" && "border-amber-200/60 dark:border-amber-800/30",
        card.severity === "normal" && "border-emerald-200/60 dark:border-emerald-800/30",
        !card.severity && "border-border",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{iconMap[card.type]}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-semibold leading-tight">{card.title}</h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{card.description}</p>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <SparklesIcon className="size-2.5" /> Ask <ArrowRightIcon className="size-2.5" />
          </div>
        </div>
      </div>
    </button>
  );
};

/* ── Main panel ────────────────────────────────────────────────── */

export const AiContextPanel = ({ onAsk }: AiContextPanelProps) => {
  const { HEALTH_SCORE, HEALTH_ALERTS, VAULT_FILES, MEDICATIONS } = useVaultHealth();
  const { AI_CAPABILITIES, AI_CONTEXT_CARDS, SMART_SUGGESTIONS } = useAiContext();
  const warningAlerts = HEALTH_ALERTS.filter((a) => a.severity !== "info");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Health score header */}
      <div className="px-3 pt-3 pb-2 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HeartPulseIcon className="size-3.5 text-primary" />
            <span className="text-xs font-semibold">Health Score</span>
          </div>
          <MiniScore score={HEALTH_SCORE.overall} />
        </div>
        {/* Score breakdown chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          {HEALTH_SCORE.breakdown.map((b) => (
            <span
              key={b.label}
              className="text-[9px] px-1.5 py-0.5 rounded-full border"
              style={{ borderColor: b.color, color: b.color }}
            >
              {b.label} {b.score}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {/* Health insights */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <ShieldCheckIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Insights</span>
            {warningAlerts.length > 0 && (
              <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full ml-auto">
                {warningAlerts.length} alerts
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {AI_CONTEXT_CARDS.slice(0, 4).map((card) => (
              <ContextCard key={card.id} card={card} onAsk={onAsk} />
            ))}
          </div>
        </div>

        {/* Quick capabilities */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <SparklesIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Can Help With</span>
          </div>
          <div className="space-y-1">
            {AI_CAPABILITIES.slice(0, 4).map((cap) => (
              <button
                key={cap.id}
                onClick={() => onAsk(cap.exampleQuestion)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-left"
              >
                <span className="text-sm shrink-0">{cap.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium">{cap.label}</span>
                  <p className="text-[10px] text-muted-foreground truncate">{cap.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <FileTextIcon className="size-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Data</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <div className="text-sm font-bold">{VAULT_FILES.length}</div>
              <div className="text-[10px] text-muted-foreground">Documents</div>
            </div>
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <div className="text-sm font-bold">{MEDICATIONS.length}</div>
              <div className="text-[10px] text-muted-foreground">Medications</div>
            </div>
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <div className="text-sm font-bold">{warningAlerts.length}</div>
              <div className="text-[10px] text-muted-foreground">Alerts</div>
            </div>
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <div className="text-sm font-bold">6</div>
              <div className="text-[10px] text-muted-foreground">Panels tracked</div>
            </div>
          </div>
        </div>

        {/* Suggested questions */}
        <div className="pb-2">
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <BotIcon className="size-3 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Try Asking</span>
          </div>
          <div className="space-y-1">
            {SMART_SUGGESTIONS.slice(0, 5).map((s) => (
              <button
                key={s.text}
                onClick={() => onAsk(s.text)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-[11px] text-muted-foreground hover:text-foreground flex items-center justify-between gap-1"
              >
                <span className="truncate">{s.text}</span>
                <span className="text-[9px] text-primary/60 shrink-0">{s.reason}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
