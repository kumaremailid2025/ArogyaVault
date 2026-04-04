"use client";

import * as React from "react";
import { ShieldCheckIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════
   VAULT BANNER — mimics CommunityBanner with Vault/Files pill tabs
═══════════════════════════════════════════════════════════════════ */

export type VaultTab = "vault" | "files";

interface VaultBannerProps {
  activeTab: VaultTab;
  onTabChange: (tab: VaultTab) => void;
  fileCount: number;
  alertCount: number;
}

const TABS: { key: VaultTab; label: string }[] = [
  { key: "vault", label: "Vault" },
  { key: "files", label: "Files" },
];

export const VaultBanner = React.memo(
  ({ activeTab, onTabChange, fileCount, alertCount }: VaultBannerProps) => {
    return (
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          {/* Row 1 — Icon + Title + Badges + Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheckIcon className="size-5" />
            <span className="font-bold text-lg">ArogyaVault</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              {fileCount} documents
            </Badge>
            {alertCount > 0 && (
              <Badge className="bg-amber-400/30 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
                {alertCount} alerts
              </Badge>
            )}
            {/* Pill tabs — right-aligned */}
            <div className="ml-auto flex items-center gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onTabChange(t.key)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
                    activeTab === t.key
                      ? "bg-white/25 text-primary-foreground"
                      : "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Row 2 — Contextual description */}
          <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">
            {activeTab === "vault"
              ? "Your complete health picture — vitals, trends, and AI insights from all uploaded documents."
              : "All medical documents uploaded to your ArogyaVault."}
          </p>
        </div>
      </div>
    );
  }
);

VaultBanner.displayName = "VaultBanner";
