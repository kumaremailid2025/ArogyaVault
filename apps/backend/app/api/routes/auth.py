"""
Authentication routes for ArogyaVault sign-in flow.

Endpoints:
  POST /auth/check-registration  — Is this phone registered?
  POST /auth/send-otp            — Send OTP (hardcoded 121212 for dev)
  POST /auth/verify-otp          — Verify OTP → set httpOnly cookies + return user
  POST /auth/resend-otp          — Resend OTP (hardcoded 123123 for dev)
  POST /auth/send-invite         — Invite an unregistered number
  POST /auth/refresh             — Refresh access token (reads refresh_token cookie)
  POST /auth/logout              — Revoke session in Redis + clear cookies
  GET  /auth/me                  — Return current user from Bearer token

Security:
  - access_token + refresh_token are httpOnly cookies (JS cannot read them)
  - JWT access_token includes user claims (sub, phone, name, role, created_at)
  - Refresh tokens tracked in Redis with TTL (auto-cleanup)
  - Token rotation on refresh (old token revoked, new one issued)
"""

import re
import uuid
from datetime import datetime, timezone, timedelta

import jwt
from fastapi import APIRouter, HTTPException, Response, Request

from app.api.schemas.auth import (
    CheckRegistrationRequest,
    CheckRegistrationResponse,
    ErrorResponse,
    HeartbeatResponse,
    MeResponse,
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
    USERS_BY_ID,
)
from app.core.config import get_settings
from app.core.redis import session_manager

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Constants ────────────────────────────────────────────────────────────────

PHONE_REGEX = re.compile(r"^\+91[6-9]\d{9}$")

# Cookie names — must match Next.js middleware + proxy expectations
ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"

# ── Helpers ──────────────────────────────────────────────────────────────────


def _validate_phone(phone: str) -> None:
    """Raise 422 if phone format is invalid."""
    if not PHONE_REGEX.match(phone):
        raise HTTPException(
            status_code=422,
            detail="Invalid phone number. Expected format: +91XXXXXXXXXX",
        )


def _create_access_token(user: dict) -> tuple[str, int]:
    """
    Create a signed JWT access token with user claims.
    Returns (token, expires_in_seconds).

    Claims included: sub, phone, name, role, created_at
    (so the frontend /api/auth/me can decode locally without a backend call)
    """
    settings = get_settings()
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": user["id"],
        "phone": user["phone"],
        "name": user.get("name"),
        "role": user.get("role", "patient"),
        "created_at": user.get("created_at", ""),
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": uuid.uuid4().hex,
    }

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, int(expires_delta.total_seconds())


def _create_refresh_token(user_id: str, phone: str) -> tuple[str, int, str]:
    """
    Create a signed JWT refresh token.
    Returns (token, expires_in_seconds, jti).
    The jti is used as the Redis session key.
    """
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
    return token, int(expires_delta.total_seconds()), jti


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


def _get_bearer_token(request: Request) -> str:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    return auth_header[7:]


