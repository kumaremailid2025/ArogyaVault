/**
 * Auth-related enums and types.
 *
 * Shared across the sign-in page, containers, and any future
 * auth flows (sign-up, forgot-password, etc.).
 */

/* ── Sign-in step ─────────────────────────────────────────────────── */

export const SignInStep = {
  PHONE: "phone",
  OTP: "otp",
} as const;

export type SignInStep = (typeof SignInStep)[keyof typeof SignInStep];
