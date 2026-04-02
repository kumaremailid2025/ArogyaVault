"""
Authentication routes for ArogyaVault sign-in flow.

Endpoints:
  POST /auth/check-registration  — Is this phone registered?
  POST /auth/send-otp            — Send OTP (hardcoded 121212 for dev)
  POST /auth/verify-otp          — Verify OTP → JWT + user + httpOnly cookie
  POST /auth/resend-otp          — Resend OTP (hardcoded 123123 for dev)
  POST /auth/send-invite         — Invite an unregistered number
  POST /auth/refresh             — Refresh access token + httpOnly cookie
  POST /auth/logout              — Clear the auth cookie
"""

import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response

from app.api.schemas.auth import (
    AuthTokens,
    CheckRegistrationRequest,
    CheckRegistrationResponse,
    ErrorResponse,
    RefreshRequest,
    RefreshResponse,
    ResendOtpRequest,
    ResendOtpResponse,
    SendInviteRequest,
    SendInviteResponse,
    SendOtpRequest,
    SendOtpResponse,
    UserOut,
    VerifyOtpRequest,
    VerifyOtpResponse,
)
from app.api.store import (
    INVITE_STORE,
    OTP_STORE,
    REGISTERED_USERS,
    RESEND_OTP_CODE,
    SEND_OTP_CODE,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Constants ────────────────────────────────────────────────────────────────

AUTH_COOKIE_NAME = "arogyavault-auth-token"
PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")

# ── Helpers ──────────────────────────────────────────────────────────────────


def _validate_phone(phone: str) -> None:
    """Raise 422 if phone format is invalid."""
    if not PHONE_REGEX.match(phone):
        raise HTTPException(
            status_code=422,
            detail="Invalid phone number. Expected format: +91XXXXXXXXXX",
        )


def _generate_mock_token() -> str:
    """Generate a mock JWT-like token for dev."""
    return f"mock_token_{uuid.uuid4().hex[:24]}"


def _set_auth_cookie(response: Response, token: str) -> None:
    """Set the httpOnly auth cookie on the response."""
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production (HTTPS)
        path="/",
        max_age=3600,  # 1 hour — matches access token expiry
    )


def _clear_auth_cookie(response: Response) -> None:
    """Remove the auth cookie from the response."""
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )


# ── 1. Check Registration ───────────────────────────────────────────────────


@router.post(
    "/check-registration",
    summary="Check if a phone number is registered",
    response_model=CheckRegistrationResponse,
)
async def check_registration(body: CheckRegistrationRequest):
    """
    Called by MobileNumberContainer's debounced check as the user
    types a valid phone number. Returns whether the phone is registered.
    """
    _validate_phone(body.phone)

    registered = body.phone in REGISTERED_USERS

    return CheckRegistrationResponse(
        registered=registered,
        phone=body.phone,
    )


# ── 2. Send OTP ─────────────────────────────────────────────────────────────


@router.post(
    "/send-otp",
    summary="Send OTP to a registered phone number",
    response_model=SendOtpResponse,
    responses={404: {"model": ErrorResponse}},
)
async def send_otp(body: SendOtpRequest):
    """
    Sends a 6-digit OTP. Currently hardcoded to 121212.
    Once Twilio is integrated, this will generate a random OTP.
    """
    _validate_phone(body.phone)

    if body.phone not in REGISTERED_USERS:
        raise HTTPException(
            status_code=404,
            detail="Phone number is not registered. Please register first.",
        )

    # Store OTP (overwrite any existing)
    OTP_STORE[body.phone] = {
        "code": SEND_OTP_CODE,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "attempts": 0,
    }

    return SendOtpResponse(
        message="OTP sent successfully",
        phone=body.phone,
        expires_in=300,
    )


# ── 3. Verify OTP ───────────────────────────────────────────────────────────


