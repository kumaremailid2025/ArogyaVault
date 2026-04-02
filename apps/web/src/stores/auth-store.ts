/**
 * Auth Store (Zustand)
 * --------------------
 * Stores the authenticated user's JWT tokens and profile.
 * Persisted to sessionStorage so state survives page refreshes
 * but clears when the browser tab is closed.
 *
 * The backend also sets an httpOnly cookie with the access token
 * (for Next.js middleware route protection). This store manages
 * the client-side state; the cookie is managed by the backend.
 *
 * Usage:
 *   const user = useAuthStore((s) => s.user);
 *   const { setAuth, logout } = useAuthStore();
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ── Types ────────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthState {
  /** The currently authenticated user, or null if logged out. */
  user: AuthUser | null;
  /** JWT access + refresh tokens. */
  tokens: AuthTokens | null;
  /** Whether the user is authenticated. */
  isAuthenticated: boolean;
}

interface AuthActions {
  /** Store user and tokens after successful OTP verification. */
  setAuth: (user: AuthUser, tokens: AuthTokens) => void;
  /** Update only the access token (after a refresh). */
  setAccessToken: (accessToken: string, expiresIn: number) => void;
  /** Clear all auth state and call backend to clear httpOnly cookie. */
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

/* ── Initial state ────────────────────────────────────────────────── */

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
};

/* ── Store ────────────────────────────────────────────────────────── */

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
        }),

      setAccessToken: (accessToken, expiresIn) =>
        set((state) => ({
          tokens: state.tokens
            ? { ...state.tokens, access_token: accessToken, expires_in: expiresIn }
            : null,
        })),

      logout: () => {
        // Clear client-side state immediately
        set(initialState);

        // Call backend to clear the httpOnly cookie (fire-and-forget)
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        fetch(`${apiBaseUrl}/auth/logout`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {
          // Ignore errors — client state is already cleared
        });
      },
    }),
    {
      name: "arogyavault-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
