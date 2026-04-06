import type { Metadata } from "next";
import { RecordsLayoutClient } from "./_components/records-layout-client";

export const metadata: Metadata = {
  title: "Records | ArogyaVault",
  description: "Your medical documents, organised and searchable.",
};

const RecordsLayout = ({ children }: { children: React.ReactNode }) => (
  <RecordsLayoutClient>{children}</RecordsLayoutClient>
);

export default RecordsLayout;
