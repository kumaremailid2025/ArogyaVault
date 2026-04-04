"use client";

import * as React from "react";
import { VaultBanner, type VaultTab } from "@/components/vault/vault-banner";
import { VitalsColumn } from "@/components/vault/vitals-column";
import { ChartsColumn } from "@/components/vault/charts-column";
import { FilesColumn } from "@/components/vault/files-column";
import { DrilldownPanel } from "@/components/vault/drilldown-panel";
import { FilesFullView } from "@/components/vault/files-full-view";
import { FileDetailPanel } from "@/components/vault/file-detail-panel";
import { FileQAHistoryPanel } from "@/components/vault/file-qa-history-panel";
import { VAULT_FILES, HEALTH_ALERTS, VITALS, CHART_CONFIGS } from "@/data/vault-health-data";

/* ═══════════════════════════════════════════════════════════════════
   VAULT CONTAINER — orchestrates banner, three-column layout,
   drilldown state, and tab switching between Vault / Files views.
═══════════════════════════════════════════════════════════════════ */

export const VaultContainer = () => {
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
        {activeTab === "files" ? (
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
