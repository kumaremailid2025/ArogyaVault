import type { Metadata } from "next";
import { LearnLayoutClient } from "./_components/learn-layout-client";

export const metadata: Metadata = {
  title: "ArogyaLearn | ArogyaVault",
  description: "Browse health topics, medical systems, departments, drug interactions, and PDF Q&A.",
};

const LearnLayout = ({ children }: { children: React.ReactNode }) => (
  <LearnLayoutClient>{children}</LearnLayoutClient>
);

export default LearnLayout;
