import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Vault | ArogyaVault",
  description: "Personal health records vault — vitals, charts, and files.",
};

const VaultLayout = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default VaultLayout;
