"use client";

/**
 * Learn Layout
 * ------------
 * Shared layout for all /learn/* routes.
 * Renders the ArogyaLearn banner with route-driven tab navigation,
 * then {children} for the active route's page content.
 */

import { LearnBanner } from "@/components/learn/learn-banner";

const LearnLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full flex flex-col overflow-hidden">
    <LearnBanner />
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

export default LearnLayout;
