/**
 * Authentication types and constants.
 *
 * @packageDocumentation
 * @category Constants
 *
 * @remarks
 * Shared across the sign-in page, containers, and any future
 * auth flows (sign-up, forgot-password, etc.).
 */

/* ── Sign-in step ─────────────────────────────────────────────────── */

/**
 * Step identifier for the two-step sign-in flow.
 *
 * @category Constants
 */
export const SignInStep = {
  PHONE: "phone",
  OTP: "otp",
} as const;

/**
 * Union type of all sign-in steps.
 *
 * @category Types
 */
export type SignInStep = (typeof SignInStep)[keyof typeof SignInStep];
