from fastapi import FastAPI

from src.routers.notes import router as notes_router

app = FastAPI(
    title="Notes API",
    version="0.1.0",
    description="REST API for the note app",
    servers=[
        {"url": "http://127.0.0.1:8000", "description": "Local dev"},
        {"url": "http://localhost:8000", "description": "Local dev (localhost)"},
    ],
)
app.include_router(notes_router)


@app.get("/")
async def root():
    return {"message": "Hello World"}