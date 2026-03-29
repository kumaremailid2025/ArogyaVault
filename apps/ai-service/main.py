from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ArogyaVault AI Service",
    description="Document processing and RAG Q&A pipeline",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ArogyaVault AI service running", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Sprint 2 will add:
# POST /documents/process   — OCR + GPT-4o extraction + embedding
# Sprint 3 will add:
# POST /qa/ask              — RAG Q&A pipeline
