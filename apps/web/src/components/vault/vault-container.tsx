"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2Icon, UploadCloudIcon, SparklesIcon, HeartPulseIcon } from "lucide-react";
import { VaultBanner, type VaultTab } from "@/components/vault/vault-banner";
import { FilesColumn } from "@/components/vault/files-column";
import { useVaultHealth } from "@/data/vault-health-data";
import { Button } from "@/core/ui/button";
import Typography from "@/components/ui/typography";

/* ── Lazy-loaded column/panel components ─────────────────────────── */

const ColumnLoader = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  </div>
);

/** ChartsColumn imports the entire recharts library (~100KB) — lazy is critical */
const ChartsColumn = dynamic(
  () => import("@/components/vault/charts-column").then((m) => ({ default: m.ChartsColumn })),
  { loading: ColumnLoader }
);

const VitalsColumn = dynamic(
  () => import("@/components/vault/vitals-column").then((m) => ({ default: m.VitalsColumn })),
  { loading: ColumnLoader }
);

const FilesFullView = dynamic(
  () => import("@/components/vault/files-full-view").then((m) => ({ default: m.FilesFullView })),
  { loading: ColumnLoader }
);

/** Detail panels — only rendered when a specific item is selected */
const DrilldownPanel = dynamic(
  () => import("@/components/vault/drilldown-panel").then((m) => ({ default: m.DrilldownPanel })),
  { loading: ColumnLoader }
);

const FileDetailPanel = dynamic(
  () => import("@/components/vault/file-detail-panel").then((m) => ({ default: m.FileDetailPanel })),
  { loading: ColumnLoader }
);

const FileQAHistoryPanel = dynamic(
  () => import("@/components/vault/file-qa-history-panel").then((m) => ({ default: m.FileQAHistoryPanel })),
  { loading: ColumnLoader }
);

/* ═══════════════════════════════════════════════════════════════════
   VAULT CONTAINER — orchestrates banner, three-column layout,
   drilldown state, and tab switching between Vault / Files views.
═══════════════════════════════════════════════════════════════════ */

export const VaultContainer = () => {
  const { VAULT_FILES, HEALTH_ALERTS, VITALS, CHART_CONFIGS } = useVaultHealth();
  const isEmpty = VAULT_FILES.length === 0 && VITALS.length === 0 && CHART_CONFIGS.length === 0;
  const [activeTab, setActiveTab] = React.useState<VaultTab>("vault");
  /** null = no drilldown (show FilesColumn), string = metricId or chartId */
  const [drilldownTarget, setDrilldownTarget] = React.useState<string | null>(null);
  /** Selected file id in Files tab (null = no detail panel) */
  const [selectedFileId, setSelectedFileId] = React.useState<number | null>(null);

  /* Find the category of the active metric for chart highlighting */
  const highlightCategory = React.useMemo(() => {
    if (!drilldownTarget) return undefined;
    const metric = VITALS.find((v) => v.id === drilldownTarget);
    if (metric) return metric.category;
    const chart = CHART_CONFIGS.find((c) => c.id === drilldownTarget);
    if (chart) return chart.category;
    return undefined;
  }, [drilldownTarget]);

  const handleMetricClick = React.useCallback((metricId: string) => {
    setDrilldownTarget((prev) => (prev === metricId ? null : metricId));
  }, []);

  const handleChartClick = React.useCallback((chartId: string) => {
    setDrilldownTarget((prev) => (prev === chartId ? null : chartId));
  }, []);

  const closeDrilldown = React.useCallback(() => {
    setDrilldownTarget(null);
  }, []);

  const handleFileClick = React.useCallback((fileId: number) => {
    setSelectedFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  const closeFileDetail = React.useCallback(() => {
    setSelectedFileId(null);
  }, []);

  const handleTabChange = React.useCallback((tab: VaultTab) => {
    setActiveTab(tab);
    // Reset panel state when switching tabs
    setDrilldownTarget(null);
    setSelectedFileId(null);
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Banner */}
      <VaultBanner
        activeTab={activeTab}
        onTabChange={handleTabChange}
        fileCount={VAULT_FILES.length}
        alertCount={HEALTH_ALERTS.filter((a) => a.severity !== "info").length}
      />

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isEmpty ? (
          /* ─── EMPTY VAULT — welcome state ─── */
          <div className="h-full flex items-center justify-center overflow-y-auto">
            <div className="max-w-md px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <HeartPulseIcon className="size-8 text-primary" />
              </div>
              <Typography variant="h1" as="h2">Your vault is ready</Typography>
              <Typography variant="body" color="muted" className="leading-relaxed mb-6">
                Your personal health vault is where all your medical reports,
                prescriptions, and vital readings will live. Add your first
                document to unlock AI-powered insights and trend tracking.
              </Typography>
              <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
                <Button size="sm" className="w-full gap-2">
                  <UploadCloudIcon className="size-3.5" /> Upload your first report
                </Button>
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <SparklesIcon className="size-3.5" /> Ask ArogyaAI how this works
                </Button>
              </div>
              <Typography variant="micro" color="muted" className="mt-6 opacity-80">
                PDFs, images, and common lab report formats are all supported.
              </Typography>
            </div>
          </div>
        ) : activeTab === "files" ? (
          /* ─── FILES TAB — list + right panel (always visible) ─── */
          <div className="h-full flex overflow-hidden">
            {/* Left — File list (flexible) */}
            <div className="flex-1 overflow-y-auto px-5 pb-5 pt-2 lg:px-6">
              <FilesFullView
                onFileClick={handleFileClick}
                selectedFileId={selectedFileId}
              />
            </div>
            {/* Right — Q&A history (default) or File detail (when selected) */}
            <div className="w-[320px] shrink-0 border-l border-border overflow-hidden">
              {selectedFileId !== null ? (
                <FileDetailPanel fileId={selectedFileId} onClose={closeFileDetail} />
              ) : (
                <FileQAHistoryPanel onFileClick={handleFileClick} />
              )}
            </div>
          </div>
        ) : (
          /* ─── VAULT TAB — three-column layout ─── */
          <div className="h-full flex overflow-hidden">
            {/* Left — Vitals (narrow, fixed width) */}
            <div className="w-[260px] shrink-0 border-r border-border overflow-hidden">
              <VitalsColumn
                onMetricClick={handleMetricClick}
                activeMetricId={drilldownTarget ?? undefined}
              />
            </div>

            {/* Center — Charts (flexible width, scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
              <ChartsColumn
                onChartClick={handleChartClick}
                highlightCategory={highlightCategory}
              />
            </div>

            {/* Right — Files or Drilldown (narrow, fixed width) */}
            <div className="w-[280px] shrink-0 border-l border-border overflow-hidden">
              {drilldownTarget ? (
                <DrilldownPanel
                  targetId={drilldownTarget}
                  onClose={closeDrilldown}
                />
              ) : (
                <FilesColumn />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
