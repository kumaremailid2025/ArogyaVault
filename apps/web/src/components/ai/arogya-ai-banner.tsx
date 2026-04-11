"use client";

import * as React from "react";
import { BotIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { useVaultHealth } from "@/data/vault-health-data";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   AROGYA-AI BANNER — consistent with Vault & Community banners
═══════════════════════════════════════════════════════════════════ */

export type AiTab = "chat" | "history";

interface ArogyaAiBannerProps {
  activeTab: AiTab;
  onTabChange: (tab: AiTab) => void;
  sessionCount: number;
}

const TABS: { key: AiTab; label: string }[] = [
  { key: "chat", label: "Chat" },
  { key: "history", label: "History" },
];

export const ArogyaAiBanner = React.memo(
  ({ activeTab, onTabChange, sessionCount }: ArogyaAiBannerProps) => {
    const { VAULT_FILES } = useVaultHealth();
    return (
      <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          {/* Row 1 — Icon + Title + Badges + Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <BotIcon className="size-5" />
            <span className="font-bold text-lg">ArogyaAI</span>
            <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
              {VAULT_FILES.length} documents analyzed
            </Badge>
            {sessionCount > 0 && (
              <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1">
                {sessionCount} conversations
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
          {/* Row 2 — Description */}
          <Typography variant="body" color="inverse" className="mt-2 opacity-80">
            {activeTab === "chat"
              ? "Your personal health AI — ask anything about your medical records, lab results, and medications."
              : "Browse your past conversations and pick up where you left off."}
          </Typography>
        </div>
      </div>
    );
  }
);

ArogyaAiBanner.displayName = "ArogyaAiBanner";
