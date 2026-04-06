"use client";

import * as React from "react";
import { Badge } from "@/core/ui/badge";
import { BannerTabs } from "@/components/community/banner-tabs";
import type { BannerConfig } from "@/components/containers/community/types";

/* ═══════════════════════════════════════════════════════════════════
   COMMUNITY BANNER — config-driven header banner
   Used by CommunityWrapperContainer for both community & invited views.
═══════════════════════════════════════════════════════════════════ */

interface CommunityBannerProps {
  config: BannerConfig;
}

export const CommunityBanner = React.memo(({ config }: CommunityBannerProps) => {
  return (
    <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
      <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
        {/* Row 1 — Icon + Title + Badges + Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {config.icon}
          <span className="font-bold text-lg">{config.title}</span>
          {config.badges.map((b) => (
            <Badge
              key={b.label}
              className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1"
            >
              {b.icon && b.icon}
              {b.label}
            </Badge>
          ))}
          {/* Banner tabs — right-aligned */}
          <BannerTabs
            tabs={config.tabs}
            activeTab={config.activeTab}
            className="ml-auto"
          />
        </div>
        {/* Row 2 — Description / context */}
        <div className="mt-2">{config.description}</div>
      </div>
    </div>
  );
});

CommunityBanner.displayName = "CommunityBanner";
