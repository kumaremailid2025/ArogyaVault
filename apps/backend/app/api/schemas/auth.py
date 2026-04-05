"""
Pydantic schemas for authentication endpoints.
Mirrors shared-types/src/index.ts Auth & User types.

NOTE: Tokens are no longer returned in JSON responses.
They are set as httpOnly cookies by the backend.
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


class CheckRegistrationResponse(BaseModel):
    registered: bool
    phone: str


class SendOtpResponse(BaseModel):
    message: str
    phone: str
    expires_in: int = Field(default=300, description="OTP validity in seconds")


class UserOut(BaseModel):
    id: str
    phone: str
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
    """GET /auth/me — returns the authenticated user's profile."""
    id: str
    phone: str
    name: str | None = None
    role: str = "patient"
    created_at: str


class ResendOtpResponse(BaseModel):
    message: str
    phone: str
    expires_in: int = 300


class SendInviteResponse(BaseModel):
    message: str
    phone: str


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
