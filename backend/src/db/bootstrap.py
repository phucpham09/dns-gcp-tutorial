"""Create tables from models (handy for local dev). Run from backend/: poetry run python -m src.db.bootstrap"""

import asyncio

from src.db.base import Base
from src.db.session import engine


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(main())