def _set_auth_cookies(
    response: Response,
    access_token: str,
    access_max_age: int,
    refresh_token: str,
    refresh_max_age: int,
) -> None:
    """Set both httpOnly cookies on the response."""
    # Determine secure flag from environment
    is_production = False  # Set to True in production (HTTPS)

    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=is_production,
        path="/",
        max_age=access_max_age,
    )

    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE,
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=is_production,
        path="/",
        max_age=refresh_max_age,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Remove both auth cookies from the response."""
    is_production = False

    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE,
        httponly=True,
        samesite="lax",
        secure=is_production,
        path="/",
    )

    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE,
        httponly=True,
        samesite="lax",
        secure=is_production,
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
    summary="Verify OTP → set httpOnly cookies + return user profile",
    response_model=VerifyOtpResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
async def verify_otp(body: VerifyOtpRequest, response: Response):
    _validate_phone(body.phone)

    otp_entry = OTP_STORE.get(body.phone)

    if otp_entry:
        # ── Normal flow: OTP was sent and is in-memory ──
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
    else:
        # ── Dev fallback: OTP_STORE was cleared (e.g. server restart with --reload).
        #    Accept the hardcoded dev OTP codes so the sign-in flow isn't broken. ──
        if body.code not in (SEND_OTP_CODE, RESEND_OTP_CODE):
            raise HTTPException(
                status_code=400,
                detail="Invalid OTP. Please try again or request a new OTP.",
            )

    user_data = REGISTERED_USERS.get(body.phone)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found.")

    user = UserOut(**user_data)

    # ── Generate JWT tokens ────────────────────────────────────────────
    access_token, access_expires = _create_access_token(user_data)
    refresh_token, refresh_expires, jti = _create_refresh_token(user.id, user.phone)

    # ── Store refresh session in Redis ─────────────────────────────────
    await session_manager.store_session(
        jti=jti,
        user_id=user.id,
        phone=user.phone,
        ttl_seconds=refresh_expires,
    )

    # ── Set BOTH httpOnly cookies ──────────────────────────────────────
    _set_auth_cookies(
        response,
        access_token=access_token,
        access_max_age=access_expires,
        refresh_token=refresh_token,
        refresh_max_age=refresh_expires,
    )

    # ── Return user profile + tokens in body (for Next.js proxy to re-set cookies) ──
    return VerifyOtpResponse(
        message="OTP verified successfully",
        user=user,
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=access_expires,
        refresh_expires_in=refresh_expires,
    )


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
async def refresh_token(request: Request, response: Response):
    """
    Reads the refresh_token from:
      1. Request body (for proxy calls: { refresh_token: "..." })
      2. httpOnly cookie (fallback)

    Validates in Redis, revokes old token, issues new pair.
    """
    # Try body first (proxy sends it in JSON), then cookie
    refresh_token_value: str | None = None

    try:
        body = await request.json()
        refresh_token_value = body.get("refresh_token")
    except Exception:
        pass

    if not refresh_token_value:
        refresh_token_value = request.cookies.get(REFRESH_TOKEN_COOKIE)

    if not refresh_token_value:
        raise HTTPException(status_code=401, detail="No refresh token provided.")

    # Decode the refresh token
    payload = _decode_token(refresh_token_value, expected_type="refresh")

    jti = payload.get("jti")
    if not jti:
        raise HTTPException(status_code=401, detail="Invalid refresh token (no jti).")

    # ── Validate in Redis ──────────────────────────────────────────────
    is_valid = await session_manager.validate_session(jti)
    if not is_valid:
        # Possible token reuse — revoke ALL sessions for this user
        user_id = payload.get("sub")
        if user_id:
            await session_manager.revoke_all_user_sessions(user_id)
        raise HTTPException(
            status_code=401,
            detail="Refresh token has been revoked. Please sign in again.",
        )

    # ── Revoke old session (one-time use) ──────────────────────────────
    await session_manager.revoke_session(jti)

    user_id = payload["sub"]
    phone = payload["phone"]

    # Look up full user data for enriched JWT
    user_data = USERS_BY_ID.get(user_id)
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found.")

    # ── Issue new token pair ───────────────────────────────────────────
    new_access_token, access_expires = _create_access_token(user_data)
    new_refresh_token, refresh_expires, new_jti = _create_refresh_token(user_id, phone)

    # Store new session in Redis
    await session_manager.store_session(
        jti=new_jti,
        user_id=user_id,
        phone=phone,
        ttl_seconds=refresh_expires,
    )

    # ── Set new cookies ────────────────────────────────────────────────
    _set_auth_cookies(
        response,
        access_token=new_access_token,
        access_max_age=access_expires,
        refresh_token=new_refresh_token,
        refresh_max_age=refresh_expires,
    )

    return RefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=access_expires,
    )


# ── 7. Logout ────────────────────────────────────────────────────────────────


@router.post(
    "/logout",
    summary="Sign out — revoke Redis session and clear cookies",
)
async def logout(request: Request, response: Response):
    """
    Revokes the refresh token session in Redis and clears both httpOnly cookies.
    Accepts refresh_token from body or cookie.
    """
    # ── Clear cookies first (always, even if revocation fails) ─────────
    _clear_auth_cookies(response)

    # ── Try to revoke refresh token in Redis ───────────────────────────
    refresh_token_value: str | None = None

    try:
        body = await request.json()
        refresh_token_value = body.get("refresh_token", "")
    except Exception:
        pass

    if not refresh_token_value:
        refresh_token_value = request.cookies.get(REFRESH_TOKEN_COOKIE)

    if refresh_token_value:
        try:
            payload = _decode_token(refresh_token_value, expected_type="refresh")
            jti = payload.get("jti")
            if jti:
                await session_manager.revoke_session(jti)
        except HTTPException:
            pass  # Token already expired or invalid — just clear cookies

    return {"message": "Logged out successfully"}


# ── 8. Get Current User (GET /auth/me) ──────────────────────────────────────


@router.get(
    "/me",
    summary="Get current authenticated user profile",
    response_model=MeResponse,
    responses={401: {"model": ErrorResponse}},
)
async def get_me(request: Request):
    """
    Reads the access_token from the Authorization: Bearer header.
    Decodes the JWT and returns the user profile.

    Called by the Next.js /api/auth/me route which reads the httpOnly cookie
    and forwards it as a Bearer header.
    """
    token = _get_bearer_token(request)
    payload = _decode_token(token, expected_type="access")

    # Try to get fresh data from user store
    user = USERS_BY_ID.get(payload["sub"])
    if user:
        return MeResponse(
            id=user["id"],
            phone=user["phone"],
            name=user.get("name"),
            role=user.get("role", "patient"),
            created_at=user.get("created_at", ""),
        )

    # Fallback: use JWT claims (always available)
    return MeResponse(
        id=payload["sub"],
        phone=payload["phone"],
        name=payload.get("name"),
        role=payload.get("role", "patient"),
        created_at=payload.get("created_at", ""),
    )


# ── 9. Heartbeat ────────────────────────────────────────────────────────────


@router.post(
    "/heartbeat",
    summary="Lightweight session liveness check",
    response_model=HeartbeatResponse,
    responses={401: {"model": ErrorResponse}},
)
async def heartbeat(request: Request):
    """
    Lightweight endpoint called periodically by the frontend (every ~4 min).

    Purpose:
      - Validates the access_token is still valid (JWT signature + expiry)
      - Confirms the user's refresh session still exists in Redis
      - Returns time until access_token expires (so the frontend knows)

    If the access_token is expired, the proxy will auto-refresh before this
    reaches the backend, so a successful response means the session is healthy.

    Cost: ~1 JWT decode + 1 Redis EXISTS check. No DB queries.
    """
    token = _get_bearer_token(request)
    payload = _decode_token(token, expected_type="access")

    user_id = payload["sub"]

    # ── Check if user has at least one active session in Redis ─────────
    active_sessions = await session_manager.client.scard(f"user_sessions:{user_id}")
    if active_sessions == 0:
        raise HTTPException(
            status_code=401,
            detail="No active session. Please sign in again.",
        )

    # ── Calculate time remaining on access_token ──────────────────────
    exp_timestamp = payload.get("exp", 0)
    now_timestamp = int(datetime.now(timezone.utc).timestamp())
    expires_in = max(0, exp_timestamp - now_timestamp)

    return HeartbeatResponse(
        status="alive",
        user_id=user_id,
        expires_in=expires_in,
    )
