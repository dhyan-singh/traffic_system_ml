"""
Inference Engine (B3 + C1)
Frame Grabber → YOLO Detector → Metrics → JSON Output → FPS Logger
"""

import time
import json

import os
import requests
import cv2
import torch

from utils.logger import VehicleLogger
from utils.emailer import EmailSender


# IMPORT METRICS MODULE
from metrics.traffic_metrics import TrafficMetrics

# IMPORT MODEL LOADER
from model_loader import YOLOModelLoader
from alerts.alert_engine import AlertEngine

# Add parent directory to path for imports
# sys.path.insert(0, str(Path(__file__).parent.parent))


# Determine device
if torch.cuda.is_available():
    device = "cuda"
    print("CUDA Available: True")
    print("Current Device:", torch.cuda.get_device_name(0))
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True
elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
    device = "mps"  # Apple Metal Performance Shaders
    print("Using Metal Performance Shaders (MPS) on macOS")
else:
    device = "cpu"
    print("Using CPU device")


class InferenceEngine:
    def __init__(self, stream_url, model_path="yolov8n.pt", camera_id="default"):
        self.stream_url = stream_url
        self.camera_id = camera_id
        self.model_loader = YOLOModelLoader(model_path=model_path, device="auto")
        self.model = self.model_loader.get_model()
        self.alert_engine = AlertEngine()
        self.logger = VehicleLogger()

        self.emailer = EmailSender(
            sender_email="chetanjaysingh500@gmail.com",
            app_password="yndq wzax uxou rnyq",
            receiver_email="sahukomendra721@gmail.com",
        )

        # Persistent HTTP session for connection reuse (keep-alive)
        self.session = requests.Session()
        self.session.headers.update({"Connection": "keep-alive"})
        self.backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:5001/update")
        print(f"[INFO] Backend URL: {self.backend_url}")

        print(f"[INFO] Opening camera stream: {stream_url}")
        self.cap = cv2.VideoCapture(stream_url)

        if not self.cap.isOpened():
            raise RuntimeError(f"[ERROR] Cannot open stream: {stream_url}")

        self.prev_time = time.time()

    def _compute_fps(self):
        now = time.time()
        fps = 1 / (now - self.prev_time)
        self.prev_time = now
        return round(fps, 2)

    def _detections_to_json(self, results, conf_thresh=0.6):
        detections = []

        # Move tensors to device (GPU if available, else CPU)
        boxes = results.boxes.xyxy.to(device)
        confs = results.boxes.conf.to(device)
        clss = results.boxes.cls.to(device)

        # TRACK IDs (optional but used for accident detection)
        ids = results.boxes.id.to(device) if results.boxes.id is not None else None

        for i in range(len(boxes)):
            conf = float(confs[i].item())

            # ✅ CONFIDENCE FILTER (YOUR REQUEST)
            if conf < conf_thresh:
                continue

            cls = int(clss[i].item())
            x1, y1, x2, y2 = map(float, boxes[i].tolist())

            track_id = int(ids[i].item()) if ids is not None else -1

            detections.append(
                {
                    "track_id": track_id,
                    "class_id": cls,
                    "class_name": self.model.names[cls],
                    "confidence": round(conf, 3),
                    "bbox": [x1, y1, x2, y2],
                }
            )

        return detections

    def run(self, display=True):
        print("[INFO] Starting inference loop... Press Q to exit.")

        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("[ERROR] Frame read error")
                break

            # YOLO inference

            results = self.model.track(frame, imgsz=640, half=True, persist=True)[0]

            # Raw detections
            detections_json = self._detections_to_json(results)
            self.logger.log(detections_json)

            # Compute metrics from detections
            vehicle_detections = TrafficMetrics.filter_vehicles(detections_json)

            metrics = {
                "vehicle_count": TrafficMetrics.vehicle_count(vehicle_detections),
                "class_distribution": TrafficMetrics.class_distribution(
                    vehicle_detections
                ),
                "congestion_score": TrafficMetrics.congestion_score(
                    vehicle_detections, frame.shape[1], frame.shape[0]
                ),
                "lane_wise": TrafficMetrics.lane_wise_count(
                    vehicle_detections, frame.shape[1]
                ),
            }

            fps = self._compute_fps()

            # Final Output JSON
            alerts = self.alert_engine.generate_alerts(metrics, vehicle_detections)

            output = {
                "camera_id": self.camera_id,
                "fps": fps,
                "num_detections": len(detections_json),
                "detections": detections_json,
                "metrics": metrics,
                "alerts": alerts,
            }
            try:
                # Use persistent session for connection reuse
                self.session.post(self.backend_url, json=output, timeout=0.05)
            except Exception:
                pass  # ignore connection errors if backend not running

            # print(json.dumps(output, indent=2))

            # Display annotated frame
            # if display:
            #     annotated = results.plot()
            #     cv2.imshow("Inference Engine - Press Q to exit", annotated)

            #     if cv2.waitKey(1) & 0xFF == ord("q"):
            #         break

        self.cap.release()
        cv2.destroyAllWindows()

        # Close persistent HTTP session
        self.session.close()

        # ✅ AUTOMATIC EMAIL ON STOP
        self.emailer.send_log("vehicle_log.csv")

        print("[INFO] CSV email sent. Inference session completed.")
