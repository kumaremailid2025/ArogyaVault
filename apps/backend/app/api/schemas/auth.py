"""
Pydantic schemas for authentication endpoints.
Mirrors shared-types/src/index.ts Auth & User types.
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


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int = Field(default=900, description="Access token expiry in seconds (15 min)")


class VerifyOtpResponse(BaseModel):
    message: str
    user: UserOut
    tokens: AuthTokens


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


class ErrorResponse(BaseModel):
    error: str
    message: str
