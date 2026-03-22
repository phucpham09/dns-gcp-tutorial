from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(notes_router)


@app.get("/")
async def root():
    return {"message": "Hello World"}