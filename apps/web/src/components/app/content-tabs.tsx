"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "home",    label: "Liveboard",      href: "/liveboard" },
  { key: "records", label: "Documents",      href: "/records"   },
  { key: "groups",  label: "Group Settings", href: "/groups"    },
];

export function ContentTabs({
  active,
  showGroupSettings = false,
}: {
  active: "home" | "records" | "groups";
  /** When true, adds the Group Settings tab (only for linked/invited users) */
  showGroupSettings?: boolean;
}) {
  const searchParams = useSearchParams();
  const g = searchParams.get("g") ?? "";

  /* Preserve the ?g= param so the sidebar keeps its selection */
  const href = (base: string) => (g ? `${base}?g=${g}` : base);

  const visibleTabs = showGroupSettings ? TABS : TABS.filter(t => t.key !== "groups");

  return (
    <div className="flex gap-0 border-b border-border -mx-5 lg:-mx-7 px-5 lg:px-7">
      {visibleTabs.map((t) => (
        <Link
          key={t.key}
          href={href(t.href)}
          className={cn(
            "px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer",
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
