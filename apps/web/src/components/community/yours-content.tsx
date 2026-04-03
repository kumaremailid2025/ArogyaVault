"use client";
import * as React from "react";
import Link from "next/link";
import {
  UploadCloudIcon, BrainCircuitIcon, ActivityIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";
import { getGreeting } from "@/lib/post-utils";
import { QUICK_STATS, ACTIVITY_FEED } from "@/data/dashboard-data";

export function YoursContent() {
  const greeting = getGreeting();

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <p className="text-xs text-primary-foreground/70 font-medium mb-0.5">{greeting} 👋</p>
        <h1 className="text-xl font-bold">Welcome to ArogyaVault, Kumar</h1>
        <p className="mt-1.5 text-primary-foreground/80 text-sm leading-relaxed">
          Your personal health vault is ready. Upload your first medical document to get started.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/records" className="flex items-center gap-1.5">
              <UploadCloudIcon className="size-3.5" /> Upload Document
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/ask-ai" className="flex items-center gap-1.5">
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
            <span className="text-sm font-semibold">AI Health Summary</span>
            <Badge variant="outline" className="text-xs">GPT-4o</Badge>
          </div>
          <Link href="/records" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            More →
          </Link>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border/50 p-3">
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            Upload your medical documents to generate your personalised AI Health Summary.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-3 bg-background">
            <s.icon className={cn("size-4 mb-1.5", s.color)} />
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs font-medium">{s.label}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-xl border border-dashed border-border p-7 text-center">
        <UploadCloudIcon className="size-9 text-muted-foreground/40 mx-auto mb-2" />
        <h3 className="font-semibold text-sm mb-1">No documents yet</h3>
        <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">
          Upload a prescription, lab report, or any medical document to get started.
        </p>
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
          <span className="text-sm font-semibold">Recent Activity</span>
        </div>
        <div className="space-y-2">
          {ACTIVITY_FEED.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-background">
              <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", a.color)}>
                <a.icon className="size-3" />
              </div>
              <span className="flex-1 text-sm">{a.text}</span>
              <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
