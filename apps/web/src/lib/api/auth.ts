/**
 * Auth API
 * --------
 * Typed wrappers for all /auth endpoints.
 *
 * NOTE: Login (verify-otp) and refresh are called DIRECTLY to the backend
 * (not through the proxy) because:
 *   - verify-otp: user has no token yet — the backend returns Set-Cookie
 *   - refresh: handled automatically by the proxy on 401
 *
 * All other authenticated endpoints go through apiClient (proxy).
 */

/* ── Backend URL (direct calls, not proxied) ─────────────────────── */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

export interface VerifyOtpResponse {
  message: string;
  user: UserOut;
  // NOTE: tokens are no longer in the JSON body — they arrive as httpOnly cookies
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

/* ── API functions ────────────────────────────────────────────────── */

/**
 * Direct fetch to backend (not through proxy).
 * Used for unauthenticated endpoints like OTP flow.
 * credentials: "include" ensures the browser accepts Set-Cookie from backend.
 */
const directFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
    credentials: "include", // accept httpOnly cookies from backend
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      status: res.status,
      detail: body.detail ?? body.message ?? "Something went wrong",
    };
  }

  return res.json() as Promise<T>;
};

export const authApi = {
  /** Check if a phone number is registered (unauthenticated). */
  checkRegistration: (data: CheckRegistrationRequest) =>
    directFetch<CheckRegistrationResponse>("/auth/check-registration", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Send OTP to a registered phone (unauthenticated). */
  sendOtp: (data: SendOtpRequest) =>
    directFetch<SendOtpResponse>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Verify OTP → backend sets httpOnly cookies (access_token, refresh_token)
   * and returns user profile in JSON body.
   */
  verifyOtp: (data: VerifyOtpRequest) =>
    directFetch<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Resend OTP code (unauthenticated). */
  resendOtp: (data: ResendOtpRequest) =>
    directFetch<ResendOtpResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Invite an unregistered phone number (uses proxy — authenticated). */
  sendInvite: (data: SendInviteRequest) =>
    directFetch<SendInviteResponse>("/auth/send-invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
