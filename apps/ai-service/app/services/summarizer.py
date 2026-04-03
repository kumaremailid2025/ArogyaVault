"""
Post summariser — returns a concise summary + AI medical response.

Currently uses the in-memory store fallback. When OPENAI_API_KEY is set,
it will call OpenAI for real summaries.
"""

from __future__ import annotations

import os

_HAS_OPENAI = bool(os.getenv("OPENAI_API_KEY"))


async def get_post_summary(
    post_text: str,
    replies: list[str],
    *,
    stored_summary: str | None = None,
    stored_ai_response: str | None = None,
) -> tuple[str, str]:
    """Return (summary, ai_response) for a post and its replies."""

    # Real integration path
    if _HAS_OPENAI:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, max_tokens=300)

            reply_block = "\n".join(f"- {r}" for r in replies) if replies else "(no replies yet)"

            summary_prompt = [
                SystemMessage(
                    content=(
                        "You are a medical community assistant. Summarise the "
                        "discussion thread concisely in 2-3 sentences. Focus on "
                        "consensus, actionable insights, and any open questions."
                    )
                ),
                HumanMessage(content=f"Post: {post_text}\n\nReplies:\n{reply_block}"),
            ]
            summary_resp = await llm.ainvoke(summary_prompt)

            ai_prompt = [
                SystemMessage(
                    content=(
                        "You are a knowledgeable health AI. Provide a brief, "
                        "evidence-based response to the health topic. Keep it "
                        "factual and add practical advice. 2-3 sentences max."
                    )
                ),
                HumanMessage(content=f"Topic: {post_text}"),
            ]
            ai_resp = await llm.ainvoke(ai_prompt)

            return summary_resp.content, ai_resp.content
        except Exception:
            pass  # fall through to stored data

    # Fallback: return pre-seeded data
    summary = stored_summary or "AI summary is not available for this post."
    ai_response = stored_ai_response or "AI response is not available for this post."
    return summary, ai_response
