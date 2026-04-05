import type { ReactNode } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppBottomBar } from "@/components/app/app-bottom-bar";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthGuard
      header={<AppHeader />}
      sidebar={<AppSidebar />}
      bottomBar={<AppBottomBar />}
    >
      {children}
    </AuthGuard>
  );
};

export default AppLayout;
