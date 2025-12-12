# Backend (FastAPI) — Traffic System ML

FastAPI backend serving REST endpoints for real-time traffic analytics.

## Features
- `POST /update`: Receive edge payloads per `camera_id`
- `GET /cameras`: List active cameras (filters stale using `STALE_CAMERA_SECONDS`)
- `GET /latest`: Fetch latest snapshot for a camera
- Hot state: Redis (fallback to in-memory)
- Cold storage: Postgres (`traffic_events`)

## Configuration
- `REDIS_URL`: e.g. `redis://redis:6379/0`
- `DATABASE_URL`: e.g. `postgresql://postgres:postgres@postgres:5432/traffic`
- `STALE_CAMERA_SECONDS`: default `60` (set lower to prune faster)
- `PORT`: default `5001`

## Run (Docker Compose)
See repo root `docker-compose.yml`.

## Run (Local)
```
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 5001
```

## Schema (Postgres)
`traffic_events(id BIGSERIAL, camera_id TEXT, payload JSONB, received_at TIMESTAMPTZ)`

## Notes
- Backend is stateless; scale replicas behind a load balancer.
- If Redis or Postgres is unavailable, API stays responsive (best-effort writes).
