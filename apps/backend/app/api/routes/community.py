"""
Community API routes — feed, files, members.

All data lives in the in-memory store (app.api.store).
AI features are imported from the ai-service package.
"""

from __future__ import annotations

import sys
import os
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.api.store import (
    COMMUNITY_POSTS,
    POST_NEXT_ID,
    REPLY_NEXT_ID,
    POST_LIKES,
    POST_SUMMARIES,
    POST_AI_RESPONSES,
    COMMUNITY_FILES,
    FILE_NEXT_ID,
    QA_NEXT_ID,
    COMMUNITY_MEMBERS,
    USERS_BY_ID,
)
from app.api.schemas.community import (
    PostOut,
    PostCreate,
    PostReplyOut,
    ReplyCreate,
    LikeToggleResponse,
    PostSummaryOut,
    RephraseRequest,
    RephraseResponse,
    FileOut,
    FileQACreate,
    FileQAOut,
    RecentFileQAOut,
    MemberOut,
    MemberStatsOut,
    MemberActivityOut,
)

# ── Add ai-service to sys.path so we can import its modules ──────────────────
_AI_SERVICE_ROOT = str(Path(__file__).resolve().parents[4] / "ai-service")
if _AI_SERVICE_ROOT not in sys.path:
    sys.path.insert(0, _AI_SERVICE_ROOT)

router = APIRouter(prefix="/community", tags=["community"])


# ══════════════════════════════════════════════════════════════════════════════
#  POSTS
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/{group_id}/posts", response_model=list[PostOut])
async def list_posts(group_id: str):
    """Return all posts for a group, newest first."""
    posts = COMMUNITY_POSTS.get(group_id, [])
    # Ensure each post has the correct replyCount
    result = []
    for p in posts:
        out = {**p, "replyCount": len(p.get("replies", []))}
        # Compute current like count from POST_LIKES
        base_likes = p.get("likes", 0)
        out["likes"] = base_likes
        result.append(out)
    return result


@router.post("/{group_id}/posts", response_model=PostOut, status_code=201)
async def create_post(group_id: str, body: PostCreate):
    """Create a new post in a group."""
    global REPLY_NEXT_ID

    next_id = POST_NEXT_ID.get(group_id, 0)
    POST_NEXT_ID[group_id] = next_id + 1

    post = {
        "id": next_id,
        "group_id": group_id,
        "author": "Kumar",
        "initials": "KU",
        "location": "Hyderabad",
        "time": "Just now",
        "text": body.text,
        "likes": 0,
        "replyCount": 0,
        "tag": body.tag,
        "replies": [],
    }

    if group_id not in COMMUNITY_POSTS:
        COMMUNITY_POSTS[group_id] = []
    COMMUNITY_POSTS[group_id].insert(0, post)

    return post


@router.get("/posts/{post_id}/replies", response_model=list[PostReplyOut])
async def get_replies(post_id: int, group_id: str):
    """Get all replies for a specific post."""
    posts = COMMUNITY_POSTS.get(group_id, [])
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post.get("replies", [])


@router.post("/posts/{post_id}/replies", response_model=PostReplyOut, status_code=201)
async def submit_reply(post_id: int, group_id: str, body: ReplyCreate):
    """Add a reply to a post."""
    global REPLY_NEXT_ID

    posts = COMMUNITY_POSTS.get(group_id, [])
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    reply_id = REPLY_NEXT_ID
    REPLY_NEXT_ID += 1

    reply = {
        "id": reply_id,
        "initials": "KU",
        "author": "Kumar",
        "time": "Just now",
        "text": body.text,
    }
    post.setdefault("replies", []).append(reply)
    post["replyCount"] = len(post["replies"])

    return reply


@router.post("/posts/{post_id}/like", response_model=LikeToggleResponse)
async def toggle_like(post_id: int, group_id: str):
    """Toggle like on a post for the current user."""
    user_id = "usr_001"  # hardcoded current user

    posts = COMMUNITY_POSTS.get(group_id, [])
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    key = (group_id, post_id, user_id)
    if key in POST_LIKES:
        POST_LIKES.discard(key)
        post["likes"] = max(0, post.get("likes", 0) - 1)
        liked = False
    else:
        POST_LIKES.add(key)
        post["likes"] = post.get("likes", 0) + 1
        liked = True

    return LikeToggleResponse(
        post_id=post_id,
        liked=liked,
        total_likes=post["likes"],
    )


