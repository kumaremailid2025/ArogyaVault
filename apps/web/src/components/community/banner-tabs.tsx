"use client";

/**
 * Tab navigation for the community banner.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Tab navigation row for the community banner. Component is memoized for performance.
 */

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CommunityTab } from "@/components/containers/community/types";

/**
 * Tab descriptor.
 *
 * @category Types
 */
interface TabDef {
  readonly key: CommunityTab;
  readonly label: string;
  readonly href: string;
}

/**
 * Props for {@link BannerTabs}.
 *
 * @category Types
 */
interface BannerTabsProps {
  /** Tab definitions. */
  tabs: readonly TabDef[];
  /** Currently active tab key. */
  activeTab: CommunityTab;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Render a tab navigation row for the community banner.
 *
 * @param props - Component props.
 * @returns The rendered tab navigation.
 *
 * @category Components
 */
export const BannerTabs = React.memo(
  ({ tabs, activeTab, className }: BannerTabsProps): React.ReactElement => {
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
