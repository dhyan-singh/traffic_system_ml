import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from inference_engine import InferenceEngine

if __name__ == "__main__":
    # IMPORTANT: Put your phone camera stream URL here
    stream_url = (
        "http://10.243.180.15:8080/video"  # Example: "http://192.168.43.1:8080/video"
    )

    stream_url = 0  # Set to None to use default webcam

    engine = InferenceEngine(stream_url=stream_url, model_path="yolov8s.pt")

    engine.run(display=True)
