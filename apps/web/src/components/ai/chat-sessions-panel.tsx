"use client";

import * as React from "react";
import {
  PlusIcon, MessageSquareIcon, SearchIcon, ClockIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { CHAT_SESSIONS, type ChatSession } from "@/data/ai-context-data";

/* ═══════════════════════════════════════════════════════════════════
   CHAT SESSIONS PANEL — left column
   Shows past conversations + new chat button
═══════════════════════════════════════════════════════════════════ */

interface ChatSessionsPanelProps {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ChatSessionsPanel({
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSessionsPanelProps) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return CHAT_SESSIONS;
    const q = search.toLowerCase();
    return CHAT_SESSIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.preview.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* New chat button */}
      <div className="px-2 pt-2 pb-1">
        <Button
          onClick={onNewChat}
          size="sm"
          className="w-full gap-1.5 text-xs"
        >
          <PlusIcon className="size-3.5" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="relative px-2 py-1.5">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-7 pl-7 pr-2 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
      </div>

      {/* Section label */}
      <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <ClockIcon className="size-3" /> Recent
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-1 space-y-0.5">
        {filtered.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={cn(
              "w-full text-left px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer group",
              activeSessionId === session.id
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "hover:bg-muted/60"
            )}
          >
            <div className="flex items-start gap-2">
              <MessageSquareIcon className={cn(
                "size-3.5 mt-0.5 shrink-0",
                activeSessionId === session.id ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-medium truncate">{session.title}</h4>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(session.date)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{session.preview}</p>
                <div className="flex items-center gap-1 mt-1">
                  {session.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  <span className="text-[9px] text-muted-foreground ml-auto">{session.messageCount} msgs</span>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No conversations found.
          </div>
        )}
      </div>
    </div>
  );
}
