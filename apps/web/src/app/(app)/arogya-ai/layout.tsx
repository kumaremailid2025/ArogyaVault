import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArogyaAI | ArogyaVault",
  description: "AI-powered health assistant for personalised insights.",
};

const ArogyaAiLayout = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default ArogyaAiLayout;
