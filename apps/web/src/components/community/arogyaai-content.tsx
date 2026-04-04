"use client";
import * as React from "react";
import { BrainCircuitIcon, SparklesIcon, FileTextIcon } from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { AI_MESSAGES, AI_FEATURES, AI_SUGGESTIONS } from "@/data/dashboard-data";

export const ArogyaAIContent = () => {
  const [, setQuery] = React.useState("");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <BrainCircuitIcon className="size-4" />
          </div>
          <span className="font-bold text-lg">ArogyaAI</span>
          <Badge className="bg-white/20 text-primary-foreground border-0 text-[10px]">GPT-4o · RAG</Badge>
        </div>
        <p className="text-sm text-primary-foreground/80 leading-relaxed mt-1">
          Your personal AI health assistant. Answers are drawn exclusively from your uploaded documents.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3">
        {AI_FEATURES.map((f) => (
          <Button
            key={f.label}
            variant="ghost"
            className="rounded-xl border border-primary/20 bg-primary/5 p-3 h-auto text-left flex-col items-start hover:border-primary/40 hover:bg-primary/10"
          >
            <f.icon className="size-4 text-primary mb-1.5" />
            <p className="text-sm font-semibold">{f.label}</p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{f.desc}</p>
          </Button>
        ))}
      </div>

      {/* Sample conversation */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample conversation</p>
        {AI_MESSAGES.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "ai" && (
              <div className="size-6 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                <BrainCircuitIcon className="size-3" />
              </div>
            )}
            <div className={cn(
              "rounded-xl px-3 py-2 text-sm max-w-[85%]",
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted border border-border rounded-tl-sm"
            )}>
              <p className="leading-relaxed">{m.text}</p>
              {m.citation && (
                <span className="inline-flex items-center gap-1 mt-1.5 rounded bg-background border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  <FileTextIcon className="size-2.5" />{m.citation}
                </span>
              )}
            </div>
            {m.role === "user" && (
              <div className="size-6 shrink-0 flex items-center justify-center rounded-full bg-muted border text-[10px] font-bold mt-0.5">KU</div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <SparklesIcon className="size-3 text-primary" /> Try asking…
        </p>
        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTIONS.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              onClick={() => setQuery(q)}
              className="rounded-full border-primary/30 h-auto px-3 py-1 text-xs text-primary hover:border-primary hover:bg-primary/5"
            >
              {q}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Type your question in the bar at the bottom ↓
      </p>
    </div>
  );
};
