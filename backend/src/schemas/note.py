from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str | None
    content: str
    created_at: datetime
    updated_at: datetime


class NoteCreate(BaseModel):
    title: str | None = None
    content: str = ""


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
