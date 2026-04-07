"""
Custom exception classes and FastAPI exception handlers.

Provides consistent JSON error responses across all endpoints.
"""

from __future__ import annotations

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse


# ══════════════════════════════════════════════════════════════════════════════
#  CUSTOM EXCEPTIONS
# ══════════════════════════════════════════════════════════════════════════════


class NotFoundError(HTTPException):
    """Resource not found (404)."""

    def __init__(self, resource: str = "Resource", detail: str | None = None):
        super().__init__(
            status_code=404,
            detail=detail or f"{resource} not found",
        )


class ConflictError(HTTPException):
    """Resource conflict (409)."""

    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=409, detail=detail)


class ValidationError(HTTPException):
    """Business validation error (422)."""

    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status_code=422, detail=detail)


class ForbiddenError(HTTPException):
    """Access denied (403)."""

    def __init__(self, detail: str = "Access denied"):
        super().__init__(status_code=403, detail=detail)


# ══════════════════════════════════════════════════════════════════════════════
#  EXCEPTION HANDLERS
# ══════════════════════════════════════════════════════════════════════════════


def register_exception_handlers(app: FastAPI) -> None:
    """Attach custom exception handlers to the FastAPI app."""

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_req: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.status_code,
                    "message": exc.detail,
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(_req: Request, _exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": 500,
                    "message": "Internal server error",
                },
            },
        )
