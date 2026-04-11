"use client";

import * as React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, LineChart, Line,
} from "recharts";
import {
  XIcon, AlertCircleIcon, LightbulbIcon, LinkIcon,
  TrendingDownIcon, TrendingUpIcon, MinusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultHealth, type DrilldownData, type ChartConfig } from "@/data/vault-health-data";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   DRILLDOWN PANEL — expanded detail view
   Replaces the right (Files) column when a metric or chart is clicked.
═══════════════════════════════════════════════════════════════════ */

interface DrilldownPanelProps {
  /** Metric id (e.g. "hba1c") or chart id (e.g. "hba1c-trend") */
  targetId: string;
  onClose: () => void;
}

const StatusDot = ({ status }: { status: "normal" | "warning" | "critical" }) => {
  return (
    <span
      className={cn(
        "size-2 rounded-full inline-block",
        status === "normal" && "bg-green-500",
        status === "warning" && "bg-amber-500",
        status === "critical" && "bg-red-500",
      )}
    />
  );
};

/* ── Metric Drilldown ──────────────────────────────────────────── */

const MetricDrilldown = ({ data, onClose }: { data: DrilldownData; onClose: () => void }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <Typography variant="h4" as="h2" className="truncate">{data.title}</Typography>
          <Typography variant="micro" color="muted">{data.subtitle}</Typography>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-md cursor-pointer shrink-0">
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Current value card */}
        <div className={cn(
          "rounded-xl p-4 text-center",
          data.status === "normal" && "bg-green-50 dark:bg-green-950/20",
          data.status === "warning" && "bg-amber-50 dark:bg-amber-950/20",
          data.status === "critical" && "bg-red-50 dark:bg-red-950/20",
        )}>
          <Typography variant="hero" as="div">
            {data.currentValue}
            <Typography variant="body" color="muted" as="span" className="font-normal ml-1">{data.unit}</Typography>
          </Typography>
          <div className={cn(
            "text-xs font-medium mt-1",
            data.status === "normal" && "text-green-600",
            data.status === "warning" && "text-amber-600",
            data.status === "critical" && "text-red-600",
          )}>
            {data.status === "normal" ? "Within normal range" : data.status === "warning" ? "Needs attention" : "Critical"}
          </div>
          <Typography variant="micro" color="muted" as="div" className="mt-1">{data.range}</Typography>
        </div>

        {/* Trend chart */}
        <div>
          <Typography variant="h5" as="h3">12-Month Trend</Typography>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {data.history[0]?.value2 !== undefined ? (
                <LineChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="value2" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              ) : (
                <AreaChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <Typography variant="h5" as="h3">
            <LightbulbIcon className="size-3.5 text-amber-500" /> Insights
          </Typography>
          <div className="space-y-1.5">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] leading-snug">
                <div className="size-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related metrics */}
        <div className="pb-3">
          <Typography variant="h5" as="h3">
            <LinkIcon className="size-3.5 text-muted-foreground" /> Related Metrics
          </Typography>
          <div className="space-y-1.5">
            {data.relatedMetrics.map((rm) => (
              <div key={rm.label} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <StatusDot status={rm.status} />
                  <Typography variant="caption" as="span">{rm.label}</Typography>
                </div>
                <span className={cn(
                  "text-xs font-semibold",
                  rm.status === "normal" && "text-foreground",
                  rm.status === "warning" && "text-amber-600",
                  rm.status === "critical" && "text-red-600",
                )}>
                  {rm.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Chart Drilldown (when clicking a chart directly) ──────────── */

const ChartDrilldown = ({ config, onClose }: { config: ChartConfig; onClose: () => void }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-start justify-between p-3 border-b border-border">
        <div>
          <Typography variant="h4" as="h2">{config.title}</Typography>
          <Typography variant="micro" color="muted">{config.category} · {config.unit || "Multi-unit"}</Typography>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-md cursor-pointer shrink-0">
          <XIcon className="size-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Larger chart */}
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)", background: "var(--background)" }} />
              {config.series.map((s) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />
              ))}
              {config.series.filter((s) => s.refLine).map((s) => (
                <ReferenceLine key={`ref-${s.key}`} y={s.refLine} stroke={s.color} strokeDasharray="4 4" strokeOpacity={0.6} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Series summary */}
        <div className="space-y-2">
          <Typography variant="h5" as="h3">Latest Values</Typography>
          {config.series.map((s) => {
            const latest = config.data[config.data.length - 1];
            const val = latest[s.key as keyof typeof latest];
            const prev = config.data[config.data.length - 2]?.[s.key as keyof typeof latest];
            const diff = typeof val === "number" && typeof prev === "number" ? val - prev : 0;
            return (
              <div key={s.key} className="flex items-center justify-between px-2 py-2 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <Typography variant="caption" as="span">{s.label}</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <Typography variant="h5" as="span">{val}</Typography>
                  {diff !== 0 && (
                    <span className={cn("text-[10px]", diff > 0 ? "text-red-500" : "text-green-500")}>
                      {diff > 0 ? "+" : ""}{typeof diff === "number" ? diff.toFixed(1) : diff}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {config.series.some((s) => s.refLine) && (
            <Typography variant="micro" color="muted" as="div" className="mt-1">
              Dashed lines indicate target / reference values.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main export ───────────────────────────────────────────────── */

export const DrilldownPanel = ({ targetId, onClose }: DrilldownPanelProps) => {
  const { DRILLDOWN_MAP, CHART_CONFIGS } = useVaultHealth();
  // Try metric drilldown first
  const metricData = DRILLDOWN_MAP[targetId];
  if (metricData) {
    return <MetricDrilldown data={metricData} onClose={onClose} />;
  }

  // Try chart drilldown
  const chartConfig = CHART_CONFIGS.find((c) => c.id === targetId);
  if (chartConfig) {
    return <ChartDrilldown config={chartConfig} onClose={onClose} />;
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <AlertCircleIcon className="size-8 text-muted-foreground mb-2" />
      <Typography variant="body" color="muted">Detailed data not available for this metric.</Typography>
      <button onClick={onClose} className="mt-3 text-xs text-primary hover:underline cursor-pointer">
        Close panel
      </button>
    </div>
  );
};
