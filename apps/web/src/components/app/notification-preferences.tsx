"use client";

import * as React from "react";
import { Switch } from "@/core/ui/switch";

type NotificationItem = { label: string; sub: string; on: boolean };

export function NotificationPreferences({ items }: { items: NotificationItem[] }) {
  const [prefs, setPrefs] = React.useState(items);

  function toggle(index: number) {
    setPrefs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, on: !item.on } : item))
    );
  }

  return (
    <div className="rounded-xl border border-border divide-y divide-border bg-background">
      {prefs.map((n, i) => (
        <div key={n.label} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-medium">{n.label}</p>
            <p className="text-xs text-muted-foreground">{n.sub}</p>
          </div>
          <Switch
            checked={n.on}
            onCheckedChange={() => toggle(i)}
            aria-label={n.label}
          />
        </div>
      ))}
    </div>
  );
}
