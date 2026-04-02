import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulseIcon } from "lucide-react";
import { GuestGuard } from "@/components/shared/guest-guard";

export const metadata: Metadata = {
  title: "Sign In | ArogyaVault",
  description: "Sign in to ArogyaVault with your mobile number.",
};

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      {/* Minimal header — fixed height, never scrolls */}
      <header className="shrink-0 border-b border-border/40 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-primary">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulseIcon className="size-4" />
          </div>
          <span className="text-lg tracking-tight">ArogyaVault</span>
        </Link>
      </header>

      {/* Content fills remaining space — no scroll on wrapper */}
      <main className="flex flex-1 overflow-hidden">
        <GuestGuard>{children}</GuestGuard>
      </main>
    </div>
  );
};

export default AuthLayout;
