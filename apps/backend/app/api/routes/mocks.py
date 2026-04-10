"""
Mock response routes — keyword-based stub generators for AI chat, PDF Q&A
and post rephrasings. These replace the `mockAiResponse()`, `getPdfAiResponse()`
and `generateRephrasings()` functions that used to live in the frontend.

Each endpoint is deliberately simple: it loads a seeded "response bank" JSON
file at import time, then runs a lowercase substring match over the user's
query to pick a canned reply. This mirrors the behaviour of the removed
frontend utilities but ensures no mock data ships in the browser bundle.

When a real RAG pipeline is wired up these endpoints can be swapped out
without touching the frontend, because the response shape is preserved.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field


router = APIRouter(prefix="/mocks", tags=["mocks"])

SEED_DIR = Path(__file__).resolve().parent.parent / "seeds"


# ── Seed loaders ────────────────────────────────────────────────────────────


@lru_cache(maxsize=None)
def _load_ai_bank() -> dict[str, Any]:
    path = SEED_DIR / "ai-response-bank.json"
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


@lru_cache(maxsize=None)
def _load_pdf_bank() -> dict[str, Any]:
    path = SEED_DIR / "pdf-response-bank.json"
    with path.open("r", encoding="utf-8") as fp:
        return json.load(fp)


# ── Schemas ─────────────────────────────────────────────────────────────────


class AiRespondRequest(BaseModel):
    query: str = Field(..., min_length=1)


class AiRespondResponse(BaseModel):
    role: str = "ai"
    text: str
    list: Optional[List[str]] = None
    citations: Optional[List[str]] = None
    note: Optional[str] = None


class PdfRespondRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    question: str = Field(..., min_length=1)
    doc_name: str = Field(..., alias="docName")


class PdfRespondResponse(BaseModel):
    role: str = "ai"
    text: str
    citations: Optional[List[str]] = None
    related: Optional[List[str]] = None


class RephraseRequest(BaseModel):
    text: str = Field(..., min_length=1)


class RephraseResponse(BaseModel):
    formal: str
    concise: str


# ── AI chat stub ────────────────────────────────────────────────────────────


@router.post("/ai/respond", response_model=AiRespondResponse)
async def ai_respond(body: AiRespondRequest) -> AiRespondResponse:
    """Return a canned AI reply keyed off keywords in the user's query."""
    bank = _load_ai_bank()
    q = body.query.lower()

    for rule in bank.get("RULES", []):
        keywords: List[str] = rule.get("keywords", [])
        if any(kw in q for kw in keywords):
            resp = rule.get("response", {})
            return AiRespondResponse(**resp)

    default = bank.get("DEFAULT", {})
    return AiRespondResponse(**default)


# ── PDF Q&A stub ────────────────────────────────────────────────────────────


@router.post("/pdf/respond", response_model=PdfRespondResponse)
async def pdf_respond(body: PdfRespondRequest) -> PdfRespondResponse:
    """Return a canned PDF-Q&A reply keyed off keywords in the question."""
    bank = _load_pdf_bank()
    q = body.question.lower()

    for rule in bank.get("RULES", []):
        keywords: List[str] = rule.get("keywords", [])
        if any(kw in q for kw in keywords):
            resp = rule.get("response", {})
            text = resp.get("text_template", "").format(
                docName=body.doc_name,
                question=body.question,
            )
            return PdfRespondResponse(
                text=text,
                citations=resp.get("citations"),
                related=resp.get("related"),
            )

    default = bank.get("DEFAULT", {})
    text = default.get("text_template", "").format(
        docName=body.doc_name,
        question=body.question,
    )
    related_templates: List[str] = default.get("related_template") or []
    related = [t.format(docName=body.doc_name, question=body.question) for t in related_templates]
    return PdfRespondResponse(
        text=text,
        citations=default.get("citations"),
        related=related or None,
    )


# ── Post rephrasing stub ────────────────────────────────────────────────────


@router.post("/posts/rephrase", response_model=RephraseResponse)
async def posts_rephrase(body: RephraseRequest) -> RephraseResponse:
    """Return two AI-rephrased variants (formal + concise) for a reply text."""
    trimmed = body.text.strip()
    ends_with_punct = trimmed.endswith((".", "!", "?"))
    sentence = trimmed if ends_with_punct else trimmed + "."
    formal = (
        f"Thank you for raising this. {sentence} "
        "I hope this perspective is helpful — feel free to follow up with any questions."
    )

    words = trimmed.split(" ")
    short_text = " ".join(words[:18]) + "…" if len(words) > 18 else trimmed
    short_ends_with_punct = any(short_text.endswith(p) for p in (".", "!", "?", "…"))
    concise = f"{short_text}{'' if short_ends_with_punct else '.'} Hope this helps the community!"

    return RephraseResponse(formal=formal, concise=concise)
