import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulseIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | ArogyaVault",
  description: "Sign in to ArogyaVault with your mobile number.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-border/40 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-primary">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulseIcon className="size-4" />
          </div>
          <span className="text-lg tracking-tight">ArogyaVault</span>
        </Link>
      </header>
      <main className="flex-1 flex">{children}</main>
    </div>
  );
}
