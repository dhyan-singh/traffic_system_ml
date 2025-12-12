# Edge (Inference) — Traffic System ML

Runs YOLOv8-based inference on camera streams and sends results to backend.

## Usage (Local)
```
pip install -r requirements.txt
export BACKEND_URL=http://localhost:5001/update
export CAMERA_ID=camera_1
export STREAM_URL=0    # 0 for default webcam, or rtsp://...
python inference/run_inference.py
```

## Notes
- Uses a persistent HTTP `requests.Session` to reuse TCP connections.
- If backend is down, send attempts are best-effort and non-blocking.
- Logs detections to `vehicle_log.csv` and emails on stop (configure sender).

## Environment Variables
- `BACKEND_URL` — Backend POST endpoint for updates
- `CAMERA_ID` — Unique camera identifier
- `STREAM_URL` — Webcam index or IP camera stream URL

## Docker
- Edge is not part of compose by default (requires camera access).
- Prefer local run or IP-camera streams if containerizing.
