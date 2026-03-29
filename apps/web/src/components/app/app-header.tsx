"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulseIcon, BellIcon, ChevronDownIcon,
  SettingsIcon, LogOutIcon, UserCircleIcon, UserPlusIcon,
  AlertTriangleIcon, UploadCloudIcon, UsersIcon, SparklesIcon, CheckIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import dynamic from "next/dynamic";

/* InviteModal only needed when the Invite button is clicked — load on demand */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null }
);
import { cn } from "@/lib/utils";

/* ── Dummy notifications ─────────────────────────────────────────── */
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

export function AppHeader() {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* Close notification panel on outside click */
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  function markAllRead() {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  }

  function markRead(id: string) {
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x))
    );
  }

  function handleSignOut() {
    router.push("/sign-in");
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 lg:px-6">
        {/* Logo */}
        <Link href="/liveboard" className="flex items-center gap-2 font-bold text-primary">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulseIcon className="size-3.5" />
          </div>
          <span className="text-base tracking-tight">ArogyaVault</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Global invite button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-1.5 h-8 text-xs"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlusIcon className="size-3.5" />
            Invite
          </Button>

          {/* Notification bell + panel */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markAllRead(); }}
            >
              <BellIcon className="size-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 size-4 p-0 flex items-center justify-center text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* Notification panel */}
            {notifOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-semibold text-sm">Notifications</span>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckIcon className="size-3" /> Mark all read
                  </button>
                </div>

                {/* Notification list */}
                <div className="divide-y divide-border max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                        !n.read && "bg-primary/5"
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
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2.5">
                  <button className="w-full text-xs text-center text-primary hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                    KU
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">Kumar</span>
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">Kumar</span>
                  <span className="text-xs font-normal text-muted-foreground">+91 98765 43210</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserCircleIcon className="size-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <SettingsIcon className="size-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOutIcon className="size-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global invite modal */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
