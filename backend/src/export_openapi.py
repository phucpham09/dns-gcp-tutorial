"""Export OpenAPI 3 schema to JSON for frontend codegen (openapi-typescript, Orval, etc.).

Does not open a DB connection. Run from backend (cwd must be backend so package src resolves):

  cd backend && poetry run python -m src.export_openapi
  cd backend && poetry run python -m src.export_openapi ../openapi/openapi.json

If no backend/.env exists, a placeholder DATABASE_URL is set so imports succeed.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def main() -> None:
    backend_root = Path(__file__).resolve().parent.parent
    os.chdir(backend_root)

    if not os.environ.get("DATABASE_URL") and not os.environ.get("POSTGRES_USER"):
        os.environ.setdefault(
            "DATABASE_URL",
            "postgresql+asyncpg://openapi:openapi@127.0.0.1:5432/openapi",
        )

    from src.main import app

    schema = app.openapi()
    default_out = backend_root.parent / "openapi" / "openapi.json"
    out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else default_out
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(schema, indent=2), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
