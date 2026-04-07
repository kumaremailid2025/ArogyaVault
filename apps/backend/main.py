from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, groups, community, invite, vault
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.middleware import PlatformMiddleware
from app.core.redis import session_manager


# ── Lifecycle: connect/disconnect Redis ──────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: connect Redis. Shutdown: disconnect gracefully."""
    await session_manager.connect()
    print("✓ Redis connected")
    yield
    await session_manager.disconnect()
    print("✓ Redis disconnected")


# ── Settings ────────────────────────────────────────────────────────────────

settings = get_settings()


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ArogyaVault API",
    description="Backend API for ArogyaVault health records platform",
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Exception handlers ──────────────────────────────────────────────────────
register_exception_handlers(app)

# ── Middleware (order matters: last added = first executed) ──────────────────

# 1. CORS — env-driven origins for production + mobile
#    Dev: CORS_ORIGINS="http://localhost:3000"
#    Prod: CORS_ORIGINS="https://app.arogyavault.com,capacitor://localhost,http://localhost"
cors_origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,     # Required for httpOnly cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Platform",           # web | ios | android | api
        "X-App-Version",        # mobile app version
        "X-Device-Id",          # anonymous device ID for push/analytics
        "Accept-Language",      # locale
        "X-Request-Id",         # correlation ID for tracing
    ],
    expose_headers=[
        "X-Platform",           # echoed back for debugging
        "X-Request-Id",
    ],
)

# 2. Platform detection — parses X-Platform, X-App-Version, X-Device-Id
app.add_middleware(PlatformMiddleware)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(community.router)
app.include_router(invite.router)
app.include_router(vault.router)


@app.get("/")
async def root():
    return {"status": "ArogyaVault backend running", "version": settings.api_version}


@app.get("/health")
async def health():
    """Health check — includes Redis connectivity."""
    redis_ok = await session_manager.ping()
    return {
        "status": "healthy" if redis_ok else "degraded",
        "redis": "connected" if redis_ok else "disconnected",
    }
