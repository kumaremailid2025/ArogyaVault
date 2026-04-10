import type { ReactNode } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";
import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppBottomBar } from "@/components/app/app-bottom-bar";
import { AppDataProvider } from "@/providers/appdata-provider";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AppDataProvider>
      <AuthGuard
        header={<AppHeader />}
        sidebar={<AppSidebar />}
        bottomBar={<AppBottomBar />}
      >
        {children}
      </AuthGuard>
    </AppDataProvider>
  );
};

export default AppLayout;
