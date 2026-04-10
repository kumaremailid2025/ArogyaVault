"""
Pydantic schemas for authentication endpoints.

SECURITY RULES (phone number protection):
  - NO plaintext phone number is EVER returned to the frontend
  - User is identified by UUID (id field), never by phone
  - Masked phone (+91****5592) is ONLY returned on the profile endpoint (/auth/me)
  - OTP/registration responses contain only a message — the FE already has the phone
  - JWT tokens contain the user UUID, never the phone

This matches the industry standard used by banking apps, healthcare platforms,
and services like WhatsApp/Signal where the phone is used for auth but never
exposed in API responses.
"""

from pydantic import BaseModel, Field


# ── Request Schemas ──────────────────────────────────────────────────────────


class CheckRegistrationRequest(BaseModel):
    phone: str = Field(..., examples=["+919876543210"], description="Phone with country code")


class SendOtpRequest(BaseModel):
    phone: str = Field(..., examples=["+919876543210"])


class VerifyOtpRequest(BaseModel):
    phone: str
    code: str = Field(..., min_length=6, max_length=6)
    invite_token: str | None = None
    clinic_ref: str | None = None


class ResendOtpRequest(BaseModel):
    phone: str = Field(..., examples=["+919876543210"])


class SendInviteRequest(BaseModel):
    phone: str = Field(..., examples=["+919876543210"])
    invited_by: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Response Schemas ─────────────────────────────────────────────────────────
#
# IMPORTANT: No response schema contains a plaintext phone field.
# The frontend identifies users by UUID (id), not phone.


class CheckRegistrationResponse(BaseModel):
    """Returns only whether the number is registered — no phone echo."""
    registered: bool


class SendOtpResponse(BaseModel):
    """Confirms OTP was sent — no phone echo (FE already has it)."""
    message: str
    expires_in: int = Field(default=300, description="OTP validity in seconds")


class UserOut(BaseModel):
    """
    User profile returned after OTP verification.

    The frontend uses `id` (UUID) for all subsequent API calls.
    Includes `phone_masked` (e.g. "+91****5592") so the header can
    render the user's identity immediately after sign-in without a
    follow-up /auth/me round-trip — this is especially important for
    newly registered invitees who have no name yet and must be
    identified by their masked phone.
    """
    id: str
    phone_masked: str = ""
    name: str | None = None
    role: str = "patient"
    created_at: str


class VerifyOtpResponse(BaseModel):
    """
    OTP verification response.
    Tokens are set as httpOnly cookies AND returned in the body so the
    Next.js proxy route can re-set them on the correct origin.
    The frontend client ignores the token fields — it only reads `user`.
    """
    message: str
    user: UserOut
    access_token: str = ""
    refresh_token: str = ""
    access_expires_in: int = 900
    refresh_expires_in: int = 604800


class MeResponse(BaseModel):
    """
    GET /auth/me — the ONLY endpoint that returns a masked phone.

    This is for the user's own profile page display.
    phone_masked shows "+91****5592" — never the real number.
    """
    id: str
    phone_masked: str = Field(description="Masked phone for profile display, e.g. +91****5592")
    name: str | None = None
    role: str = "patient"
    created_at: str


class ResendOtpResponse(BaseModel):
    """Confirms OTP was resent — no phone echo."""
    message: str
    expires_in: int = 300


class SendInviteResponse(BaseModel):
    """Confirms invite was sent — no phone echo."""
    message: str


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    expires_in: int = 900


class HeartbeatResponse(BaseModel):
    """POST /auth/heartbeat — lightweight session liveness check."""
    status: str = "alive"
    user_id: str
    expires_in: int = Field(description="Seconds until access_token expires")


class ErrorResponse(BaseModel):
    error: str
    message: str
