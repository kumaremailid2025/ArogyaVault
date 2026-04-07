"""
Industry-standard mobile number encryption for ArogyaVault.

Strategy:
  1. AES-256-GCM encryption for phone numbers at rest (confidentiality + integrity)
  2. SHA-256 HMAC hash for dedup lookups (never decrypt to search)
  3. Masked display format for UI (e.g. +91****5592)

Why AES-256-GCM:
  - NIST-approved authenticated encryption (FIPS 197 + SP 800-38D)
  - Protects both confidentiality and integrity in a single operation
  - Used by AWS, Google Cloud, and healthcare platforms (HIPAA-aligned)

Why HMAC-SHA256 for lookup:
  - Keyed hash prevents rainbow-table attacks (unlike plain SHA-256)
  - Enables O(1) dedup checks without decrypting every stored number
  - Same phone always produces same hash (deterministic)

Key management:
  - Encryption key and HMAC key derived from app settings
  - In production: use AWS KMS / HashiCorp Vault / Azure Key Vault
  - Keys must be rotated periodically (re-encrypt on rotation)
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import os
import re

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from fastapi import HTTPException

from app.core.config import get_settings
from app.core.constants import PHONE_REGEX

# ── Constants ────────────────────────────────────────────────────────────────

_NONCE_BYTES = 12  # 96-bit nonce (GCM standard)
_KEY_BYTES = 32    # 256-bit key


# ── Key Derivation ──────────────────────────────────────────────────────────


def _derive_encryption_key() -> bytes:
    """
    Derive a 256-bit AES key from the app's JWT secret.

    In production, replace with a proper KMS envelope key.
    Using HKDF-like derivation to separate key material.
    """
    settings = get_settings()
    raw = settings.jwt_secret.encode("utf-8")
    # SHA-256 of (secret + purpose) → deterministic 32-byte key
    return hashlib.sha256(raw + b":aes-256-gcm:phone-encryption").digest()


def _derive_hmac_key() -> bytes:
    """
    Derive a separate HMAC key from the app's JWT secret.

    Different derivation path ensures encryption key ≠ HMAC key.
    """
    settings = get_settings()
    raw = settings.jwt_secret.encode("utf-8")
    return hashlib.sha256(raw + b":hmac-sha256:phone-lookup").digest()


# ══════════════════════════════════════════════════════════════════════════════
#  PUBLIC API
# ══════════════════════════════════════════════════════════════════════════════


def encrypt_phone(phone: str) -> str:
    """
    Encrypt a phone number using AES-256-GCM.

    Returns a base64-encoded string containing: nonce (12B) + ciphertext + tag (16B).
    Each call produces a different ciphertext (random nonce), so the same phone
    number encrypted twice will NOT produce the same output — use phone_hash()
    for dedup.

    Args:
        phone: E.164 format phone number (e.g. "+919248255592")

    Returns:
        Base64-encoded encrypted blob (URL-safe, no padding).
    """
    key = _derive_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(_NONCE_BYTES)
    plaintext = phone.encode("utf-8")

    # GCM produces ciphertext + 16-byte auth tag appended
    ciphertext_with_tag = aesgcm.encrypt(nonce, plaintext, None)

    # Pack: nonce || ciphertext || tag
    blob = nonce + ciphertext_with_tag
    return base64.urlsafe_b64encode(blob).decode("ascii")


def decrypt_phone(encrypted: str) -> str:
    """
    Decrypt an AES-256-GCM encrypted phone number.

    Args:
        encrypted: Base64-encoded blob from encrypt_phone().

    Returns:
        Original phone number string.

    Raises:
        ValueError: If decryption fails (tampered data, wrong key).
    """
    key = _derive_encryption_key()
    aesgcm = AESGCM(key)

    blob = base64.urlsafe_b64decode(encrypted)

    if len(blob) < _NONCE_BYTES + 16:
        raise ValueError("Encrypted data too short — corrupted or invalid.")

    nonce = blob[:_NONCE_BYTES]
    ciphertext_with_tag = blob[_NONCE_BYTES:]

    try:
        plaintext = aesgcm.decrypt(nonce, ciphertext_with_tag, None)
    except Exception as e:
        raise ValueError(f"Decryption failed: {e}")

    return plaintext.decode("utf-8")


def phone_hash(phone: str) -> str:
    """
    Compute a deterministic HMAC-SHA256 hash of a phone number.

    Used for dedup lookups (check if a phone has already been invited)
    without decrypting all stored numbers. The HMAC key prevents
    rainbow-table attacks.

    Args:
        phone: E.164 format phone number.

    Returns:
        Hex-encoded HMAC digest (64 chars).
    """
    key = _derive_hmac_key()
    return hmac.new(key, phone.encode("utf-8"), hashlib.sha256).hexdigest()


def mask_phone(phone: str) -> str:
    """
    Create a masked display version of a phone number.

    Examples:
        "+919248255592" → "+91****5592"
        "+14155551234"  → "+1****1234"

    Shows country code prefix and last 4 digits; middle is masked.
    """
    # Strip non-digit prefix
    if phone.startswith("+"):
        # Find where digits start after '+'
        digits = phone[1:]
        # India: +91 (2-digit code) → show +91****XXXX
        # US: +1 (1-digit code) → show +1****XXXX
        if len(digits) >= 6:
            last4 = digits[-4:]
            # Determine country code length (1-3 digits typically)
            # Simple heuristic: India = 2, US/CA = 1, others = variable
            if digits.startswith("91") and len(digits) == 12:
                return f"+91****{last4}"
            elif digits.startswith("1") and len(digits) == 11:
                return f"+1****{last4}"
            else:
                # Generic: show first 2 + mask + last 4
                return f"+{digits[:2]}****{last4}"

    # Fallback: show first 3 + mask + last 4
    if len(phone) >= 7:
        return f"{phone[:3]}****{phone[-4:]}"
    return "****"


def normalize_phone(phone: str) -> str:
    """
    Normalize a phone number to E.164 format.

    Strips spaces, dashes, and parentheses. Ensures '+' prefix.
    For Indian numbers without country code, prepends +91.

    Args:
        phone: Raw phone input.

    Returns:
        Normalized E.164 phone string.

    Raises:
        ValueError: If the number is too short after normalization.
    """
    # Strip whitespace and common formatting characters
    cleaned = re.sub(r"[\s\-\(\)\.]+", "", phone.strip())

    # Remove leading 0 (local format)
    if cleaned.startswith("0") and len(cleaned) >= 10:
        cleaned = cleaned[1:]

    # Add + prefix if missing
    if not cleaned.startswith("+"):
        # Assume Indian number if 10 digits
        if len(cleaned) == 10 and cleaned[0] in "6789":
            cleaned = "+91" + cleaned
        elif cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = "+" + cleaned
        else:
            cleaned = "+" + cleaned

    if len(cleaned) < 8:
        raise ValueError(f"Phone number too short after normalization: {cleaned}")

    return cleaned


def validate_phone(phone: str) -> None:
    """
    Raise HTTPException 422 if phone format is invalid.

    Shared by auth and invite routes — single source of truth for phone
    format validation.
    """
    if not PHONE_REGEX.match(phone):
        raise HTTPException(
            status_code=422,
            detail="Invalid phone number. Expected format: +91XXXXXXXXXX",
        )
