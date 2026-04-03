"""
Text rephraser — returns two alternative phrasings (formal, concise).

Uses OpenAI when available, otherwise falls back to simple heuristic.
"""

from __future__ import annotations

import os

_HAS_OPENAI = bool(os.getenv("OPENAI_API_KEY"))


def _heuristic_rephrase(text: str) -> list[str]:
    """Simple fallback rephrasing without AI."""
    formal = text.replace("!", ".").replace("?", ".").strip()
    if not formal.endswith("."):
        formal += "."
    formal = "I would like to share that " + formal[0].lower() + formal[1:]

    words = text.split()
    concise = " ".join(words[: max(len(words) // 2, 5)])
    if not concise.endswith("."):
        concise += "."

    return [formal, concise]


async def get_rephrasings(text: str) -> list[str]:
    """Return [formal_version, concise_version] of the input text."""

    if _HAS_OPENAI:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, max_tokens=200)

            messages = [
                SystemMessage(
                    content=(
                        "You are a writing assistant. Given a message, provide "
                        "exactly two rephrased versions separated by |||. "
                        "First: a formal, polished version. "
                        "Second: a concise, shorter version. "
                        "Do not add any other text."
                    )
                ),
                HumanMessage(content=text),
            ]
            resp = await llm.ainvoke(messages)
            parts = resp.content.split("|||")
            if len(parts) == 2:
                return [p.strip() for p in parts]
        except Exception:
            pass

    return _heuristic_rephrase(text)
