"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  MenuIcon, XIcon, MoonIcon, SunIcon, HeartPulseIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/core/ui/sheet";
import { Container, Row } from "@/core/primitives";

const NAV_LINKS = [
  { label: "Home",         href: "/" },
  { label: "Features",     href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Security",     href: "/security" },
  { label: "About",        href: "/about" },
  { label: "FAQ",          href: "/faq" },
  { label: "Contact",      href: "/contact" },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
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
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

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
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            </button>
            <Button asChild size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </Row>

          {/* Mobile hamburger */}
          <Row gap="sm" className="lg:hidden">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            </button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground" aria-label="Open menu">
                  <MenuIcon className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile header */}
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2 font-bold text-primary"
                      onClick={() => setMobileOpen(false)}
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
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </nav>
                  {/* Mobile CTA */}
                  <div className="border-t border-border p-4">
                    <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </Row>
        </Row>
      </Container>
    </header>
  );
}
