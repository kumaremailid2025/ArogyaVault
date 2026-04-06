"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ThreeColumnLayout Props
 *
 * A flexible three-column layout component with optional left and right sidebars.
 * Left and right columns are hidden on mobile (lg: breakpoint), center column is always visible.
 *
 * @param left - Optional left sidebar content (hidden on mobile)
 * @param center - Center/main content (required, always visible)
 * @param right - Optional right sidebar content (hidden on mobile)
 * @param leftWidth - Width class for left column (default: "w-[260px]")
 * @param rightWidth - Width class for right column (default: "w-[260px]")
 * @param className - Additional CSS classes for the root container
 */
interface ThreeColumnLayoutProps {
  left?: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  className?: string;
}

/**
 * ThreeColumnLayout Component
 *
 * A responsive layout that displays:
 * - Left sidebar: hidden on mobile, visible on lg+ screens
 * - Center content: always visible, takes remaining space
 * - Right sidebar: hidden on mobile, visible on lg+ screens
 *
 * Useful for dashboard layouts, admin interfaces, and content editors
 * where you need flexible sidebar positioning.
 *
 * @example
 * ```tsx
 * <ThreeColumnLayout
 *   left={<Navigation />}
 *   center={<MainContent />}
 *   right={<Properties />}
 * />
 * ```
 */
export const ThreeColumnLayout = React.forwardRef<
  HTMLDivElement,
  ThreeColumnLayoutProps
>(
  (
    {
      left,
      center,
      right,
      leftWidth = "w-[260px]",
      rightWidth = "w-[260px]",
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "h-full flex overflow-hidden",
          className,
        )}
      >
        {/* Left Sidebar */}
        {left && (
          <div
            className={cn(
              "shrink-0 border-r border-border overflow-hidden hidden lg:block",
              leftWidth,
            )}
          >
            {left}
          </div>
        )}

        {/* Center Content */}
        <div className="flex-1 overflow-y-auto">
          {center}
        </div>

        {/* Right Sidebar */}
        {right && (
          <div
            className={cn(
              "shrink-0 border-l border-border overflow-hidden hidden lg:block",
              rightWidth,
            )}
          >
            {right}
          </div>
        )}
      </div>
    );
  },
);

ThreeColumnLayout.displayName = "ThreeColumnLayout";
