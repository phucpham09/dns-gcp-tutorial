FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN pip install --no-cache-dir poetry

WORKDIR /app

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-interaction --no-ansi --no-root \
    && rm -rf "$POETRY_CACHE_DIR"

COPY src ./src

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
