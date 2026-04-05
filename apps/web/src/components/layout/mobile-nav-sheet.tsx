"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulseIcon, LogOutIcon, LayoutDashboardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { SheetContent } from "@/core/ui/sheet";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/hooks/api";

/* ── Nav links (shared with parent Navbar) ─────────────────────────── */
const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "Features",     href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security",     href: "/security" },
  { label: "About",        href: "/about" },
  { label: "FAQ",          href: "/faq" },
  { label: "Contact",      href: "/contact" },
];

const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative text-sm font-medium transition-colors hover:text-primary",
        isActive
          ? "text-primary after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
          : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MOBILE NAV SHEET
   Extracted for lazy-loading — only fetched on small viewports
   when the hamburger menu is opened.
═══════════════════════════════════════════════════════════════════ */

interface MobileNavSheetProps {
  onClose: () => void;
}

export const MobileNavSheet = ({ onClose }: MobileNavSheetProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logoutMutation = useLogout();

  const handleSignOut = () => {
    onClose();
    logoutMutation.mutate();
  };

  return (
    <SheetContent side="right" className="w-72 p-0">
      <div className="flex flex-col h-full">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-primary"
            onClick={onClose}
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulseIcon className="size-3.5" />
            </div>
            <span>ArogyaVault</span>
          </Link>
        </div>
        {/* Mobile links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              onClick={onClose}
            />
          ))}
        </nav>
        {/* Mobile CTA */}
        <div className="border-t border-border p-4">
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full" onClick={onClose}>
                <Link href="/community" className="flex items-center gap-2">
                  <LayoutDashboardIcon className="size-4" /> Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOutIcon className="size-4 mr-2" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full" onClick={onClose}>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </SheetContent>
  );
};
