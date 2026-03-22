from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_session
from src.models.note import Note
from src.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
async def list_notes(session: AsyncSession = Depends(get_session)) -> list[Note]:
    result = await session.scalars(select(Note).order_by(Note.updated_at.desc()))
    return list(result.all())


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
async def create_note(
    body: NoteCreate,
    session: AsyncSession = Depends(get_session),
) -> Note:
    note = Note(title=body.title, content=body.content)
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteRead)
async def get_note(
    note_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> Note:
    note = await session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=NoteRead)
async def update_note(
    note_id: UUID,
    body: NoteUpdate,
    session: AsyncSession = Depends(get_session),
) -> Note:
    note = await session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    data = body.model_dump(exclude_unset=True)
    if not data:
        return note
    for key, value in data.items():
        setattr(note, key, value)
    await session.commit()
    await session.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: UUID,
    session: AsyncSession = Depends(get_session),
) -> Response:
    note = await session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    await session.delete(note)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
