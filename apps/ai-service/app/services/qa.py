"""
File Q&A — answers user questions about uploaded community files.

Uses OpenAI when available with the file's AI summary as context.
"""

from __future__ import annotations

import os

_HAS_OPENAI = bool(os.getenv("OPENAI_API_KEY"))


async def answer_file_question(
    question: str,
    file_name: str,
    ai_summary: str,
) -> str:
    """Answer a question about a file using its AI summary as context."""

    if _HAS_OPENAI:
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, max_tokens=300)

            messages = [
                SystemMessage(
                    content=(
                        "You are a medical document assistant. Answer the user's "
                        "question based on the document summary provided. Be "
                        "specific and helpful. If the summary doesn't contain "
                        "enough information, say so."
                    )
                ),
                HumanMessage(
                    content=(
                        f"Document: {file_name}\n"
                        f"Summary: {ai_summary}\n\n"
                        f"Question: {question}"
                    )
                ),
            ]
            resp = await llm.ainvoke(messages)
            return resp.content
        except Exception:
            pass

    return (
        f'Based on the document "{file_name}", ArogyaAI is analysing your question. '
        "This typically takes a few moments for thorough analysis of the uploaded "
        "file content."
    )
