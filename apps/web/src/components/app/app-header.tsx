"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulseIcon, BellIcon, ChevronDownIcon,
  SettingsIcon, LogOutIcon, UserCircleIcon, UserPlusIcon,
  AlertTriangleIcon, UploadCloudIcon, UsersIcon, SparklesIcon, CheckIcon,
  VaultIcon, BotIcon, MessageCircleIcon, GraduationCapIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/hooks/api";

/* InviteModal only needed when the Invite button is clicked — load on demand */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null }
);

/* ── Top-nav items ───────────────────────────────────────────────── */
const TOP_NAV = [
  { id: "yours",     label: "My Vault",    href: "/vault",       icon: VaultIcon },
  { id: "community", label: "Community",   href: "/community",   icon: MessageCircleIcon },
  { id: "arogyaai",  label: "ArogyaAI",    href: "/arogya-ai",   icon: BotIcon },
  { id: "learn",     label: "ArogyaLearn", href: "/learn",        icon: GraduationCapIcon },
] as const;

/* ── Groups available for targeted invites ───────────────────────── */
const INVITE_GROUPS = [
  { id: "ravi",   name: "Ravi Kumar" },
  { id: "sharma", name: "Dr. Sharma's Clinic" },
  { id: "priya",  name: "Priya Singh" },
];

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
  const pathname     = usePathname();

  const [inviteOpen,    setInviteOpen]    = React.useState(false);
  const [inviteContext, setInviteContext] = React.useState<string | undefined>(undefined);
  const [notifOpen,     setNotifOpen]     = React.useState(false);
  const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ── Invite helpers ──────────────────────────────────────────── */
  function openInvite(groupId?: string) {
    setInviteContext(groupId);
    setInviteOpen(true);
  }

  const profileHref = "/profile";

  /* ── Active top-nav detection ────────────────────────────────── */
  function isNavActive(item: (typeof TOP_NAV)[number]) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

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

  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const displayName = user?.name ?? "User";
  const displayPhone = user?.phone
    ? `${user.phone.slice(0, 3)} ${user.phone.slice(3, 8)} ${user.phone.slice(8)}`
    : "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 lg:px-6 relative">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link href="/community" className="flex items-center gap-2 font-bold text-primary cursor-pointer shrink-0">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulseIcon className="size-3.5" />
          </div>
          <span className="text-base tracking-tight">ArogyaVault</span>
        </Link>

        {/* ── Centred top nav ──────────────────────────────────── */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-0.5">
          {TOP_NAV.map((item) => {
            const active = isNavActive(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Right actions ────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Vertical separator between nav and actions */}
          <div className="hidden md:block w-px h-5 bg-border mx-1" />

          {/* Invite — split button: left = direct action, right = dropdown list */}
          <div className="hidden sm:flex items-stretch h-8 rounded-md border border-input text-xs font-medium overflow-hidden">
            {/* Direct invite — opens modal at app level */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openInvite()}
              className="rounded-none h-full px-3 gap-1.5 border-r border-input text-xs font-medium"
            >
              <UserPlusIcon className="size-3.5" />
              Invite
            </Button>

            {/* Chevron — opens group-specific list */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-none h-full px-2">
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => openInvite()}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserPlusIcon className="size-3.5" />
                  Invite
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {INVITE_GROUPS.map((g) => (
                  <DropdownMenuItem
                    key={g.id}
                    onClick={() => openInvite(g.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <UsersIcon className="size-3.5" />
                    Invite to {g.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notification bell + panel */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 cursor-pointer"
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
            )}
          </div>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full h-auto pl-1 pr-2 py-1 gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">{displayName}</span>
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{displayPhone}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={profileHref} className="flex items-center gap-2 cursor-pointer">
                  <UserCircleIcon className="size-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={profileHref} className="flex items-center gap-2 cursor-pointer">
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

      {/* Global invite modal — groupContext drives the framing */}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        groupContext={inviteContext}
      />
    </>
  );
}
