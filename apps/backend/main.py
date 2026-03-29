from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth

app = FastAPI(
    title="ArogyaVault API",
    description="Backend API for ArogyaVault health records platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)


@app.get("/")
async def root():
    return {"status": "ArogyaVault backend running", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
