"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import Typography from "@/components/ui/typography";

type ThemeOption = {
  id: "light" | "dark" | "system";
  label: string;
  icon: React.ElementType;
  sub: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    icon: SunIcon,
    sub: "Always light",
  },
  {
    id: "dark",
    label: "Dark",
    icon: MoonIcon,
    sub: "Always dark",
  },
  {
    id: "system",
    label: "System",
    icon: MonitorIcon,
    sub: "Follows your OS setting",
  },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  /* Avoid hydration mismatch — render only after mount */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {THEME_OPTIONS.map((opt, i) => {
        const isActive = mounted && theme === opt.id;
        return (
          <Button
            key={opt.id}
            variant="ghost"
            onClick={() => setTheme(opt.id)}
            className={cn(
              "w-full h-auto flex items-center justify-between px-4 py-3 rounded-none cursor-pointer text-left",
              i > 0 && "border-t border-border",
              isActive ? "bg-primary/5 hover:bg-primary/5" : "hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg",
                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <opt.icon className="size-3.5" />
              </div>
              <div>
                <Typography
                  variant="body"
                  weight="medium"
                  color={isActive ? "primary" : "default"}
                >
                  {opt.label}
                </Typography>
                <Typography variant="caption" color="muted">{opt.sub}</Typography>
              </div>
            </div>

            {/* Active indicator */}
            <div className={cn(
              "size-4 rounded-full border-2 transition-colors shrink-0",
              isActive
                ? "border-primary bg-primary"
                : "border-border bg-transparent"
            )}>
              {isActive && (
                <div className="size-full rounded-full flex items-center justify-center">
                  <div className="size-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};
