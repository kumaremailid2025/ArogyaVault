from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, groups, community
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


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ArogyaVault API",
    description="Backend API for ArogyaVault health records platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,  # Required for httpOnly cookies (Set-Cookie)
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(community.router)


@app.get("/")
async def root():
    return {"status": "ArogyaVault backend running", "version": "0.1.0"}


@app.get("/health")
async def health():
    """Health check — includes Redis connectivity."""
    redis_ok = await session_manager.ping()
    return {
        "status": "healthy" if redis_ok else "degraded",
        "redis": "connected" if redis_ok else "disconnected",
    }
