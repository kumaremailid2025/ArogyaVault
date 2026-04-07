"""
Pydantic schemas for group endpoints.

Provides response_model types for GET /groups and GET /groups/{id},
ensuring consistent, documented API shapes.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class GroupOut(BaseModel):
    """A group visible to the current user (system or linked)."""

    id: str
    slug: str
    name: str
    type: str = Field(description="'system' or 'linked'")
    description: str | None = None

    # Linked-group fields (optional — only present for type="linked")
    rel: str | None = Field(None, description="Relationship type (Family Member, Doctor, …)")
    access: str | None = Field(None, description="Access scope (App Access, Group Access)")

    # Invite enrichment (added at runtime for linked groups)
    invite_direction: str | None = Field(None, description="'out', 'in', or 'unknown'")
    invite_id: str | None = None
    invite_status: str | None = None
    invite_relation: str | None = None
    invite_access_scope: str | None = None


class GroupListResponse(BaseModel):
    """Response envelope for GET /groups."""

    groups: list[GroupOut]
