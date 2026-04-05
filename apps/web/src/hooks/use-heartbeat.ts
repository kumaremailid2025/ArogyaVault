"use client";

/**
 * useHeartbeat
 * ------------
 * Lightweight session liveness check that runs periodically while the
 * user is authenticated. Calls POST /auth/heartbeat through the proxy.
 *
 * Purpose:
 *   - Detects expired/revoked sessions BEFORE a user-initiated API call fails
 *   - Triggers proactive token refresh (the proxy handles 401 → refresh → retry)
 *   - If refresh also fails → clears Zustand → AuthGuard redirects to /sign-in
 *
 * Behaviour:
 *   - Pings every HEARTBEAT_INTERVAL_MS (default 4 minutes)
 *   - Pauses when the browser tab is hidden (saves network)
 *   - Resumes immediately when the tab becomes visible again
 *   - Stops entirely when the user logs out (isAuthenticated = false)
 *
 * Cost: 1 proxy call → 1 JWT decode + 1 Redis EXISTS on backend. No DB queries.
 */

import * as React from "react";
import { useAuthStore } from "@/stores";

/* ── Config ───────────────────────────────────────────────────────── */

/** Heartbeat interval: 4 minutes (well within 15-min access_token lifetime). */
const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000;

/** How long to wait for a heartbeat response before giving up. */
const HEARTBEAT_TIMEOUT_MS = 10 * 1000;

/* ── Hook ─────────────────────────────────────────────────────────── */

export const useHeartbeat = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearUser = useAuthStore((s) => s.clearUser);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const sendHeartbeat = React.useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT_MS);

      const res = await fetch("/api/proxy/auth/heartbeat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 401) {
        // Session is truly dead (proxy already tried refresh and failed)
        clearUser();
      }
      // Any other status (200, 503, etc.) — silently ignore.
      // 200 = healthy, 503 = backend down but session may still be valid.
    } catch {
      // Network error, timeout, or abort — don't clear session.
      // The user might just be offline temporarily.
    }
  }, [clearUser]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      // User logged out — stop heartbeat
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // ── Start periodic heartbeat ────────────────────────────────────
    const startInterval = () => {
      // Clear any existing interval first
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    };

    // Send one immediately on mount (catches stale sessions fast)
    // Delay slightly to avoid racing with the initial /api/auth/me check
    const initialTimeout = setTimeout(() => {
      sendHeartbeat();
      startInterval();
    }, 5000);

    // ── Visibility change handler ───────────────────────────────────
    // Pause heartbeat when tab is hidden, resume when visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Tab became visible — send heartbeat immediately + restart interval
        sendHeartbeat();
        startInterval();
      } else {
        // Tab hidden — pause to save resources
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated, sendHeartbeat]);
};
