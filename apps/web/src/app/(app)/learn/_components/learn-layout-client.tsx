"use client";

import { LearnBanner } from "@/components/learn/learn-banner";

export const LearnLayoutClient = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full flex flex-col overflow-hidden">
    <LearnBanner />
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);