@router.post(
    "/verify-otp",
    summary="Verify OTP and return JWT tokens",
    response_model=VerifyOtpResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def verify_otp(body: VerifyOtpRequest, response: Response):
    """
    Verifies the OTP. On success, returns JWT tokens and user profile.
    Also sets an httpOnly cookie with the access token for middleware auth.
    Max 5 attempts allowed per OTP.
    """
    _validate_phone(body.phone)

    otp_entry = OTP_STORE.get(body.phone)
    if not otp_entry:
        raise HTTPException(
            status_code=404,
            detail="No OTP found for this number. Please request a new OTP.",
        )

    # Check max attempts
    if otp_entry["attempts"] >= 5:
        del OTP_STORE[body.phone]
        raise HTTPException(
            status_code=400,
            detail="Too many failed attempts. Please request a new OTP.",
        )

    # Increment attempt count
    otp_entry["attempts"] += 1

    # Verify code
    if body.code != otp_entry["code"]:
        remaining = 5 - otp_entry["attempts"]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid OTP. {remaining} attempt(s) remaining.",
        )

    # OTP valid — clean up
    del OTP_STORE[body.phone]

    # Get user
    user_data = REGISTERED_USERS.get(body.phone)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found.")

    user = UserOut(**user_data)

    access_token = _generate_mock_token()
    tokens = AuthTokens(
        access_token=access_token,
        refresh_token=_generate_mock_token(),
        expires_in=3600,
    )

    # Set httpOnly cookie for Next.js middleware route protection
    _set_auth_cookie(response, access_token)

    return VerifyOtpResponse(
        message="OTP verified successfully",
        user=user,
        tokens=tokens,
    )


# ── 4. Resend OTP ───────────────────────────────────────────────────────────


@router.post(
    "/resend-otp",
    summary="Resend OTP with a new code",
    response_model=ResendOtpResponse,
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
async def resend_otp(body: ResendOtpRequest):
    """
    Resends OTP with a different code (123123 for dev).
    Enforces a 30-second cooldown between resend requests.
    """
    _validate_phone(body.phone)

    if body.phone not in REGISTERED_USERS:
        raise HTTPException(
            status_code=404,
            detail="Phone number is not registered.",
        )

    # Check cooldown (30 seconds)
    existing = OTP_STORE.get(body.phone)
    if existing:
        created = datetime.fromisoformat(existing["created_at"])
        elapsed = (datetime.now(timezone.utc) - created).total_seconds()
        if elapsed < 30:
            remaining = int(30 - elapsed)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting a new OTP.",
            )

    # Store new OTP
    OTP_STORE[body.phone] = {
        "code": RESEND_OTP_CODE,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "attempts": 0,
    }

    return ResendOtpResponse(
        message="OTP resent successfully",
        phone=body.phone,
        expires_in=300,
    )


# ── 5. Send Invite ──────────────────────────────────────────────────────────


@router.post(
    "/send-invite",
    summary="Invite an unregistered user to ArogyaVault",
    response_model=SendInviteResponse,
    responses={409: {"model": ErrorResponse}},
)
async def send_invite(body: SendInviteRequest):
    """
    Sends an invite SMS to an unregistered phone number.
    Currently a stub — will integrate with Twilio/SNS later.
    """
    _validate_phone(body.phone)

    if body.phone in REGISTERED_USERS:
        raise HTTPException(
            status_code=409,
            detail="This phone number is already registered on ArogyaVault.",
        )

    # Store invite
    INVITE_STORE[body.phone] = {
        "invited_by": body.invited_by,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    return SendInviteResponse(
        message="Invite sent successfully",
        phone=body.phone,
    )


# ── 6. Refresh Token ────────────────────────────────────────────────────────


@router.post(
    "/refresh",
    summary="Refresh access token",
    response_model=RefreshResponse,
    responses={401: {"model": ErrorResponse}},
)
async def refresh_token(body: RefreshRequest, response: Response):
    """
    Accepts a refresh token, returns a new access token.
    Also updates the httpOnly cookie with the new access token.
    Currently accepts any non-empty token for dev.
    """
    if not body.refresh_token or not body.refresh_token.startswith("mock_token_"):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token.",
        )

    new_access_token = _generate_mock_token()

    # Update the httpOnly cookie
    _set_auth_cookie(response, new_access_token)

    return RefreshResponse(
        access_token=new_access_token,
        expires_in=3600,
    )


# ── 7. Logout ────────────────────────────────────────────────────────────────


@router.post(
    "/logout",
    summary="Sign out and clear auth cookie",
)
async def logout(response: Response):
    """
    Clears the httpOnly auth cookie.
    Frontend should also clear zustand store.
    """
    _clear_auth_cookie(response)

    return {"message": "Logged out successfully"}
