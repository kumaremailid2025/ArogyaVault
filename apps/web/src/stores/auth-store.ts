/**
 * Auth Store (Zustand) — In-Memory Only
 * --------------------------------------
 * Stores the authenticated user's profile for client-side UI.
 *
 * KEY DESIGN:
 *   - NO sessionStorage / localStorage / persist middleware
 *   - NO tokens stored on the client (JWT lives in httpOnly cookies)
 *   - On page refresh the store starts empty; AuthGuard/GuestGuard
 *     call GET /api/auth/me which reads the httpOnly cookie server-side,
 *     validates the JWT, and returns the user profile to repopulate this store.
 *
 * Usage:
 *   const user = useAuthStore((s) => s.user);
 *   const { setUser, clearUser } = useAuthStore();
 */

import { create } from "zustand";

/* ── Types ────────────────────────────────────────────────────────── */

/**
 * AuthUser — identified by UUID only.
 *
 * `phone_masked` is optional and only populated when the profile
 * endpoint (/auth/me) is called. It shows "+91****5592" style
 * masking for the user's own profile page — never the real number.
 */
export interface AuthUser {
  id: string;
  name: string | null;
  role: string;
  created_at: string;
  phone_masked?: string;
}

interface AuthState {
  /** The currently authenticated user, or null. */
  user: AuthUser | null;
  /** Derived flag — true when user is populated. */
  isAuthenticated: boolean;
  /** True once the initial /api/auth/me check has resolved. */
  isHydrated: boolean;
}

interface AuthActions {
  /** Populate user after login or /api/auth/me check. */
  setUser: (user: AuthUser) => void;
  /** Clear user on logout or when /api/auth/me returns 401. */
  clearUser: () => void;
  /** Mark hydration complete (called by guards after /api/auth/me). */
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

/* ── Store (pure in-memory — no persist) ─────────────────────────── */

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isHydrated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isHydrated: true,
    }),

  setHydrated: () => set({ isHydrated: true }),
}));
