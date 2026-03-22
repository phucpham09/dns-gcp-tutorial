# Chạy từ thư mục gốc của repo: make backend | make frontend | make dev

BACKEND_DIR := backend
FRONTEND_DIR := frontend
BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 3000

.PHONY: help backend frontend dev install-backend install-frontend openapi-export openapi-codegen

help:
	@echo "Targets:"
	@echo "  make backend          - chạy API FastAPI (uvicorn, reload)"
	@echo "  make frontend         - chạy Next.js dev (next dev -p PORT)"
	@echo "  make dev              - in hướng dẫn chạy 2 terminal"
	@echo "  make install-backend  - poetry install trong $(BACKEND_DIR)"
	@echo "  make install-frontend - pnpm install trong $(FRONTEND_DIR)"
	@echo "  make openapi-export   - ghi openapi/openapi.json từ FastAPI"
	@echo "  make openapi-codegen  - export + generate TypeScript types (frontend)"

install-backend:
	cd $(BACKEND_DIR) && poetry install

backend:
	cd $(BACKEND_DIR) && poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port $(BACKEND_PORT)

install-frontend:
	cd $(FRONTEND_DIR) && pnpm install

frontend:
	cd $(FRONTEND_DIR) && pnpm run dev -- -p $(FRONTEND_PORT)

dev:
	@echo "Chạy song song trong 2 terminal:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make frontend"

openapi-export:
	cd $(BACKEND_DIR) && poetry run python -m src.export_openapi ../openapi/openapi.json

openapi-codegen: openapi-export
	cd $(FRONTEND_DIR) && pnpm run generate:api-types
