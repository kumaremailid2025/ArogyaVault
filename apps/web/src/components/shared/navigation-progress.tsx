"use client";

/**
 * NavigationProgress
 * ------------------
 * A thin progress bar that appears instantly when the user clicks any
 * internal <Link>. This solves the perceived "URL not updating" problem
 * in Next.js dev mode, where route compilation causes a delay between
 * click and actual navigation.
 *
 * How it works:
 *  1. Listens for click events on <a> tags with local hrefs
 *  2. Immediately shows an animated progress bar
 *  3. Hides once usePathname() reports a new route
 *
 * Zero dependencies, ~2KB gzipped.
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const NavigationProgress = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef(pathname);

  // ── Reset when pathname changes (navigation completed) ──────────
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      // Route changed — fill the bar then hide
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);

      prevPathRef.current = pathname;

      return () => clearTimeout(hideTimer);
    }
  }, [pathname]);

  // ── Trickle progress while navigating ───────────────────────────
  const startProgress = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    setIsNavigating(true);
    setProgress(15);

    // Trickle: gradually increase but never reach 100
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        // Slow down as we get closer to 90
        const increment = prev < 50 ? 8 : prev < 70 ? 4 : 2;
        return Math.min(prev + increment, 90);
      });
    }, 300);
  }, []);

  // ── Intercept link clicks ───────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest <a> tag
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash links, and same-page links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      // Skip if modifier keys are held (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Skip if the link target is _blank
      if (anchor.target === "_blank") return;

      // Skip if it's the current path
      if (href === pathname || href === pathname + "/") return;

      // Start the progress bar immediately
      startProgress();
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname, startProgress]);

  if (!isNavigating) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      role="progressbar"
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect at the leading edge */}
      <div
        className="absolute right-0 top-0 h-full w-24 -translate-x-0"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(var(--primary) / 0.4))",
          transform: `translateX(${progress < 100 ? 0 : 100}%)`,
        }}
      />
    </div>
  );
};
