/**
 * Auth Hooks (TanStack React Query)
 * ----------------------------------
 * Custom hooks wrapping all /auth API calls.
 *
 * KEY DESIGN:
 *   - Login (verifyOtp) stores ONLY user profile in Zustand
 *   - Tokens arrive as httpOnly cookies — never touched by JS
 *   - Logout calls /api/auth/logout (Next.js route) which clears cookies
 *   - No useRefreshToken — refresh is handled by the API proxy
 *
 * Queries:
 *   useCheckRegistration  — debounced phone registration check
 *
 * Mutations:
 *   useSendOtp            — send OTP to registered number
 *   useVerifyOtp          — verify OTP → user profile (cookies set by backend)
 *   useResendOtp          — resend with a new OTP code
 *   useSendInvite         — invite unregistered number
 *   useLogout             — sign out + clear cookies + clear store
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores";
import { authKeys } from "./query-keys";

/* ── Query: Check Registration ───────────────────────────────────── */

export const useCheckRegistration = (phone: string, enabled: boolean) =>
  useQuery({
    queryKey: authKeys.checkRegistration(phone),
    queryFn: () => authApi.checkRegistration({ phone }),
    enabled,
    staleTime: 30 * 1000,
    retry: false,
  });

/* ── Mutation: Send OTP ──────────────────────────────────────────── */

export const useSendOtp = () =>
  useMutation({
    mutationFn: authApi.sendOtp,
  });

/* ── Mutation: Verify OTP ────────────────────────────────────────── */

export const useVerifyOtp = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      // Store only user profile — tokens arrived as httpOnly cookies
      setUser(data.user);
      router.push("/community");
    },
  });
};

/* ── Mutation: Resend OTP ────────────────────────────────────────── */

export const useResendOtp = () =>
  useMutation({
    mutationFn: authApi.resendOtp,
  });

/* ── Mutation: Send Invite ───────────────────────────────────────── */

export const useSendInvite = () =>
  useMutation({
    mutationFn: authApi.sendInvite,
  });

/* ── Mutation: Logout ────────────────────────────────────────────── */

export const useLogout = () => {
  const clearUser = useAuthStore((s) => s.clearUser);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Call the Next.js API route which clears httpOnly cookies
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      return res.json();
    },
    onSettled: () => {
      // Clear client-side state regardless of API success/failure
      clearUser();
      // Clear all cached queries
      queryClient.clear();
      router.push("/sign-in");
    },
  });
};
