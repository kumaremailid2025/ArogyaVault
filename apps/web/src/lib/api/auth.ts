/**
 * Auth API
 * --------
 * Typed wrappers for all /auth endpoints.
 *
 * Cookie-setting endpoints (verify-otp) are routed through Next.js API
 * routes (/api/auth/*) so cookies are set on the correct origin.
 *
 * Non-cookie endpoints (check-registration, send-otp, resend-otp) call
 * the backend directly since they don't need cookies.
 *
 * Authenticated endpoints go through apiClient (proxy at /api/proxy/*).
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
}

export interface SendOtpResponse {
  message: string;
  expires_in: number;
}

/**
 * User profile returned after OTP verification.
 * Uses UUID `id` for identification — no plaintext phone field.
 * Includes `phone_masked` (e.g. "+91****5592") so the header can show
 * the user's identity immediately after sign-in without an extra
 * /auth/me round-trip. This is critical for newly registered invitees
 * who have no name yet and must be shown by their masked phone.
 */
export interface UserOut {
  id: string;
  phone_masked: string;
  name: string | null;
  role: string;
  created_at: string;
}

export interface VerifyOtpResponse {
  message: string;
  user: UserOut;
  // Tokens are in the body for the proxy route to re-set as cookies.
  // The client never reads these — it only uses `user`.
}

export interface ResendOtpResponse {
  message: string;
  expires_in: number;
}

export interface SendInviteResponse {
  message: string;
}

/**
 * GET /auth/me — the ONLY response that includes a masked phone.
 * Used for the user's own profile page display.
 */
export interface MeResponse {
  id: string;
  phone_masked: string;
  name: string | null;
  role: string;
  created_at: string;
}

/* ── API functions ────────────────────────────────────────────────── */

/**
 * Direct fetch to backend (not through proxy).
 * Used for unauthenticated endpoints that DON'T set cookies.
 */
const directFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Platform": "web",
      ...(options.headers as Record<string, string>),
    },
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

/**
 * Fetch through Next.js API route (same origin).
 * Used for endpoints that SET httpOnly cookies (verify-otp).
 * The Next.js route proxies to the backend and re-sets cookies on
 * the correct origin so the middleware and other routes can read them.
 */
const localFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const res = await fetch(`/api/auth${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Platform": "web",
      ...(options.headers as Record<string, string>),
    },
    credentials: "include", // accept httpOnly cookies on same origin
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
   * Verify OTP → Next.js API route proxies to backend, re-sets httpOnly
   * cookies on the correct origin, and returns user profile in JSON body.
   */
  verifyOtp: (data: VerifyOtpRequest) =>
    localFetch<VerifyOtpResponse>("/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Resend OTP code (unauthenticated). */
  resendOtp: (data: ResendOtpRequest) =>
    directFetch<ResendOtpResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * [DEPRECATED] Legacy invite endpoint.
   * New code should use inviteApi.sendInvite() from lib/api/invite.ts
   * which provides encrypted phone storage and full lifecycle management.
   */
  sendInvite: (data: SendInviteRequest) =>
    directFetch<SendInviteResponse>("/auth/send-invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
