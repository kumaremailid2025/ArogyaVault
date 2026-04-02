/**
 * Auth API
 * --------
 * Typed wrappers for all /auth endpoints.
 * Mirrors the Pydantic schemas from apps/backend/app/api/schemas/auth.py.
 */

import { apiClient } from "./client";

/* ── Request types ────────────────────────────────────────────────── */

export interface CheckRegistrationRequest {
  phone: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  invite_token?: string;
  clinic_ref?: string;
}

export interface ResendOtpRequest {
  phone: string;
}

export interface SendInviteRequest {
  phone: string;
  invited_by?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

/* ── Response types ───────────────────────────────────────────────── */

export interface CheckRegistrationResponse {
  registered: boolean;
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  phone: string;
  expires_in: number;
}

export interface UserOut {
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

export interface VerifyOtpResponse {
  message: string;
  user: UserOut;
  tokens: AuthTokens;
}

export interface ResendOtpResponse {
  message: string;
  phone: string;
  expires_in: number;
}

export interface SendInviteResponse {
  message: string;
  phone: string;
}

export interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

/* ── API functions ────────────────────────────────────────────────── */

export const authApi = {
  checkRegistration: (data: CheckRegistrationRequest) =>
    apiClient<CheckRegistrationResponse>("/auth/check-registration", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendOtp: (data: SendOtpRequest) =>
    apiClient<SendOtpResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyOtp: (data: VerifyOtpRequest) =>
    apiClient<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resendOtp: (data: ResendOtpRequest) =>
    apiClient<ResendOtpResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendInvite: (data: SendInviteRequest) =>
    apiClient<SendInviteResponse>("/auth/send-invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  refreshToken: (data: RefreshRequest) =>
    apiClient<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiClient<{ message: string }>("/auth/logout", {
      method: "POST",
    }),
};
