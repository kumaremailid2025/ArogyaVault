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
import Typography from "@/components/ui/typography";

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
      <Typography variant="micro" color="muted" as="span">/100</Typography>
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
          <Typography variant="overline" as="h4">{card.title}</Typography>
          <Typography variant="micro" color="muted">{card.description}</Typography>
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

  const overallScore = HEALTH_SCORE?.overall ?? 0;
  const breakdown = HEALTH_SCORE?.breakdown ?? [];

  /* ── Fresh-user empty state ──────────────────────────────────── */
  const isEmpty =
    VAULT_FILES.length === 0 &&
    AI_CONTEXT_CARDS.length === 0 &&
    AI_CAPABILITIES.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <SparklesIcon className="size-5 text-primary mx-auto mb-1.5" />
            <Typography variant="h5" as="p" className="mb-1">ArogyaAI is ready</Typography>
            <Typography variant="micro" color="muted">
              Ask me any health question — I&apos;ll use whatever you add to
              your vault to give you better answers over time.
            </Typography>
          </div>

          <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
              <SparklesIcon className="size-3 text-primary" />
              <Typography variant="overline" color="muted" as="span">
                Try these prompts
              </Typography>
            </div>
            <div className="space-y-1">
              {[
                "Explain what my health score means",
                "How often should I get a full check-up?",
                "What should I track daily?",
                "Give me 3 simple wellbeing habits",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onAsk(q)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-[11px] text-muted-foreground hover:text-foreground border border-border"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 px-1 mb-1.5">
              <FileTextIcon className="size-3 text-muted-foreground" />
              <Typography variant="overline" color="muted" as="span">
                Next step
              </Typography>
            </div>
            <div className="rounded-lg border border-dashed border-border p-3 text-center">
              <Typography variant="micro" color="muted">
                Add your first report in <span className="font-medium">My Vault</span>{" "}
                to unlock personalised insights.
              </Typography>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Health score header */}
      <div className="px-3 pt-3 pb-2 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HeartPulseIcon className="size-3.5 text-primary" />
            <Typography variant="h5" as="span">Health Score</Typography>
          </div>
          <MiniScore score={overallScore} />
        </div>
        {/* Score breakdown chips */}
        <div className="flex flex-wrap gap-1 mt-2">
          {breakdown.map((b) => (
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
            <Typography variant="overline" color="muted" as="span">Insights</Typography>
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
            <Typography variant="overline" color="muted" as="span">AI Can Help With</Typography>
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
                  <Typography variant="micro" weight="medium" as="span">{cap.label}</Typography>
                  <Typography variant="micro" color="muted">{cap.description}</Typography>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <FileTextIcon className="size-3 text-muted-foreground" />
            <Typography variant="overline" color="muted" as="span">Your Data</Typography>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <Typography variant="body" weight="bold" as="div">{VAULT_FILES.length}</Typography>
              <Typography variant="micro" color="muted" as="div">Documents</Typography>
            </div>
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <Typography variant="body" weight="bold" as="div">{MEDICATIONS.length}</Typography>
              <Typography variant="micro" color="muted" as="div">Medications</Typography>
            </div>
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <Typography variant="body" weight="bold" as="div">{warningAlerts.length}</Typography>
              <Typography variant="micro" color="muted" as="div">Alerts</Typography>
            </div>
            <div className="rounded-lg bg-muted/40 px-2.5 py-2 text-center">
              <Typography variant="body" weight="bold" as="div">6</Typography>
              <Typography variant="micro" color="muted" as="div">Panels tracked</Typography>
            </div>
          </div>
        </div>

        {/* Suggested questions */}
        <div className="pb-2">
          <div className="flex items-center gap-1.5 px-1 mb-1.5">
            <BotIcon className="size-3 text-primary" />
            <Typography variant="overline" color="muted" as="span">Try Asking</Typography>
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
