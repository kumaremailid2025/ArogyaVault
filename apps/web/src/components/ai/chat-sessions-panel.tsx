"use client";

import * as React from "react";
import {
  PlusIcon, MessageSquareIcon, SearchIcon, ClockIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { useAiContext, type ChatSession } from "@/data/ai-context-data";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   CHAT SESSIONS PANEL — left column
   Shows past conversations + new chat button
═══════════════════════════════════════════════════════════════════ */

interface ChatSessionsPanelProps {
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/** Hide the search input until there are more than this many conversations. */
const SEARCH_MIN_SESSIONS = 5;

export const ChatSessionsPanel = ({
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSessionsPanelProps) => {
  const { CHAT_SESSIONS } = useAiContext();
  const [search, setSearch] = React.useState("");

  const showSearch = CHAT_SESSIONS.length > SEARCH_MIN_SESSIONS;

  const filtered = React.useMemo(() => {
    if (!showSearch || !search.trim()) return CHAT_SESSIONS;
    const q = search.toLowerCase();
    return CHAT_SESSIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.preview.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search, showSearch, CHAT_SESSIONS]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* New AI conversation button */}
      <div className="px-2 pt-2 pb-1">
        <Button
          onClick={onNewChat}
          size="sm"
          className="w-full gap-1.5 text-xs"
        >
          <PlusIcon className="size-3.5" />
          New AI Conversation
        </Button>
      </div>

      {/* Search — only shown when there are enough conversations */}
      {showSearch && (
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
      )}

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
                  <Typography variant="caption" weight="medium" as="h4">{session.title}</Typography>
                  <Typography variant="micro" color="muted" as="span" className="shrink-0">{timeAgo(session.date)}</Typography>
                </div>
                <Typography variant="micro" color="muted">{session.preview}</Typography>
                <div className="flex items-center gap-1 mt-1">
                  {session.tags.slice(0, 2).map((tag) => (
                    <Typography key={tag} variant="micro" color="muted" as="span" className="px-1.5 py-0.5 rounded-full bg-muted">
                      {tag}
                    </Typography>
                  ))}
                  <Typography variant="micro" color="muted" as="span" className="ml-auto">{session.messageCount} msgs</Typography>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            {CHAT_SESSIONS.length === 0
              ? "No conversations yet. Start a new one!"
              : "No conversations found."}
          </div>
        )}
      </div>
    </div>
  );
};
