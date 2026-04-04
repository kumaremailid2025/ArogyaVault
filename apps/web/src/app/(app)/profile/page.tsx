import type { Metadata } from "next";
import {
  SmartphoneIcon, ShieldCheckIcon, BellIcon,
  EyeIcon, KeyRoundIcon, LogOutIcon,
  CheckCircle2Icon, PaletteIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";
import { ThemeSwitcher } from "@/components/app/theme-switcher";
import { NotificationPreferences } from "@/components/app/notification-preferences";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile & Settings | ArogyaVault" };

const ACCESS_LOG = [
  { who: "Dr. Sharma's Clinic", action: "Viewed your group records", time: "Today, 10:42 AM",  icon: EyeIcon,          color: "text-primary bg-primary/10" },
  { who: "Ravi Kumar",           action: "Joined your health group", time: "Yesterday, 3:15 PM", icon: CheckCircle2Icon, color: "text-emerald-600 bg-emerald-50" },
  { who: "You",                  action: "Uploaded CBC Lab Report",  time: "15 Mar, 9:00 AM",   icon: ShieldCheckIcon,  color: "text-violet-600 bg-violet-50" },
];

const NOTIFICATIONS = [
  { label: "Document processed",     sub: "When AI finishes reading an upload",   on: true  },
  { label: "New group invite",        sub: "When someone invites you to a group",  on: true  },
  { label: "Upload pending approval", sub: "When a member uploads on your behalf", on: true  },
  { label: "Weekly health digest",    sub: "Summary of your health activity",      on: false },
];

const ProfilePage = () => {
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
              <h1 className="text-lg font-bold">Kumar</h1>
              <Badge className="text-xs bg-primary/10 text-primary border-0">Patient</Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <SmartphoneIcon className="size-3.5" />
              <span>+91 98765 43210</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Member since January 2026</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 cursor-pointer">Edit Profile</Button>
        </div>

        {/* Theme */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <PaletteIcon className="size-4 text-primary" /> Appearance
          </h2>
          <ThemeSwitcher />
        </section>

        {/* Security settings */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <KeyRoundIcon className="size-4 text-primary" /> Security & Access
          </h2>
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
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <BellIcon className="size-4 text-primary" /> Notification Preferences
          </h2>
          <NotificationPreferences items={NOTIFICATIONS} />
        </section>

        {/* Access log */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <EyeIcon className="size-4 text-primary" /> Recent Access Log
          </h2>
          <div className="rounded-xl border border-border divide-y divide-border bg-background">
            {ACCESS_LOG.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs", entry.color)}>
                  <entry.icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{entry.who}</p>
                  <p className="text-xs text-muted-foreground">{entry.action}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{entry.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Account / Danger zone */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-destructive flex items-center gap-1.5">
            <LogOutIcon className="size-4" /> Account
          </h2>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-xs text-muted-foreground">End your current session on this device.</p>
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
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{desc}</p>
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
