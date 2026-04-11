"use client";

/**
 * User dashboard content with welcome banner, health summary, and activity feed.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Displays user welcome banner, AI health summary, and activity feed from the dashboard.
 */

import * as React from "react";
import Link from "next/link";
import {
  UploadCloudIcon, BrainCircuitIcon, ActivityIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { getGreeting } from "@/lib/post-utils";
import { useDashboard } from "@/data/dashboard-data";
import { resolveIcon } from "@/lib/icon-resolver";
import Typography from "@/components/ui/typography";

/**
 * Render user welcome banner, AI health summary, and activity feed.
 *
 * @returns The rendered content.
 *
 * @category Components
 */
export const YoursContent = (): React.ReactElement => {
  const { QUICK_STATS, ACTIVITY_FEED } = useDashboard();
  const greeting = getGreeting();

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <Typography variant="micro" color="inverse" weight="medium" className="mb-0.5 opacity-70">{greeting} 👋</Typography>
        <Typography variant="h1" color="inverse">Welcome to ArogyaVault, Kumar</Typography>
        <Typography variant="body" color="inverse" className="mt-1.5 opacity-80">
          Your personal health vault is ready. Upload your first medical document to get started.
        </Typography>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/records" className="flex items-center gap-1.5">
              <UploadCloudIcon className="size-3.5" /> Upload Document
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/arogya-ai" className="flex items-center gap-1.5">
              <BrainCircuitIcon className="size-3.5" /> Ask AI
            </Link>
          </Button>
        </div>
      </div>

      {/* AI Health Summary */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BrainCircuitIcon className="size-4 text-primary" />
            <Typography variant="h4" as="span">AI Health Summary</Typography>
            <Badge variant="outline" className="text-xs">GPT-4o</Badge>
          </div>
          <Link href="/records" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            More →
          </Link>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
          <Typography variant="body" color="muted" className="italic leading-relaxed">
            Upload your medical documents to generate your personalised AI Health Summary.
          </Typography>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_STATS.map((s) => {
          const Icon = resolveIcon(s.icon);
          return (
          <div key={s.label} className="rounded-xl border border-border p-3 bg-background">
            <Icon className={cn("size-4 mb-1.5", s.color)} />
            <Typography variant="h1" as="div">{s.value}</Typography>
            <Typography variant="caption" weight="medium" as="div">{s.label}</Typography>
            <Typography variant="micro" color="muted" as="div">{s.sub}</Typography>
          </div>
        );
        })}
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border p-7 text-center">
        <UploadCloudIcon className="size-9 text-muted-foreground/40 mx-auto mb-2" />
        <Typography variant="h4" as="h3" className="mb-1">No documents yet</Typography>
        <Typography variant="caption" color="muted" className="mb-3 max-w-xs mx-auto">
          Upload a prescription, lab report, or any medical document to get started.
        </Typography>
        <Button asChild size="sm">
          <Link href="/records" className="flex items-center gap-1.5">
            <UploadCloudIcon className="size-3.5" /> Upload your first document
          </Link>
        </Button>
      </div>

      {/* Activity feed */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ActivityIcon className="size-4 text-muted-foreground" />
          <Typography variant="h4" as="span">Recent Activity</Typography>
        </div>
        <div className="space-y-2">
          {ACTIVITY_FEED.map((a, i) => {
            const Icon = resolveIcon(a.icon);
            return (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background">
              <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", a.color)}>
                <Icon className="size-3" />
              </div>
              <Typography variant="body-sm" as="span" className="flex-1">{a.text}</Typography>
              <Typography variant="caption" color="muted" as="span" className="shrink-0">{a.time}</Typography>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
};