# ══════════════════════════════════════════════════════════════════════════════
#  AI — summaries & rephrasings
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/posts/{post_id}/summary", response_model=PostSummaryOut)
async def get_post_summary_endpoint(post_id: int, group_id: str):
    """Get AI summary + response for a post."""
    posts = COMMUNITY_POSTS.get(group_id, [])
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    stored_summary = POST_SUMMARIES.get(post_id)
    stored_ai = POST_AI_RESPONSES.get(post_id)

    try:
        from app.services.summarizer import get_post_summary

        reply_texts = [r["text"] for r in post.get("replies", [])]
        summary, ai_response = await get_post_summary(
            post["text"],
            reply_texts,
            stored_summary=stored_summary,
            stored_ai_response=stored_ai,
        )
    except ImportError:
        summary = stored_summary or "AI summary is not available."
        ai_response = stored_ai or "AI response is not available."

    return PostSummaryOut(
        post_id=post_id,
        summary=summary,
        ai_response=ai_response,
    )


@router.post("/rephrase", response_model=RephraseResponse)
async def rephrase_text(body: RephraseRequest):
    """Return two rephrased versions of the input text."""
    try:
        from app.services.rephraser import get_rephrasings

        rephrasings = await get_rephrasings(body.text)
    except ImportError:
        # Fallback if ai-service is not importable
        rephrasings = [
            "I would like to share that " + body.text[0].lower() + body.text[1:],
            " ".join(body.text.split()[: max(len(body.text.split()) // 2, 5)]) + ".",
        ]

    return RephraseResponse(original=body.text, rephrasings=rephrasings)


# ══════════════════════════════════════════════════════════════════════════════
#  FILES
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/{group_id}/files", response_model=list[FileOut])
async def list_files(group_id: str):
    """Return all files for a group."""
    files = COMMUNITY_FILES.get(group_id, [])
    for f in files:
        f["qaCount"] = len(f.get("questions", []))
    return files


@router.get("/files/{file_id}", response_model=FileOut)
async def get_file(file_id: int, group_id: str):
    """Get a single file by ID."""
    files = COMMUNITY_FILES.get(group_id, [])
    file = next((f for f in files if f["id"] == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    file["qaCount"] = len(file.get("questions", []))
    return file


@router.post("/files/{file_id}/qa", response_model=FileQAOut, status_code=201)
async def ask_file_question(file_id: int, group_id: str, body: FileQACreate):
    """Ask a question about a file — returns AI-generated answer."""
    global QA_NEXT_ID

    files = COMMUNITY_FILES.get(group_id, [])
    file = next((f for f in files if f["id"] == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Try AI answer
    try:
        from app.services.qa import answer_file_question

        answer = await answer_file_question(
            body.question,
            file["name"],
            file.get("aiSummary", ""),
        )
    except ImportError:
        answer = (
            f"ArogyaAI is analysing \"{file['name']}\" to answer your question. "
            "This typically takes a few moments."
        )

    qa_id = QA_NEXT_ID
    QA_NEXT_ID += 1

    qa_entry = {
        "id": qa_id,
        "question": body.question,
        "askedBy": "Kumar",
        "askedByInitials": "KU",
        "askedAt": datetime.now().strftime("%b %d, %Y"),
        "answer": answer,
    }
    file.setdefault("questions", []).append(qa_entry)
    file["qaCount"] = len(file["questions"])

    return qa_entry


@router.get("/{group_id}/files/recent-qa", response_model=list[RecentFileQAOut])
async def recent_file_qa(group_id: str):
    """Return the most recent Q&A across all files in a group."""
    files = COMMUNITY_FILES.get(group_id, [])
    recent: list[dict] = []
    for f in files:
        for qa in f.get("questions", []):
            recent.append(
                {
                    "fileId": f["id"],
                    "fileName": f["name"],
                    "fileCategory": f.get("category", ""),
                    "question": qa["question"],
                    "askedBy": qa["askedBy"],
                    "askedByInitials": qa["askedByInitials"],
                    "askedAt": qa["askedAt"],
                    "answer": qa["answer"],
                }
            )
    # Return newest first, max 10
    return recent[-10:][::-1]


# ══════════════════════════════════════════════════════════════════════════════
#  MEMBERS
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/{group_id}/members", response_model=list[MemberOut])
async def list_members(group_id: str):
    """Return all members for a group."""
    members = COMMUNITY_MEMBERS.get(group_id, [])
    return members


@router.get("/members/{member_id}", response_model=MemberOut)
async def get_member(member_id: int, group_id: str):
    """Get a single member by ID."""
    for members in COMMUNITY_MEMBERS.values():
        member = next((m for m in members if m["id"] == member_id), None)
        if member:
            return member
    raise HTTPException(status_code=404, detail="Member not found")
