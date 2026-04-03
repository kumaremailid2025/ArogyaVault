/**
 * Auth Hooks (TanStack React Query)
 * ----------------------------------
 * Custom hooks wrapping all /auth API calls.
 *
 * Queries:
 *   useCheckRegistration  — debounced phone registration check
 *
 * Mutations:
 *   useSendOtp            — send OTP to registered number
 *   useVerifyOtp          — verify OTP → JWT + user
 *   useResendOtp          — resend with a new OTP code
 *   useSendInvite         — invite unregistered number
 *   useRefreshToken       — refresh access token
 *   useLogout             — sign out + clear cookie
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, type ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores";
import { authKeys } from "./query-keys";

/* ── Query: Check Registration ───────────────────────────────────── */

export const useCheckRegistration = (phone: string, enabled: boolean) =>
  useQuery({
    queryKey: authKeys.checkRegistration(phone),
    queryFn: () => authApi.checkRegistration({ phone }),
    enabled,
    staleTime: 30 * 1000, // 30s — number doesn't change often
    retry: false,
  });

/* ── Mutation: Send OTP ──────────────────────────────────────────── */

export const useSendOtp = () =>
  useMutation({
    mutationFn: authApi.sendOtp,
  });

/* ── Mutation: Verify OTP ────────────────────────────────────────── */

export const useVerifyOtp = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
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

/* ── Mutation: Refresh Token ─────────────────────────────────────── */

export const useRefreshToken = () => {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      setAccessToken(data.access_token, data.expires_in);
    },
  });
};

/* ── Mutation: Logout ────────────────────────────────────────────── */

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Clear auth state regardless of API success/failure
      logout();
      // Clear all cached queries
      queryClient.clear();
      router.push("/sign-in");
    },
  });
};
