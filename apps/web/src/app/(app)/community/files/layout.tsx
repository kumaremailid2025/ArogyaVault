"use client";

/**
 * Files Layout — Main Community
 * -----------------------------
 * Thin wrapper that renders FilesLayoutContent for the main /community/files route.
 */

import { FilesLayoutContent } from "@/app/(app)/community/_components/files-layout-content";

interface FilesLayoutProps {
  children: React.ReactNode;
}

export default function FilesLayout({ children }: FilesLayoutProps) {
  return (
    <FilesLayoutContent variant="community" group="community" basePath="/community">
      {children}
    </FilesLayoutContent>
  );
}
