"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulseIcon, BellIcon, ChevronDownIcon,
  SettingsIcon, LogOutIcon, UserCircleIcon, UserPlusIcon,
  UsersIcon, StarIcon,
  VaultIcon, BotIcon, MessageCircleIcon, GraduationCapIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/hooks/api";

/* InviteModal only needed when the Invite button is clicked — load on demand */
const InviteModal = dynamic(
  () => import("@/components/app/invite-modal").then((m) => ({ default: m.InviteModal })),
  { ssr: false, loading: () => null }
);

/* NotificationPanel only fetched when bell icon is clicked */
const NotificationPanel = dynamic(
  () => import("@/components/app/notification-panel").then((m) => ({ default: m.NotificationPanel })),
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

export const AppHeader = () => {
  const pathname     = usePathname();

  const [inviteOpen,    setInviteOpen]    = React.useState(false);
  const [inviteContext, setInviteContext] = React.useState<string | undefined>(undefined);
  const [notifOpen,     setNotifOpen]     = React.useState(false);

  /* ── Invite helpers ──────────────────────────────────────────── */
  const openInvite = (groupId?: string) => {
    setInviteContext(groupId);
    setInviteOpen(true);
  };

  const profileHref = "/profile";

  /* ── Active top-nav detection ────────────────────────────────── */
  const isNavActive = (item: (typeof TOP_NAV)[number]) => {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

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

          {/* Notification bell + lazy-loaded panel */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 cursor-pointer"
              onClick={() => setNotifOpen((v) => !v)}
            >
              <BellIcon className="size-4" />
            </Button>

            {notifOpen && (
              <NotificationPanel onClose={() => setNotifOpen(false)} />
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
              <DropdownMenuItem asChild>
                <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                  <StarIcon className="size-4" /> Favorites
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
};
