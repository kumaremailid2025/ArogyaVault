"use client";

/**
 * NavigationProgress
 * ------------------
 * A thin progress bar + instant URL updater that provides immediate
 * visual feedback when the user clicks any internal <Link>.
 *
 * Two-pronged approach:
 *  1. **Instant URL**: Uses window.history.pushState to update the
 *     browser address bar the instant a link is clicked — before Next.js
 *     even starts its route transition. This is safe because Next.js
 *     will reconcile the same URL when its transition completes.
 *  2. **Progress bar**: Shows an animated bar at the top of the viewport
 *     that trickles from 15% → 90% during navigation and snaps to 100%
 *     once the new route mounts (detected via usePathname change).
 *
 * Together these make every navigation feel instant — the URL updates
 * in the address bar right away, a progress bar shows activity, and
 * loading.tsx Suspense boundaries swap in the skeleton.
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
    if (timerRef.current) clearInterval(timerRef.current);

    setIsNavigating(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        const increment = prev < 50 ? 8 : prev < 70 ? 4 : 2;
        return Math.min(prev + increment, 90);
      });
    }, 300);
  }, []);

  // ── Intercept link clicks ───────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, hash links, mailto/tel
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

      // ── INSTANT URL UPDATE ──
      // Push the target URL into the browser address bar immediately.
      // Next.js will reconcile the same URL when its transition completes,
      // so this is safe. The user sees the URL change right away.
      try {
        window.history.pushState(
          { ...window.history.state, __nprogress: true },
          "",
          href,
        );
      } catch {
        // Silently ignore — cross-origin or invalid URL
      }

      // Start the progress bar
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
        className="absolute right-0 top-0 h-full w-24"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(var(--primary) / 0.4))",
          transform: `translateX(${progress < 100 ? 0 : 100}%)`,
        }}
      />
    </div>
  );
};
