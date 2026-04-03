"""
Authentication routes for ArogyaVault sign-in flow.

Endpoints:
  POST /auth/check-registration  — Is this phone registered?
  POST /auth/send-otp            — Send OTP (hardcoded 121212 for dev)
  POST /auth/verify-otp          — Verify OTP → JWT + user + httpOnly cookie
  POST /auth/resend-otp          — Resend OTP (hardcoded 123123 for dev)
  POST /auth/send-invite         — Invite an unregistered number
  POST /auth/refresh             — Refresh access token (rotate refresh token)
  POST /auth/logout              — Revoke refresh token + clear cookie
"""

import re
import uuid
from datetime import datetime, timezone, timedelta

import jwt
from fastapi import APIRouter, HTTPException, Response, Request, Depends

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
    REFRESH_TOKEN_STORE,
    RESEND_OTP_CODE,
    SEND_OTP_CODE,
    USERS_BY_ID,
)
from app.core.config import get_settings

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


def _create_access_token(user_id: str, phone: str) -> tuple[str, int]:
    """Create a signed JWT access token. Returns (token, expires_in_seconds)."""
    settings = get_settings()
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": user_id,
        "phone": phone,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": uuid.uuid4().hex,
    }

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, int(expires_delta.total_seconds())


def _create_refresh_token(user_id: str, phone: str) -> tuple[str, int]:
    """Create a signed JWT refresh token + store it. Returns (token, expires_in_seconds)."""
    settings = get_settings()
    expires_delta = timedelta(days=settings.refresh_token_expire_days)
    expire = datetime.now(timezone.utc) + expires_delta
    jti = uuid.uuid4().hex

    payload = {
        "sub": user_id,
        "phone": phone,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": jti,
    }

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    # Store refresh token for revocation tracking
    REFRESH_TOKEN_STORE[jti] = {
        "user_id": user_id,
        "phone": phone,
        "expires_at": expire.isoformat(),
        "revoked": False,
    }

    return token, int(expires_delta.total_seconds())


def _decode_token(token: str, expected_type: str = "access") -> dict:
    """Decode and validate a JWT token. Raises HTTPException on failure."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=401,
            detail=f"Expected {expected_type} token, got {payload.get('type')}.",
        )

    return payload


def _get_current_user(request: Request) -> dict:
    """Extract and verify the current user from the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = auth_header[7:]  # strip "Bearer "
    payload = _decode_token(token, expected_type="access")

    user = USERS_BY_ID.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    return user


def _set_auth_cookie(response: Response, token: str, max_age: int) -> None:
    """Set the httpOnly auth cookie on the response."""
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production (HTTPS)
        path="/",
        max_age=max_age,
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
    _validate_phone(body.phone)
    registered = body.phone in REGISTERED_USERS
    return CheckRegistrationResponse(registered=registered, phone=body.phone)


# ── 2. Send OTP ─────────────────────────────────────────────────────────────


@router.post(
    "/send-otp",
    summary="Send OTP to a registered phone number",
    response_model=SendOtpResponse,
    responses={404: {"model": ErrorResponse}},
)
async def send_otp(body: SendOtpRequest):
    _validate_phone(body.phone)

    if body.phone not in REGISTERED_USERS:
        raise HTTPException(
            status_code=404,
            detail="Phone number is not registered. Please register first.",
        )

    OTP_STORE[body.phone] = {
        "code": SEND_OTP_CODE,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "attempts": 0,
    }

    return SendOtpResponse(message="OTP sent successfully", phone=body.phone, expires_in=300)


# ── 3. Verify OTP ───────────────────────────────────────────────────────────


