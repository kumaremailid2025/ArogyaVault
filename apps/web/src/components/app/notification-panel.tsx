"use client";

import * as React from "react";
import {
  CheckIcon, AlertTriangleIcon, UploadCloudIcon,
  UsersIcon, SparklesIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { cn } from "@/lib/utils";

/* ── Notification type ─────────────────────────────────────────────── */
type Notif = {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: Notif[] = [
  {
    id: "n1",
    icon: UploadCloudIcon,
    iconBg: "bg-primary/10 text-primary",
    title: "Dr. Sharma uploaded a file",
    desc: "Discharge summary added to your shared group",
    time: "10 min ago",
    read: false,
  },
  {
    id: "n2",
    icon: AlertTriangleIcon,
    iconBg: "bg-rose-100 text-rose-600",
    title: "Lab value flagged",
    desc: "CBC report — Haemoglobin 11.2 g/dL (low)",
    time: "2 hrs ago",
    read: false,
  },
  {
    id: "n3",
    icon: UsersIcon,
    iconBg: "bg-primary/10 text-primary",
    title: "Ravi Kumar viewed your group",
    desc: "Ravi accessed the shared records",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n4",
    icon: SparklesIcon,
    iconBg: "bg-amber-100 text-amber-600",
    title: "ArogyaAI summary ready",
    desc: "Your weekly health digest is prepared",
    time: "2 days ago",
    read: true,
  },
];

/* ═══════════════════════════════════════════════════════════════════
   NOTIFICATION PANEL
   Extracted for lazy-loading — only fetched when bell is clicked.
═══════════════════════════════════════════════════════════════════ */

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS);
  const panelRef = React.useRef<HTMLDivElement>(null);

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
                <p className={cn(
                  "text-xs leading-snug",
                  !n.read ? "font-semibold" : "font-medium"
                )}>
                  {n.title}
                </p>
                {!n.read && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.desc}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
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
