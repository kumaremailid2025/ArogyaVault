"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "home",     label: "Home",     href: "/liveboard" },
  { key: "records",  label: "Records",  href: "/records" },
  { key: "groups",   label: "Groups",   href: "/groups" },
  { key: "settings", label: "Settings", href: "/profile" },
];

export function ContentTabs({ active }: { active: "home" | "records" | "groups" | "settings" | "ask-ai" }) {
  return (
    <div className="flex gap-0 border-b border-border -mx-5 lg:-mx-7 px-5 lg:px-7">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            active === t.key
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
