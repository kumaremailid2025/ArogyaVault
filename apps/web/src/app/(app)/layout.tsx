import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { AuthGuard } from "@/components/shared/auth-guard";

/* ── Lazy-loaded shell components ────────────────────────────────── */
const AppHeader = dynamic(
  () => import("@/components/app/app-header").then((m) => ({ default: m.AppHeader })),
  { loading: () => <div className="h-14 shrink-0 border-b border-border bg-background/95" /> }
);

const AppSidebar = dynamic(
  () => import("@/components/app/app-sidebar").then((m) => ({ default: m.AppSidebar })),
  { loading: () => <div className="hidden lg:block w-64 shrink-0 border-r border-border bg-background" /> }
);

const AppBottomBar = dynamic(
  () => import("@/components/app/app-bottom-bar").then((m) => ({ default: m.AppBottomBar })),
  { loading: () => <div className="shrink-0 h-[62px] border-t border-border bg-background" /> }
);

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Persistent header */}
        <AppHeader />

        {/* Body: sidebar + scrollable content */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />

          {/* Content column */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Scrollable content */}
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
            {/* Persistent bottom bar */}
            <AppBottomBar />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
