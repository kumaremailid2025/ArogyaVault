from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request models (Sprint 1 will expand these) ───────────────────────────────

class SendOtpRequest(BaseModel):
    phone: str  # e.g. "+919876543210"


class VerifyOtpRequest(BaseModel):
    phone: str
    code: str
    invite_token: str | None = None
    clinic_ref: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/send-otp", summary="Send OTP via AWS SNS")
async def send_otp(body: SendOtpRequest):
    """
    Triggers AWS Cognito → SNS sends a 6-digit OTP SMS.
    Sprint 1: Full Cognito integration.
    """
    return {"message": f"OTP would be sent to {body.phone}", "sprint": "implement in Sprint 1"}


@router.post("/verify-otp", summary="Verify OTP and return JWT")
async def verify_otp(body: VerifyOtpRequest):
    """
    Verifies OTP with Cognito. Creates user row if new. Returns JWT.
    Sprint 1: Full Cognito + DB integration.
    """
    return {"message": "OTP verify endpoint", "sprint": "implement in Sprint 1"}


@router.post("/refresh", summary="Silent token refresh")
async def refresh_token(body: RefreshRequest):
    """
    Accepts a Cognito refresh token. Returns a new access token.
    Sprint 1: Full implementation.
    """
    return {"message": "Token refresh endpoint", "sprint": "implement in Sprint 1"}
