"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const ContentTabs = dynamic(
  () => import("@/components/app/content-tabs").then((m) => ({ default: m.ContentTabs })),
  {
    loading: () => (
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
      </div>
    ),
  }
);

export const GroupsLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isGroupSettingsPage = /^\/groups\/[^/]+$/.test(pathname);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isGroupSettingsPage && (
        <div className="shrink-0 px-5 pt-5 lg:px-7 lg:pt-7">
          <ContentTabs active="groups" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className={`px-5 pb-5 lg:px-7 lg:pb-7 space-y-5 max-w-4xl ${
          isGroupSettingsPage ? "pt-4" : "pt-5 lg:pt-7"
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
};
