"""
C3 - Backend API Server for Realtime Traffic Analytics (FastAPI)
Receives events from inference engine
Serves latest event to dashboard frontend
Supports multiple cameras
"""

import json
import os
import threading
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg_pool import ConnectionPool
from redis import Redis

# ---------------------------------------------------------------------------
# Storage layers (Redis for hot state, Postgres for cold storage)
# ---------------------------------------------------------------------------
REDIS_URL = os.getenv("REDIS_URL")
DATABASE_URL = os.getenv("DATABASE_URL")
STALE_CAMERA_SECONDS = int(os.getenv("STALE_CAMERA_SECONDS", "60"))

redis_client = Redis.from_url(REDIS_URL, decode_responses=True) if REDIS_URL else None
pg_pool: ConnectionPool | None = None

# In-memory state is used only when Redis is absent
camera_data = {}  # {"camera_id": {"data": {...}, "last_update": timestamp}}
lock = threading.Lock()

# SSE broadcast queue for real-time push to frontend
# Maps camera_id to list of subscriber queues
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    _init_pg_pool()


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _redis_available() -> bool:
    return redis_client is not None


def _pg_available() -> bool:
    return pg_pool is not None


def _ensure_pg_table():
    if not _pg_available():
        return
    with pg_pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS traffic_events (
                    id BIGSERIAL PRIMARY KEY,
                    camera_id TEXT NOT NULL,
                    payload JSONB NOT NULL,
                    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                CREATE INDEX IF NOT EXISTS idx_traffic_events_camera_time
                    ON traffic_events (camera_id, received_at DESC);
                """
            )
        conn.commit()


def _init_pg_pool():
    global pg_pool
    if not DATABASE_URL:
        return
    pg_pool = ConnectionPool(
        conninfo=DATABASE_URL,
        max_size=int(os.getenv("PG_POOL_SIZE", "5")),
    )
    _ensure_pg_table()


def _is_fresh(ts: Optional[str]) -> bool:
    if not ts:
        return False
    try:
        dt = datetime.fromisoformat(ts)
    except Exception:
        return False
    age = (datetime.now(timezone.utc) - dt).total_seconds()
    return age <= STALE_CAMERA_SECONDS


@app.post("/update")
async def update(request: Request):
    """Inference engine sends data here every frame (JSON body)."""
    data = await request.json()

    # Extract camera_id from payload, default to "default" if not provided
    camera_id = data.get("camera_id", "default")
    timestamp = _utc_iso()

    if _redis_available():
        try:
            # Store per-camera payload in Redis for horizontal scalability
            redis_client.hset(
                f"camera:{camera_id}",
                mapping={"data": json.dumps(data), "last_update": timestamp},
            )
            redis_client.sadd("cameras", camera_id)
        except Exception:
            # Fall back to in-memory if Redis is unreachable
            with lock:
                camera_data[camera_id] = {"data": data, "last_update": timestamp}
    else:
        with lock:
            camera_data[camera_id] = {"data": data, "last_update": timestamp}

    # Persist raw payload to Postgres (cold storage)
    if _pg_available():
        try:
            with pg_pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO traffic_events (camera_id, payload, received_at)
                        VALUES (%s, %s, %s)
                        """,
                        (camera_id, json.dumps(data), timestamp),
                    )
                conn.commit()
        except Exception:
            pass  # keep API responsive even if DB write fails

    return JSONResponse(
        {"status": "ok", "camera_id": camera_id, "stored_at": timestamp}
    )


@app.get("/cameras")
async def get_cameras():
    """Returns list of available camera IDs."""
    if _redis_available():
        try:
            camera_ids = redis_client.smembers("cameras") or []
            cameras = []
            for camera_id in camera_ids:
                info = redis_client.hgetall(f"camera:{camera_id}")
                if info:
                    last_update = info.get("last_update")
                    if _is_fresh(last_update):
                        cameras.append({"id": camera_id, "last_update": last_update})
                    else:
                        # Clean up stale entries
                        redis_client.srem("cameras", camera_id)
                        redis_client.delete(f"camera:{camera_id}")
            return JSONResponse({"cameras": cameras})
        except Exception:
            pass  # fall through to in-memory

    with lock:
        cameras = [
            {"id": cid, "last_update": info["last_update"]}
            for cid, info in camera_data.items()
            if _is_fresh(info.get("last_update"))
        ]
        # Drop stale in-memory entries
        stale = [
            cid
            for cid, info in camera_data.items()
            if not _is_fresh(info.get("last_update"))
        ]
        for cid in stale:
            camera_data.pop(cid, None)
    return JSONResponse({"cameras": cameras})


@app.get("/latest")
async def latest(camera_id: str = "default"):
    """Dashboard fetches latest analytics here (by camera_id)."""
    if _redis_available():
        try:
            payload = redis_client.hgetall(f"camera:{camera_id}")
            if payload and "data" in payload:
                return JSONResponse(json.loads(payload["data"]))
            return JSONResponse({})
        except Exception:
            pass  # fall through to in-memory

    with lock:
        if camera_id in camera_data:
            return JSONResponse(camera_data[camera_id]["data"])
    return JSONResponse({})


@app.get("/events")
async def events(camera_id: str, limit: int = 100):
    """Return recent persisted events from Postgres for a camera."""
    if not _pg_available():
        return JSONResponse({"error": "Postgres not configured"}, status_code=503)

    # clamp limit to sensible bounds
    limit = max(1, min(limit, 1000))

    try:
        with pg_pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT payload, received_at
                    FROM traffic_events
                    WHERE camera_id = %s
                    ORDER BY received_at DESC
                    LIMIT %s
                    """,
                    (camera_id, limit),
                )
                rows = cur.fetchall()
        data = [
            {
                "payload": json.loads(row[0]) if isinstance(row[0], str) else row[0],
                "received_at": row[1].isoformat(),
            }
            for row in rows
        ]
        return JSONResponse(
            {"camera_id": camera_id, "count": len(data), "events": data}
        )
    except Exception:
        return JSONResponse({"error": "Query failed"}, status_code=500)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"[INFO] FastAPI Backend starting on port {port}")
