"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MenuIcon, MoonIcon, SunIcon, HeartPulseIcon,
  LogOutIcon, LayoutDashboardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { Sheet, SheetTrigger } from "@/core/ui/sheet";
import { Container, Row } from "@/core/primitives";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { useAuthStore } from "@/stores";
import { useLogout } from "@/hooks/api";
import dynamic from "next/dynamic";

/* Lazy-loaded: mobile sheet only fetched when hamburger is opened */
const MobileNavSheet = dynamic(
  () => import("@/components/layout/mobile-nav-sheet").then((m) => ({ default: m.MobileNavSheet })),
  { ssr: false, loading: () => null }
);

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

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();

  const displayName = user?.name ?? "User";
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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      <Container>
        <Row className="h-16 justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-primary">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartPulseIcon className="size-4" />
            </div>
            <span className="text-lg tracking-tight">ArogyaVault</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          {/* Desktop right actions */}
          <Row gap="sm" className="hidden lg:flex">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:border-primary hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-auto pl-1 pr-2 py-1 gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <span className="font-semibold">{displayName}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/community" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboardIcon className="size-4" /> Dashboard
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
            ) : (
              <Button asChild size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </Row>

          {/* Mobile hamburger */}
          <Row gap="sm" className="lg:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              {mobileOpen && (
                <MobileNavSheet onClose={() => setMobileOpen(false)} />
              )}
            </Sheet>
          </Row>
        </Row>
      </Container>
    </header>
  );
};
