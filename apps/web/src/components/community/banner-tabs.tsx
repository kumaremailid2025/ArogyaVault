"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CommunityTab } from "@/components/containers/community/types";

interface TabDef {
  readonly key: CommunityTab;
  readonly label: string;
  readonly href: string;
}

interface BannerTabsProps {
  tabs: readonly TabDef[];
  activeTab: CommunityTab;
  className?: string;
}

export const BannerTabs = React.memo(
  ({ tabs, activeTab, className }: BannerTabsProps) => {
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              activeTab === t.key
                ? "bg-white/25 text-primary-foreground"
                : "text-primary-foreground/70 hover:bg-white/15 hover:text-primary-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    );
  }
);

BannerTabs.displayName = "BannerTabs";
