# Backend API (FastAPI)

API ghi chú dùng FastAPI, SQLAlchemy (async) và PostgreSQL. Cấu hình đọc từ biến môi trường / file `.env` qua `src.config.Settings`.

## Yêu cầu

- Python 3.13+
- [Poetry](https://python-poetry.org/)
- PostgreSQL 16+ (khi chạy API trực tiếp trên máy, không dùng Docker cho DB)
- Docker & Docker Compose (khi chạy full stack bằng compose)

## Cấu hình môi trường

Tạo file `.env` trong thư mục `backend/` (cùng cấp với `docker-compose.yml`):

```bash
cp .env.example .env
```

Chỉnh giá trị thật, đặc biệt `POSTGRES_PASSWORD`.

### Biến môi trường


| Biến                | Mô tả                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`     | User PostgreSQL                                                                                                                               |
| `POSTGRES_PASSWORD` | Mật khẩu (bắt buộc nếu không dùng `DATABASE_URL`)                                                                                             |
| `POSTGRES_DB`       | Tên database                                                                                                                                  |
| `POSTGRES_HOST`     | Host DB. **Local:** `localhost`. Trong Docker, service `api` được compose gán `POSTGRES_HOST=db` (ghi đè giá trị trong `.env` cho container). |
| `POSTGRES_PORT`     | Cổng PostgreSQL (mặc định `5432`)                                                                                                             |
| `DATABASE_URL`      | *(Tuỳ chọn)* URL đầy đủ dạng `postgresql+asyncpg://...`. Nếu có và không rỗng, **ưu tiên** hơn việc ghép từ các biến `POSTGRES_`*.            |
| `DB_ECHO`           | `true` để SQLAlchemy in câu SQL (debug)                                                                                                       |


**Quy tắc:** Hoặc đặt `DATABASE_URL`, hoặc đủ `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. Ứng dụng ghép URL async qua `asyncpg` trong `Settings.database_url`.

Ứng dụng đọc `.env` khi chạy từ thư mục `backend/` (Poetry / uvicorn). File `.env` **không** đưa vào image Docker (xem `.dockerignore`).

## OpenAPI (schema cho frontend)

- Khi API chạy: tài liệu **Swagger** tại `/docs`, schema JSON tại [`/openapi.json`](http://127.0.0.1:8000/openapi.json).
- Xuất file tĩnh (đặt ở `openapi/openapi.json` ở **root repo**, dùng cho codegen):

```bash
cd backend && poetry run python -m src.export_openapi ../openapi/openapi.json
```

Hoặc từ root repo: `make openapi-export`. Script **không** cần Postgres đang chạy (chỉ import app; có thể dùng placeholder `DATABASE_URL` nếu chưa có `.env`).

Frontend dùng **[openapi-typescript](https://github.com/openapi-ts/openapi-typescript)** sinh kiểu TypeScript: trong `frontend/` chạy `pnpm install` rồi `pnpm run generate:api-types` (cần file `openapi/openapi.json` đã export). Từ root: `make openapi-codegen` (export + generate).

## Cài đặt & chạy local (Poetry)

```bash
cd backend
poetry install
```

Đảm bảo PostgreSQL đã chạy và khớp thông tin trong `.env` (`POSTGRES_HOST=localhost`, v.v.).

Tạo bảng từ model (lần đầu hoặc sau khi đổi model, nếu chưa dùng migration tool):

```bash
poetry run python -m src.db.bootstrap
```

Chạy API:

```bash
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Từ **gốc repo** có thể dùng Makefile: `make backend` (xem `Makefile` ở root).

## Docker Compose (PostgreSQL + API)

Chạy trong thư mục `backend/`, sau khi đã có `.env`:

```bash
docker compose up --build
```

- Compose đọc `backend/.env` để thay các chỗ `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${POSTGRES_DB}`, `${POSTGRES_PORT}` trong file compose.
- Container **Postgres** nhận đúng user/password/db từ các biến đó.
- **`app_net` (bridge):** `api` và `db` cùng một network có tên; API kết nối Postgres qua hostname **`db`** (tên service), cổng **5432** nội bộ — không dùng `localhost` trong container.
- **Volume `./` → `/app`:** đồng bộ mã nguồn backend trên máy với container; `Dockerfile` đã bật `uvicorn --reload` nên sửa file local sẽ reload. Thư viện Python vẫn lấy từ image (đã `poetry install` lúc build); nếu đổi `pyproject.toml` / `poetry.lock` cần `docker compose build api` lại.

Sau khi stack lên, tạo bảng (một lần hoặc khi cần):

```bash
docker compose run --rm api python -m src.db.bootstrap
```

- API: `http://localhost:8000`
- Postgres từ máy host: `localhost` và cổng map trong `.env` (mặc định `POSTGRES_PORT`, ví dụ `5432`).

Dữ liệu Postgres lưu trong volume `postgres_data`.

## Gợi ý khi gặp lỗi

- **ValidationError / thiếu cấu hình DB:** Kiểm tra đã có đủ `POSTGRES_*` hoặc `DATABASE_URL` trong `.env` khi chạy Poetry, hoặc biến được inject đúng khi chạy Docker.
- **`socket.gaierror` / “Temporary failure in name resolution” khi chạy Poetry:** Trong `.env` cần `POSTGRES_HOST=localhost` (hoặc IP máy chạy Postgres). Đừng đặt `db` — đó chỉ là tên service trong Docker; ngoài container tên đó không resolve được.
- **API trong Docker không kết nối được DB:** Trong container phải dùng host `db`, không dùng `localhost`. Compose đã set `POSTGRES_HOST=db` cho service `api`; không cần (và không nên) đặt `DATABASE_URL` trỏ `localhost` cho container đó.
- **Import / session DB lỗi ngay khi start:** Module `src.db.session` tạo engine lúc import; cần biến môi trường hợp lệ trước khi import (sau khi bạn thêm route phụ thuộc DB).

## Cấu trúc liên quan


| Đường dẫn             | Vai trò                                           |
| --------------------- | ------------------------------------------------- |
| `src/config.py`       | `Settings`, `get_settings()`, ghép `database_url` |
| `src/db/session.py`   | Engine async, `get_session()` cho FastAPI         |
| `src/db/bootstrap.py` | `create_all` — tạo bảng theo model                |
| `src/models/note.py`  | Model `Note`                                      |
| `Dockerfile`          | Image API                                         |
| `docker-compose.yml`  | Postgres + API, biến từ `.env`                    |
| `src/export_openapi.py` | Ghi `openapi/openapi.json` từ schema FastAPI (`python -m src.export_openapi`) |


