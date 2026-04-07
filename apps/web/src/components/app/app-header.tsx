"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulseIcon, BellIcon, ChevronDownIcon,
  SettingsIcon, LogOutIcon, UserCircleIcon, UserPlusIcon,
  UsersIcon, StarIcon, TagIcon, ThumbsUpIcon, MessageSquareIcon, ActivityIcon,
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

/* ── Top-nav items (simple links) ───────────────────────────────── */
const TOP_NAV = [
  { id: "community", label: "Community",   href: "/community",   icon: MessageCircleIcon },
  { id: "arogyaai",  label: "ArogyaAI",    href: "/arogya-ai",   icon: BotIcon },
  { id: "learn",     label: "ArogyaLearn", href: "/learn",       icon: GraduationCapIcon },
] as const;

/* ── My Vault dropdown items ─────────────────────────────────────── */
const MY_VAULT_ITEMS = [
  { id: "vault",     label: "My Vault",             href: "/vault",         icon: VaultIcon },
  { id: "favorites", label: "My Favorites",        href: "/favorites",     icon: StarIcon },
  { id: "likes",     label: "My Liked Posts",      href: "/likes",         icon: ThumbsUpIcon },
  { id: "replied",   label: "My Replies",          href: "/replied",       icon: MessageSquareIcon },
  { id: "activity",  label: "My Activity",         href: "/activity",      icon: ActivityIcon },
  { id: "topics",    label: "My Topics",           href: "/tags/diabetes", icon: TagIcon },
] as const;

/* ── Groups available for targeted invites ───────────────────────── */
const INVITE_GROUPS = [
  { id: "ravi",   name: "Ravi Kumar" },
  { id: "sharma", name: "Dr. Sharma's Clinic" },
  { id: "priya",  name: "Priya Singh" },
];

export const AppHeader = () => {
  const pathname = usePathname();

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

  /* ── My Vault active detection ─────────────────────────────── */
  const activeVaultItem = MY_VAULT_ITEMS.find((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
    || (item.id === "topics" && pathname.startsWith("/tags"))
  );
  const isVaultActive = !!activeVaultItem;
  const vaultLabel = activeVaultItem?.label ?? "My Vault";
  const VaultActiveIcon = activeVaultItem?.icon ?? VaultIcon;

  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const displayName = user?.name ?? "User";
  const displayPhone = user?.phone_masked ?? "";
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
          {/* Simple nav links */}
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

          {/* My Vault — split: label (link) | divider | chevron (dropdown) */}
          <div className={cn(
            "flex items-center rounded-full overflow-hidden transition-colors",
            isVaultActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}>
            <Link
              href={activeVaultItem?.href ?? "/vault"}
              className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              <VaultActiveIcon className="size-3.5 shrink-0" />
              {vaultLabel}
            </Link>
            {/* Divider between label and chevron */}
            <div className={cn(
              "w-px h-4 shrink-0",
              isVaultActive ? "bg-white/30" : "bg-border"
            )} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center px-2 py-1.5 cursor-pointer transition-colors rounded-r-full",
                  isVaultActive
                    ? "hover:bg-white/10"
                    : "hover:bg-muted"
                )}>
                  <ChevronDownIcon className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {MY_VAULT_ITEMS.map((item) => {
                  const isActive = activeVaultItem?.id === item.id;
                  return (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isActive && "font-semibold text-primary"
                        )}
                      >
                        <item.icon className="size-3.5" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

          {/* Profile dropdown — clean: Profile, Settings, Sign Out */}
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
};
