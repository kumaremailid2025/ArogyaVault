"use client";

import * as React from "react";
import { Badge } from "@/core/ui/badge";

/* ═══════════════════════════════════════════════════════════════════
   PAGE BANNER — reusable top banner for standalone pages
   Matches the CommunityBanner styling but without tabs.
═══════════════════════════════════════════════════════════════════ */

export interface PageBannerBadge {
  label: string;
  icon?: React.ReactNode;
}

interface PageBannerProps {
  icon: React.ReactNode;
  title: string;
  badges?: PageBannerBadge[];
  description?: React.ReactNode;
}

export const PageBanner = React.memo(({ icon, title, badges, description }: PageBannerProps) => {
  return (
    <div className="shrink-0 px-5 pt-4 pb-3 lg:px-6">
      <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
        {/* Row 1 — Icon + Title + Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {icon}
          <span className="font-bold text-lg">{title}</span>
          {badges?.map((b) => (
            <Badge
              key={b.label}
              className="bg-white/20 text-primary-foreground border-0 text-[10px] flex items-center gap-1"
            >
              {b.icon && b.icon}
              {b.label}
            </Badge>
          ))}
        </div>
        {/* Row 2 — Description */}
        {description && <div className="mt-2">{description}</div>}
      </div>
    </div>
  );
});

PageBanner.displayName = "PageBanner";
