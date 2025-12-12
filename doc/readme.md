# Traffic System ML — Setup & Overview

This project provides real-time traffic analytics using edge AI inference, a scalable FastAPI backend, and a modern React/Vite dashboard. The backend uses Redis for hot state and Postgres for permanent storage, enabling horizontal scaling and historical data queries.

## Quick Start (Docker Compose)

Prerequisites: Docker Desktop

```
git clone https://github.com/dhyan-singh/traffic_system_ml
cd traffic_system_ml
docker compose up --build
```

Access:
- Frontend (Nginx): http://localhost:3000
- Backend (FastAPI): http://localhost:5001
- Postgres: localhost:5432 (db: `traffic`, user: `postgres`, pass: `postgres`)

Environment (compose defaults):
- `REDIS_URL=redis://redis:6379/0`
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/traffic`
- `PORT=5001`
- `STALE_CAMERA_SECONDS=60` (filter cameras that haven’t updated recently)

## Edge Inference (Local)

Run the edge on your host for camera access:

```
cd edge
pip install -r requirements.txt
export BACKEND_URL=http://localhost:5001/update
export CAMERA_ID=camera_1
export STREAM_URL=0   # 0 for webcam, or rtsp://<ip-camera>
python inference/run_inference.py
```

Notes:
- Uses a persistent `requests.Session` to avoid creating new TCP connections per frame.
- Sends JSON payloads to backend at ~frame rate. If backend is down, send attempts are best-effort.

## Project Structure

- `backend/` — FastAPI + Uvicorn, REST API, Redis hot state, Postgres cold storage
- `traffic-pulse-main/` — React/Vite dashboard, served via Nginx
- `edge/` — YOLOv8 inference + metrics + alerting, posts to backend
- `docker-compose.yml` — Orchestrates backend, frontend, Redis, Postgres
- `ARCHITECTURE.md` — Detailed design and scaling strategy

## Backend API

- `POST /update` — Edge devices send detection data (includes `camera_id`)
- `GET /latest?camera_id=<id>` — Latest snapshot for a camera
- `GET /cameras` — Active cameras (stale cameras filtered out)
- `GET /events?camera_id=<id>&limit=100` — Recent persisted events from Postgres

## Brief Architecture Overview

- **Edge (Local Python):** Runs YOLOv8 on video streams, computes metrics, and posts JSON to backend. Uses a persistent HTTP session for efficiency.
- **Backend (FastAPI):** Stateless REST API. Writes hot latest state to Redis and permanently stores event payloads in Postgres. Can be horizontally scaled; replicas share Redis/Postgres.
- **Frontend (React/Vite):** Polls the backend (1s interval) for camera list and latest metrics. Served via Nginx.
- **Redis:** Shared hot state to support multi-replica backend reads.
- **Postgres:** JSONB cold storage for historical data and analytics.

## Benefits

- **Scalable:** Backend is stateless; add replicas behind a load balancer. Shared Redis/Postgres ensure consistency.
- **Efficient:** Edge uses persistent HTTP sessions to reuse TCP connections; backend reads are simple and fast.
- **Reliable:** Hot-path caching in Redis with in-memory fallback keeps the API responsive; cold storage ensures durability.
- **Portable:** All core services are containerized (backend, frontend, Redis, Postgres). Edge runs locally for easy camera access.
- **Extensible:** Postgres cold storage enables reporting, analytics, and historical insights. API is simple to integrate.

## Production Notes

- Use a load balancer or ingress (Nginx/Traefik/HAProxy) and point edge devices to the LB URL.
- Configure TLS, API authentication, and CORS restrictions.
- Consider Redis Sentinel/Cluster and managed Postgres for HA.
- Add monitoring (Prometheus/Grafana) and centralized logging (ELK).

## Scaling Backends (Horizontal)

Compose (development):
```
docker compose up --scale backend=3
```

Swarm/Kubernetes (production):
- Publish backend port via routing mesh/ingress and connect edges to the public URL.
- Backend replicas share Redis/Postgres; any replica can serve reads/writes.
