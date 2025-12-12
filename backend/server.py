"""
C3 - Backend API Server for Realtime Traffic Analytics
Receives events from inference engine
Serves latest event to dashboard frontend
Supports multiple cameras
"""

import json
import os
import threading
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from redis import Redis

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Storage layer (Redis preferred for scaling, in-memory fallback for dev)
# ---------------------------------------------------------------------------
REDIS_URL = os.getenv("REDIS_URL")
redis_client = Redis.from_url(REDIS_URL, decode_responses=True) if REDIS_URL else None

# In-memory state is used only when Redis is absent
camera_data = {}  # {"camera_id": {"data": {...}, "last_update": timestamp}}
lock = threading.Lock()


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _redis_available() -> bool:
    return redis_client is not None


@app.route("/update", methods=["POST"])
def update():
    """
    Inference engine sends data here every frame.
    Expects camera_id in the payload.
    """
    data = request.json or {}

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

    return {"status": "ok", "camera_id": camera_id, "stored_at": timestamp}, 200


@app.route("/cameras", methods=["GET"])
def get_cameras():
    """
    Returns list of available camera IDs.
    """
    if _redis_available():
        try:
            camera_ids = redis_client.smembers("cameras") or []
            cameras = []
            for camera_id in camera_ids:
                info = redis_client.hgetall(f"camera:{camera_id}")
                if info:
                    cameras.append(
                        {"id": camera_id, "last_update": info.get("last_update")}
                    )
            return jsonify({"cameras": cameras})
        except Exception:
            pass  # fall through to in-memory

    with lock:
        cameras = [
            {"id": cid, "last_update": info["last_update"]}
            for cid, info in camera_data.items()
        ]
    return jsonify({"cameras": cameras})


@app.route("/latest", methods=["GET"])
def latest():
    """
    Dashboard fetches latest analytics here.
    Accepts optional camera_id query parameter.
    """
    camera_id = request.args.get("camera_id", "default")
    if _redis_available():
        try:
            payload = redis_client.hgetall(f"camera:{camera_id}")
            if payload and "data" in payload:
                return jsonify(json.loads(payload["data"]))
            return jsonify({})
        except Exception:
            pass  # fall through to in-memory

    with lock:
        if camera_id in camera_data:
            return jsonify(camera_data[camera_id]["data"])
    return jsonify({})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    print(f"[INFO] Starting Backend API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
