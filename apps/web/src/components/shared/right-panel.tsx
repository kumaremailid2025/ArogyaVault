"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RightPanel Props
 *
 * A reusable right sidebar panel with header, scrollable body, and optional footer.
 * Commonly used in dashboard layouts for detail views, properties, and contextual information.
 *
 * @param title - Panel header title (required)
 * @param subtitle - Optional subtitle or description displayed below title
 * @param onClose - Callback fired when close (X) button is clicked (required)
 * @param children - Panel body content, rendered in scrollable area
 * @param footer - Optional footer content, sticky at bottom with top border
 * @param className - Additional CSS classes for the root container
 */
interface RightPanelProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * RightPanel Component
 *
 * A flexible right sidebar panel that provides:
 * - Fixed header with title, optional subtitle, and close button
 * - Scrollable body for main content
 * - Optional sticky footer separated by top border
 *
 * Used throughout ArogyaVault for:
 * - File detail views
 * - Member profiles
 * - Metric drilldowns
 * - Community insights
 *
 * @example
 * ```tsx
 * <RightPanel
 *   title="File Details"
 *   subtitle="Lab Report - March 2025"
 *   onClose={() => setSelected(null)}
 *   footer={<ComposeBox onSubmit={handleAsk} />}
 * >
 *   <FileContent />
 * </RightPanel>
 * ```
 */
export const RightPanel = React.forwardRef<
  HTMLDivElement,
  RightPanelProps
>(
  (
    {
      title,
      subtitle,
      onClose,
      children,
      footer,
      className,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col h-full overflow-hidden",
          className,
        )}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-3 p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md cursor-pointer shrink-0 transition-colors"
            aria-label="Close panel"
          >
            <XIcon className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="shrink-0 border-t border-border p-4">
            {footer}
          </div>
        )}
      </div>
    );
  },
);

RightPanel.displayName = "RightPanel";
