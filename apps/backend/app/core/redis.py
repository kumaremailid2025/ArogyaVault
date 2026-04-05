"""
Redis Session Manager
---------------------
Manages authenticated sessions in Redis:
  - Store refresh token metadata (jti, user_id, phone, expiry)
  - Validate refresh tokens (exists + not revoked)
  - Revoke individual tokens or all tokens for a user
  - TTL-based automatic cleanup (no stale sessions)

Keys:
  session:{jti}         → JSON { user_id, phone, created_at }   TTL = refresh_token_expire
  user_sessions:{uid}   → Redis SET of active jti values         TTL = refresh_token_expire

Usage:
  from app.core.redis import session_manager
  await session_manager.store_session(jti, user_id, phone, ttl)
  is_valid = await session_manager.validate_session(jti)
  await session_manager.revoke_session(jti)
  await session_manager.revoke_all_user_sessions(user_id)
"""

import json
from datetime import datetime, timezone

import redis.asyncio as redis

from app.core.config import get_settings


class RedisSessionManager:
    """Async Redis client wrapper for session management."""

    def __init__(self) -> None:
        self._client: redis.Redis | None = None

    async def connect(self) -> None:
        """Open the Redis connection pool."""
        settings = get_settings()
        self._client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            max_connections=20,
        )
        # Verify connectivity
        await self._client.ping()

    async def disconnect(self) -> None:
        """Close the Redis connection pool gracefully."""
        if self._client:
            await self._client.aclose()
            self._client = None

    @property
    def client(self) -> redis.Redis:
        if not self._client:
            raise RuntimeError("Redis is not connected. Call connect() first.")
        return self._client

    # ── Session CRUD ────────────────────────────────────────────────

    async def store_session(
        self,
        jti: str,
        user_id: str,
        phone: str,
        ttl_seconds: int,
    ) -> None:
        """
        Store a refresh token session.
        - session:{jti} holds the metadata (auto-expires with TTL)
        - user_sessions:{user_id} tracks all active jtis for the user
        """
        session_data = json.dumps({
            "user_id": user_id,
            "phone": phone,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        pipe = self.client.pipeline()
        # Store session with TTL
        pipe.setex(f"session:{jti}", ttl_seconds, session_data)
        # Add jti to user's session set (with same TTL on the set)
        pipe.sadd(f"user_sessions:{user_id}", jti)
        pipe.expire(f"user_sessions:{user_id}", ttl_seconds)
        await pipe.execute()

    async def validate_session(self, jti: str) -> bool:
        """Check if a session exists (not expired, not revoked)."""
        return await self.client.exists(f"session:{jti}") == 1

    async def get_session(self, jti: str) -> dict | None:
        """Get session metadata. Returns None if expired/revoked."""
        data = await self.client.get(f"session:{jti}")
        if not data:
            return None
        return json.loads(data)

    async def revoke_session(self, jti: str) -> None:
        """Revoke a single refresh token by deleting its session key."""
        # Get session to find user_id for cleanup
        session = await self.get_session(jti)
        if session:
            user_id = session["user_id"]
            pipe = self.client.pipeline()
            pipe.delete(f"session:{jti}")
            pipe.srem(f"user_sessions:{user_id}", jti)
            await pipe.execute()
        else:
            # Session already expired — just try to delete
            await self.client.delete(f"session:{jti}")

    async def revoke_all_user_sessions(self, user_id: str) -> int:
        """
        Revoke ALL sessions for a user (e.g. token reuse attack).
        Returns the number of sessions revoked.
        """
        set_key = f"user_sessions:{user_id}"
        jtis = await self.client.smembers(set_key)

        if not jtis:
            return 0

        pipe = self.client.pipeline()
        for jti in jtis:
            pipe.delete(f"session:{jti}")
        pipe.delete(set_key)
        await pipe.execute()

        return len(jtis)

    # ── OTP Store (optional — migrate OTPs to Redis too) ────────────

    async def store_otp(
        self,
        phone: str,
        code: str,
        ttl_seconds: int = 300,
    ) -> None:
        """Store OTP with automatic expiry."""
        otp_data = json.dumps({
            "code": code,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "attempts": 0,
        })
        await self.client.setex(f"otp:{phone}", ttl_seconds, otp_data)

    async def get_otp(self, phone: str) -> dict | None:
        """Get OTP data. Returns None if expired."""
        data = await self.client.get(f"otp:{phone}")
        if not data:
            return None
        return json.loads(data)

    async def update_otp_attempts(self, phone: str, attempts: int) -> None:
        """Update the attempt count (preserves TTL)."""
        data = await self.client.get(f"otp:{phone}")
        if not data:
            return
        otp = json.loads(data)
        otp["attempts"] = attempts
        ttl = await self.client.ttl(f"otp:{phone}")
        if ttl > 0:
            await self.client.setex(f"otp:{phone}", ttl, json.dumps(otp))

    async def delete_otp(self, phone: str) -> None:
        """Delete OTP after successful verification."""
        await self.client.delete(f"otp:{phone}")

    # ── Health Check ────────────────────────────────────────────────

    async def ping(self) -> bool:
        """Check Redis connectivity."""
        try:
            return await self.client.ping()
        except Exception:
            return False


# ── Singleton instance ────────────────────────────────────────────────────────

session_manager = RedisSessionManager()
