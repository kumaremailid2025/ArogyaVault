"use client";

import * as React from "react";
import { Switch } from "@/core/ui/switch";
import Typography from "@/components/ui/typography";

type NotificationItem = { label: string; sub: string; on: boolean };

export const NotificationPreferences = ({ items }: { items: NotificationItem[] }) => {
  const [prefs, setPrefs] = React.useState(items);

  const toggle = (index: number) => {
    setPrefs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, on: !item.on } : item))
    );
  };

  return (
    <div className="rounded-xl border border-border divide-y divide-border bg-background">
      {prefs.map((n, i) => (
        <div key={n.label} className="flex items-center justify-between px-4 py-3">
          <div>
            <Typography variant="body" weight="medium">{n.label}</Typography>
            <Typography variant="caption" color="muted">{n.sub}</Typography>
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
};
