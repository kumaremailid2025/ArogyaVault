"use client";

import * as React from "react";
import {
  ResponsiveContainer, LineChart, AreaChart, BarChart, ComposedChart,
  Line, Area, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ReferenceLine, ReferenceArea,
} from "recharts";
import { ExpandIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultHealth, type ChartConfig } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   CHARTS COLUMN — wide center panel
   Renders all health trend charts in a responsive grid.
   Click a chart → drilldown to expanded view.
═══════════════════════════════════════════════════════════════════ */

interface ChartsColumnProps {
  onChartClick: (chartId: string) => void;
  highlightCategory?: string;
}

/* ── Single chart card ─────────────────────────────────────────── */

const ChartCard = ({
  config,
  onClick,
  highlighted,
}: {
  config: ChartConfig;
  onClick: () => void;
  highlighted: boolean;
}) => {
  const sharedXAxis = (
    <XAxis
      dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
    />
  );
  const sharedYAxis = (
    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
  );
  const sharedGrid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />;
  const sharedTooltip = (
    <Tooltip
      contentStyle={{
        fontSize: 11,
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--background)",
      }}
    />
  );
  const sharedLegend = (
    <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={6} />
  );

  const renderRefLines = () => {
    return config.series
      .filter((s) => s.refLine !== undefined)
      .map((s) => (
        <ReferenceLine
          key={`ref-${s.key}`}
          y={s.refLine}
          stroke={s.color}
          strokeDasharray="4 4"
          strokeOpacity={0.6}
          label={{ value: s.refLabel || "", fontSize: 9, fill: s.color, position: "right" }}
        />
      ));
  };

  const renderIdealRange = () => {
    if (!config.idealRange) return null;
    return (
      <ReferenceArea
        y1={config.idealRange.min}
        y2={config.idealRange.max}
        fill="#10b981"
        fillOpacity={0.08}
        strokeOpacity={0}
      />
    );
  };

  const renderChart = () => {
    switch (config.type) {
      case "line":
        return (
          <LineChart data={config.data}>
            {sharedGrid}
            {sharedXAxis}
            {sharedYAxis}
            {sharedTooltip}
            {sharedLegend}
            {renderRefLines()}
            {renderIdealRange()}
            {config.series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={config.data}>
            {sharedGrid}
            {sharedXAxis}
            {sharedYAxis}
            {sharedTooltip}
            {sharedLegend}
            {renderRefLines()}
            {renderIdealRange()}
            {config.series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={config.data}>
            {sharedGrid}
            {sharedXAxis}
            {sharedYAxis}
            {sharedTooltip}
            {sharedLegend}
            {renderRefLines()}
            {config.series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                radius={[2, 2, 0, 0]}
                barSize={8}
              />
            ))}
          </BarChart>
        );

      case "composed":
        return (
          <ComposedChart data={config.data}>
            {sharedGrid}
            {sharedXAxis}
            {sharedYAxis}
            {sharedTooltip}
            {sharedLegend}
            {renderRefLines()}
            {config.series.map((s, i) =>
              i === 0 ? (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  radius={[2, 2, 0, 0]}
                  barSize={10}
                />
              ) : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              )
            )}
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-background p-3 transition-all text-left w-full cursor-pointer group",
        highlighted
          ? "ring-2 ring-primary/40 border-primary/30"
          : "border-border hover:border-primary/20 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs font-semibold">{config.title}</h3>
          <span className="text-[10px] text-muted-foreground">{config.category}</span>
        </div>
        <ExpandIcon className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </button>
  );
};

/* ── Main component ────────────────────────────────────────────── */

export const ChartsColumn = ({ onChartClick, highlightCategory }: ChartsColumnProps) => {
  const { CHART_CONFIGS } = useVaultHealth();
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-4">
      {CHART_CONFIGS.map((cfg) => (
        <ChartCard
          key={cfg.id}
          config={cfg}
          onClick={() => onChartClick(cfg.id)}
          highlighted={highlightCategory === cfg.category}
        />
      ))}
    </div>
  );
};
