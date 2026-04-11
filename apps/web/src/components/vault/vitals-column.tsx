"use client";

import * as React from "react";
import {
  AlertTriangleIcon, PillIcon,
  ChevronRightIcon, TrendingDownIcon, TrendingUpIcon, MinusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useVaultHealth,
  type VitalMetric,
  type HealthScore,
} from "@/data/vault-health-data";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   VITALS COLUMN — narrow left panel
   Health score ring, vitals by category, medications, alerts
═══════════════════════════════════════════════════════════════════ */

interface VitalsColumnProps {
  onMetricClick: (metricId: string) => void;
  activeMetricId?: string;
}

/* ── Health Score Ring ─────────────────────────────────────────── */

const HealthScoreRing = ({
  score,
  breakdown,
}: {
  score: number;
  breakdown: HealthScore["breakdown"];
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <div className="relative size-24">
        <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{score}</span>
          <Typography variant="micro" color="muted" as="span">/ 100</Typography>
        </div>
      </div>
      <Typography variant="caption" weight="semibold" color="muted" as="span">Health Score</Typography>
      {/* Mini breakdown */}
      <div className="flex flex-wrap justify-center gap-1 max-w-[200px]">
        {breakdown.map((b) => (
          <span
            key={b.label}
            className="text-[10px] px-1.5 py-0.5 rounded-full border"
            style={{ borderColor: b.color, color: b.color }}
          >
            {b.label} {b.score}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Trend icon ────────────────────────────────────────────────── */

const TrendIcon = ({ trend }: { trend?: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUpIcon className="size-3 text-red-500" />;
  if (trend === "down") return <TrendingDownIcon className="size-3 text-green-500" />;
  return <MinusIcon className="size-3 text-muted-foreground" />;
};

/* ── Vital row ─────────────────────────────────────────────────── */

const VitalRow = ({
  metric, active, onClick,
}: {
  metric: VitalMetric;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer",
        active
          ? "bg-primary/10 ring-1 ring-primary/30"
          : "hover:bg-muted/60"
      )}
    >
      <span className="text-sm shrink-0">{metric.icon}</span>
      <div className="flex-1 min-w-0">
        <Typography variant="caption" weight="medium" truncate={true} as="div">{metric.label}</Typography>
        <Typography variant="micro" color="muted" as="div">{metric.range}</Typography>
      </div>
      <div className="text-right shrink-0 flex items-center gap-1">
        <span
          className={cn(
            "text-sm font-semibold",
            metric.status === "critical" && "text-red-600",
            metric.status === "warning" && "text-amber-600",
            metric.status === "normal" && "text-foreground",
          )}
        >
          {metric.value}
        </span>
        <Typography variant="micro" color="muted" as="span">{metric.unit}</Typography>
        <TrendIcon trend={metric.trend} />
      </div>
      <ChevronRightIcon className="size-3.5 text-muted-foreground shrink-0" />
    </button>
  );
};

/* ── Main component ────────────────────────────────────────────── */

export const VitalsColumn = ({ onMetricClick, activeMetricId }: VitalsColumnProps) => {
  const { HEALTH_SCORE, VITALS, MEDICATIONS, HEALTH_ALERTS, VITAL_CATEGORIES } = useVaultHealth();
  const [category, setCategory] = React.useState("all");

  const filtered = category === "all"
    ? VITALS
    : VITALS.filter((v) => v.category === category);

  // Group by category for display
  const grouped = React.useMemo(() => {
    const map = new Map<string, VitalMetric[]>();
    for (const v of filtered) {
      const arr = map.get(v.category) || [];
      arr.push(v);
      map.set(v.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Health score */}
      <HealthScoreRing score={HEALTH_SCORE.overall} breakdown={HEALTH_SCORE.breakdown} />

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1 px-2 pb-2">
        {VITAL_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer",
              category === c.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Vitals list */}
      <div className="flex-1 overflow-y-auto px-1 space-y-3">
        {[...grouped.entries()].map(([cat, metrics]) => (
          <div key={cat}>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {cat}
            </div>
            <div className="space-y-0.5">
              {metrics.map((m) => (
                <VitalRow
                  key={m.id}
                  metric={m}
                  active={activeMetricId === m.id}
                  onClick={() => onMetricClick(m.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Medications */}
        <div>
          <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <PillIcon className="size-3" /> Medications
          </div>
          <div className="space-y-1 px-2">
            {MEDICATIONS.map((med) => (
              <div key={med.name} className="flex items-start gap-2 py-1.5">
                <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <Typography variant="caption" weight="medium" as="div">{med.name} {med.dose}</Typography>
                  <Typography variant="micro" color="muted" as="div">{med.frequency} · Since {med.since}</Typography>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="pb-3">
          <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <AlertTriangleIcon className="size-3" /> Alerts
          </div>
          <div className="space-y-1 px-2">
            {HEALTH_ALERTS.map((alert) => (
              <button
                key={alert.id}
                onClick={() => alert.metric && onMetricClick(alert.metric)}
                className={cn(
                  "w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer",
                  alert.severity === "critical" && "bg-red-50 dark:bg-red-950/30",
                  alert.severity === "warning" && "bg-amber-50 dark:bg-amber-950/30",
                  alert.severity === "info" && "bg-blue-50 dark:bg-blue-950/30",
                )}
              >
                <AlertTriangleIcon className={cn(
                  "size-3 mt-0.5 shrink-0",
                  alert.severity === "critical" && "text-red-500",
                  alert.severity === "warning" && "text-amber-500",
                  alert.severity === "info" && "text-blue-500",
                )} />
                <Typography variant="micro" as="span" className="leading-tight">{alert.message}</Typography>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
