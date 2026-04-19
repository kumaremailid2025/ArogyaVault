"use client";

/**
 * SidebarOverlayContext
 * ---------------------
 * Shared open/close state for the Left Panel overlay at breakpoints
 * below `lg`, per `.spec/web/page/page-responsive.spec.md`.
 *
 * - `open`  — latched state (true = user clicked the hamburger / arrow).
 * - `setOpen` — latch setter.
 * - `toggle` — convenience toggler for the hamburger button.
 *
 * Hover-reveal is handled locally inside AppSidebar; this context only
 * carries the latched state so the hamburger button in AppHeader and
 * the overlay in AppSidebar stay in sync.
 */

import * as React from "react";

interface SidebarOverlayCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const SidebarOverlayContext = React.createContext<SidebarOverlayCtx | null>(
  null,
);

export const SidebarOverlayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);

  // Close the overlay on Esc (spec §4.1).
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = React.useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );

  return (
    <SidebarOverlayContext.Provider value={value}>
      {children}
    </SidebarOverlayContext.Provider>
  );
};

/**
 * Access the sidebar overlay state. Safe to call outside the provider —
 * falls back to no-op behaviour so components can render on non-community
 * routes without crashing.
 */
export const useSidebarOverlay = (): SidebarOverlayCtx => {
  const ctx = React.useContext(SidebarOverlayContext);
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {} };
  }
  return ctx;
};
