"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SendIcon, PaperclipIcon } from "lucide-react";
import { Button } from "@/core/ui/button";

export function AppBottomBar() {
  const pathname  = usePathname();
  const isAskAI   = pathname === "/ask-ai";
  const [query, setQuery] = React.useState("");

  return (
    <div className="shrink-0 border-t border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Upload button */}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 text-muted-foreground hover:text-primary"
        >
          <PaperclipIcon className="size-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>

        {/* AI search input */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 focus-within:border-primary transition-colors">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAskAI ? "Ask a follow-up question…" : "Ask anything about your health records…"}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            onKeyDown={(e) => { if (e.key === "Enter") setQuery(""); }}
          />
        </div>

        {/* Send */}
        <Button
          size="icon"
          className="size-9 shrink-0"
          disabled={!query.trim()}
          onClick={() => setQuery("")}
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
