"use client";

/**
 * Community banner header with tabs, badges, and description.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Config-driven header banner displaying icon, title, badges, description, and tabs.
 * Used by CommunityShell for both community and invited group views. Component is
 * memoized for performance.
 */

import * as React from "react";
import { Badge } from "@/core/ui/badge";
import { BannerTabs } from "@/components/community/banner-tabs";
import type { BannerConfig } from "@/components/containers/community/types";

/**
 * Props for {@link CommunityBanner}.
 *
 * @category Types
 */
interface CommunityBannerProps {
  /** Banner configuration object. */
  config: BannerConfig;
}

/**
 * Render the community banner with title, tabs, badges, and description.
 *
 * @param props - Component props.
 * @returns The rendered banner.
 *
 * @category Components
 */
export const CommunityBanner = React.memo(({ config }: CommunityBannerProps): React.ReactElement => {
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