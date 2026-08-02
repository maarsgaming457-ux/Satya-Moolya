# Satya Moolya Backend

FastAPI backend foundation for Satya Moolya.

## Local setup

```bash
uv venv
uv pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Swagger UI is available at `/docs`.

## Health check

```bash
GET /api/v1/health
```

## Migrations

```bash
alembic revision --autogenerate -m "message"
alembic upgrade head
```

