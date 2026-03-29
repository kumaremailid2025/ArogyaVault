import { AppHeader }    from "@/components/app/app-header";
import { AppSidebar }   from "@/components/app/app-sidebar";
import { AppBottomBar } from "@/components/app/app-bottom-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Persistent header */}
      <AppHeader />

      {/* Body: sidebar + scrollable content */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        {/* Content column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          {/* Persistent bottom bar */}
          <AppBottomBar />
        </div>
      </div>
    </div>
  );
}
