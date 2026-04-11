"use client";

import {
  SmartphoneIcon, ShieldCheckIcon, BellIcon,
  EyeIcon, KeyRoundIcon, LogOutIcon,
  PaletteIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { NotificationPreferences } from "@/components/app/notification-preferences";
import { cn } from "@/lib/utils";
import { useProfile } from "@/data/profile-data";
import Typography from "@/components/ui/typography";

const ProfilePage = () => {
  const { ACCESS_LOG, NOTIFICATIONS } = useProfile();
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 lg:p-7 space-y-6 max-w-2xl">

        {/* Profile card */}
        <div className="rounded-xl border border-border bg-background p-5 flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">KU</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Typography variant="h2" as="h1">Kumar</Typography>
              <Badge className="text-xs bg-primary/10 text-primary border-0">Patient</Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <SmartphoneIcon className="size-3.5" />
              <span>+91 98765 43210</span>
            </div>
            <Typography variant="caption" color="muted" className="mt-0.5">
              Member since January 2026
            </Typography>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 cursor-pointer">Edit Profile</Button>
        </div>

        {/* Theme */}
        <section className="space-y-2">
          <Typography variant="h4" as="h2" className="flex items-center gap-1.5">
            <PaletteIcon className="size-4 text-primary" /> Appearance
          </Typography>
          <ThemeSwitcher />
        </section>

        {/* Security settings */}
        <section className="space-y-2">
          <Typography variant="h4" as="h2" className="flex items-center gap-1.5">
            <KeyRoundIcon className="size-4 text-primary" /> Security & Access
          </Typography>
          <div className="rounded-xl border border-border divide-y divide-border bg-background">
            <SettingRow
              icon={SmartphoneIcon}
              title="Mobile Number"
              desc="+91 98765 43210 (verified)"
              action="Change"
            />
            <SettingRow
              icon={KeyRoundIcon}
              title="App PIN"
              desc="6-digit PIN for app access"
              action="Set up PIN"
              actionVariant="outline"
            />
            <SettingRow
              icon={ShieldCheckIcon}
              title="Biometric Login"
              desc="Fingerprint / Face ID (mobile app)"
              action="Enable"
              actionVariant="outline"
            />
            <SettingRow
              icon={EyeIcon}
              title="Active Sessions"
              desc="Web browser · Hyderabad, IN · Active now"
              action="View All"
              actionVariant="ghost"
            />
          </div>
        </section>

        {/* Notification preferences */}
        <section className="space-y-2">
          <Typography variant="h4" as="h2" className="flex items-center gap-1.5">
            <BellIcon className="size-4 text-primary" /> Notification Preferences
          </Typography>
          <NotificationPreferences items={NOTIFICATIONS} />
        </section>

        {/* Access log */}
        <section className="space-y-2">
          <Typography variant="h4" as="h2" className="flex items-center gap-1.5">
            <EyeIcon className="size-4 text-primary" /> Recent Access Log
          </Typography>
          <div className="rounded-xl border border-border divide-y divide-border bg-background">
            {ACCESS_LOG.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs", entry.color)}>
                  <entry.icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <Typography variant="body" weight="medium">{entry.who}</Typography>
                  <Typography variant="caption" color="muted">{entry.action}</Typography>
                </div>
                <Typography variant="caption" color="muted" as="span" className="shrink-0">{entry.time}</Typography>
              </div>
            ))}
          </div>
        </section>

        {/* Account / Danger zone */}
        <section className="space-y-2">
          <Typography variant="h4" as="h2" color="destructive" className="flex items-center gap-1.5">
            <LogOutIcon className="size-4" /> Account
          </Typography>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
            <div>
              <Typography variant="body" weight="medium">Sign Out</Typography>
              <Typography variant="caption" color="muted">End your current session on this device.</Typography>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
            >
              Sign Out
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
};

const SettingRow = ({
  icon: Icon, title, desc, action,
  actionVariant = "outline",
}: {
  icon: React.ElementType; title: string; desc: string;
  action: string; actionVariant?: "default" | "outline" | "ghost";
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="size-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <Typography variant="body" weight="medium">{title}</Typography>
          <Typography variant="caption" color="muted" truncate={true}>{desc}</Typography>
        </div>
      </div>
      <Button
        variant={actionVariant as "default" | "outline" | "ghost"}
        size="sm"
        className="shrink-0 text-xs h-7 cursor-pointer"
      >
        {action}
      </Button>
    </div>
  );
};

export default ProfilePage;