@router.post(
    "/verify-otp",
    summary="Verify OTP and return JWT tokens",
    response_model=VerifyOtpResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def verify_otp(body: VerifyOtpRequest, response: Response):
    _validate_phone(body.phone)

    otp_entry = OTP_STORE.get(body.phone)
    if not otp_entry:
        raise HTTPException(
            status_code=404,
            detail="No OTP found for this number. Please request a new OTP.",
        )

    if otp_entry["attempts"] >= 5:
        del OTP_STORE[body.phone]
        raise HTTPException(
            status_code=400,
            detail="Too many failed attempts. Please request a new OTP.",
        )

    otp_entry["attempts"] += 1

    if body.code != otp_entry["code"]:
        remaining = 5 - otp_entry["attempts"]
        raise HTTPException(
            status_code=400,
            detail=f"Invalid OTP. {remaining} attempt(s) remaining.",
        )

    del OTP_STORE[body.phone]

    user_data = REGISTERED_USERS.get(body.phone)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found.")

    user = UserOut(**user_data)

    # Generate real JWT tokens
    access_token, access_expires = _create_access_token(user.id, user.phone)
    refresh_token, _ = _create_refresh_token(user.id, user.phone)

    tokens = AuthTokens(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=access_expires,
    )

    # Set httpOnly cookie with access token (same expiry as token)
    _set_auth_cookie(response, access_token, max_age=access_expires)

    return VerifyOtpResponse(message="OTP verified successfully", user=user, tokens=tokens)


# ── 4. Resend OTP ───────────────────────────────────────────────────────────


@router.post(
    "/resend-otp",
    summary="Resend OTP with a new code",
    response_model=ResendOtpResponse,
    responses={404: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
async def resend_otp(body: ResendOtpRequest):
    _validate_phone(body.phone)

    if body.phone not in REGISTERED_USERS:
        raise HTTPException(status_code=404, detail="Phone number is not registered.")

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

    OTP_STORE[body.phone] = {
        "code": RESEND_OTP_CODE,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "attempts": 0,
    }

    return ResendOtpResponse(message="OTP resent successfully", phone=body.phone, expires_in=300)


# ── 5. Send Invite ──────────────────────────────────────────────────────────


@router.post(
    "/send-invite",
    summary="Invite an unregistered user to ArogyaVault",
    response_model=SendInviteResponse,
    responses={409: {"model": ErrorResponse}},
)
async def send_invite(body: SendInviteRequest):
    _validate_phone(body.phone)

    if body.phone in REGISTERED_USERS:
        raise HTTPException(
            status_code=409,
            detail="This phone number is already registered on ArogyaVault.",
        )

    INVITE_STORE[body.phone] = {
        "invited_by": body.invited_by,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    return SendInviteResponse(message="Invite sent successfully", phone=body.phone)


# ── 6. Refresh Token ────────────────────────────────────────────────────────


@router.post(
    "/refresh",
    summary="Refresh access token using refresh token",
    response_model=RefreshResponse,
    responses={401: {"model": ErrorResponse}},
)
async def refresh_token(body: RefreshRequest, response: Response):
    """
    Validates the refresh token, revokes the old one,
    issues a new access token + new refresh token (rotation).
    """
    # Decode the refresh token
    payload = _decode_token(body.refresh_token, expected_type="refresh")

    jti = payload.get("jti")
    if not jti:
        raise HTTPException(status_code=401, detail="Invalid refresh token (no jti).")

    # Check if token is in our store and not revoked
    stored = REFRESH_TOKEN_STORE.get(jti)
    if not stored:
        raise HTTPException(status_code=401, detail="Refresh token not recognised.")
    if stored["revoked"]:
        # Possible token reuse attack — revoke all tokens for this user
        for entry in REFRESH_TOKEN_STORE.values():
            if entry["user_id"] == stored["user_id"]:
                entry["revoked"] = True
        raise HTTPException(
            status_code=401,
            detail="Refresh token has been revoked. Please sign in again.",
        )

    # Revoke the old refresh token (one-time use)
    stored["revoked"] = True

    user_id = payload["sub"]
    phone = payload["phone"]

    # Issue new tokens
    new_access_token, access_expires = _create_access_token(user_id, phone)
    new_refresh_token, _ = _create_refresh_token(user_id, phone)

    # Update cookie with new access token
    _set_auth_cookie(response, new_access_token, max_age=access_expires)

    return RefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=access_expires,
    )


# ── 7. Logout ────────────────────────────────────────────────────────────────


@router.post(
    "/logout",
    summary="Sign out — revoke refresh token and clear cookie",
)
async def logout(request: Request, response: Response):
    """
    Revokes the refresh token (if provided in body) and clears the httpOnly cookie.
    """
    _clear_auth_cookie(response)

    # Try to revoke refresh token from body
    try:
        body = await request.json()
        refresh_token = body.get("refresh_token", "")
        if refresh_token:
            try:
                payload = _decode_token(refresh_token, expected_type="refresh")
                jti = payload.get("jti")
                if jti and jti in REFRESH_TOKEN_STORE:
                    REFRESH_TOKEN_STORE[jti]["revoked"] = True
            except HTTPException:
                pass  # Token already expired or invalid — that's fine
    except Exception:
        pass  # No body or invalid JSON — just clear the cookie

    return {"message": "Logged out successfully"}
