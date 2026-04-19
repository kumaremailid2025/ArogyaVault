"use client";

/**
 * CommunityColumns
 * ----------------
 * Shared two-column wrapper used by feed / files / members layout
 * contents under /community. Encodes the responsive contract from
 * `.spec/web/page/page-responsive.spec.md`:
 *
 * - Desktop (`≥ lg`): both columns visible side by side.
 * - Medium (`md`–`< lg`): both visible; a `←` button in the left column
 *   opens the Left Panel overlay.
 * - Small (`< md`): ONE of Main / Right shown at a time. When a card is
 *   selected (`rightPanelActive`), Right takes the screen and shows a
 *   `←` back arrow that routes back to `basePath`.
 *
 * The wrapper does NOT own selection state — it only reads
 * `rightPanelActive` and delegates "go back" via `onCloseRightPanel`.
 * Both props default sensibly for the common case.
 */

import * as React from "react";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/core/ui/button";
import { useSidebarOverlay } from "@/components/app/sidebar-overlay-context";

/**
 * Props for {@link CommunityColumns}.
 */
export interface CommunityColumnsProps {
  /** The scrollable list side — posts, files, members. */
  left: React.ReactNode;
  /** The route-driven panel side — summary / replies / detail. */
  right: React.ReactNode;
  /**
   * True when the Right column is showing a selected-card detail. At
   * `< md` this flips the view from Main → Right and shows the back
   * arrow.
   */
  rightPanelActive: boolean;
  /**
   * Callback for the `<` back arrow on the right column at `< md`.
   * Typically `() => router.push(basePath)`.
   */
  onCloseRightPanel: () => void;
}

/**
 * Render the responsive two-column community layout.
 */
export const CommunityColumns = ({
  left,
  right,
  rightPanelActive,
  onCloseRightPanel,
}: CommunityColumnsProps): React.ReactElement => {
  const { setOpen: setSidebarOpen } = useSidebarOverlay();

  return (
    <>
      {/* ── LEFT (Main Content) ───────────────────────────────── */}
      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col overflow-hidden",
          /* At < md, hide Main when the Right detail is active. */
          rightPanelActive ? "hidden md:flex" : "flex",
        )}
      >
        {/* `<-` open-Left-Panel header — visible only below lg. */}
        <div className="lg:hidden shrink-0 flex items-center gap-1 px-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="h-8 px-2 gap-1 text-muted-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            <span className="text-xs font-medium">Groups</span>
          </Button>
        </div>

        {left}
      </div>

      {/* ── Vertical divider — only matters at md+ where both are on-screen ── */}
      <div className="w-px bg-border shrink-0 hidden md:block" />

      {/* ── RIGHT (Detail / Contextual) ───────────────────────── */}
      <div
        className={cn(
          "border-l border-border overflow-hidden flex flex-col shrink-0",
          /* At < md, Right takes the whole row when active, hidden otherwise.
             At md+, it's the classic fixed 360px rail. */
          "md:w-[360px]",
          rightPanelActive ? "flex-1 md:flex-none" : "hidden md:flex",
        )}
      >
        {/* `<-` back-to-main header — only at < md when detail is active. */}
        {rightPanelActive && (
          <div className="md:hidden shrink-0 flex items-center gap-1 px-3 py-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Back to list"
              onClick={onCloseRightPanel}
              className="h-8 px-2 gap-1 text-muted-foreground"
            >
              <ArrowLeftIcon className="size-4" />
              <span className="text-xs font-medium">Back</span>
            </Button>
          </div>
        )}

        {right}
      </div>
    </>
  );
};
