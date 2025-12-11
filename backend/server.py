"""
C3 - Backend API Server for Realtime Traffic Analytics
Receives events from inference engine
Serves latest event to dashboard frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
latest_encoded_frame = None


app = Flask(__name__)
CORS(app)

latest_event = {}   # Global shared state
lock = threading.Lock()


@app.route("/update", methods=["POST"])
def update():
    """
    Inference engine sends data here every frame.
    """
    global latest_event
    data = request.json

    with lock:
        latest_event = data

    return {"status": "ok"}, 200


@app.route("/latest", methods=["GET"])
def latest():
    """
    Dashboard fetches latest analytics here.
    """
    with lock:
        return jsonify(latest_event)


if __name__ == "__main__":
    print("[INFO] Starting Backend API on port 5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
