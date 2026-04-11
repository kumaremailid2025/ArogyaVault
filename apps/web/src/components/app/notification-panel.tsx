"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar, type TopNotification } from "@/data/sidebar-data";
import Typography from "@/components/ui/typography";

/* ── Notification type ─────────────────────────────────────────────── */
type Notif = TopNotification;

/* ═══════════════════════════════════════════════════════════════════
   NOTIFICATION PANEL
   Extracted for lazy-loading — only fetched when bell is clicked.
═══════════════════════════════════════════════════════════════════ */

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { TOP_NOTIFICATIONS } = useSidebar();
  const [notifications, setNotifications] = React.useState<Notif[]>(TOP_NOTIFICATIONS);
  const panelRef = React.useRef<HTMLDivElement>(null);

  /* Sync local state when backend data loads */
  React.useEffect(() => {
    setNotifications(TOP_NOTIFICATIONS);
  }, [TOP_NOTIFICATIONS]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x))
    );
  };

  /* Close on outside click */
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  /* Mark all read on open */
  React.useEffect(() => {
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-background shadow-xl overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm">Notifications</span>
        <Button
          variant="link"
          size="sm"
          onClick={markAllRead}
          className="h-auto p-0 text-xs text-primary gap-1"
        >
          <CheckIcon className="size-3" /> Mark all read
        </Button>
      </div>

      {/* Notification list */}
      <div className="divide-y divide-border max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <Button
            key={n.id}
            variant="ghost"
            onClick={() => markRead(n.id)}
            className={cn(
              "w-full h-auto flex items-start gap-3 px-4 py-3 text-left rounded-none hover:bg-muted/50",
              !n.read && "bg-primary/5 hover:bg-primary/5"
            )}
          >
            <div className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full mt-0.5",
              n.iconBg
            )}>
              <n.icon className="size-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Typography
                  variant="caption"
                  weight={!n.read ? "semibold" : "medium"}
                >
                  {n.title}
                </Typography>
                {!n.read && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
              <Typography variant="caption" color="muted" className="mt-0.5 leading-snug">{n.desc}</Typography>
              <Typography variant="micro" color="muted">{n.time}</Typography>
            </div>
          </Button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5">
        <Button variant="link" size="sm" className="w-full h-auto p-0 text-xs text-primary">
          View all notifications
        </Button>
      </div>
    </div>
  );
};
