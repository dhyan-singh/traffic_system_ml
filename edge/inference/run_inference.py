import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from inference_engine import InferenceEngine

if __name__ == "__main__":
    # Environment overrides for container usage
    stream_url = os.getenv("STREAM_URL", "0")
    camera_id = os.getenv("CAMERA_ID", "camera_1")

    # Use integer 0 when STREAM_URL is "0" to grab default webcam
    stream_value = 0 if str(stream_url) == "0" else stream_url

    engine = InferenceEngine(
        stream_url=stream_value, model_path="yolov8s.pt", camera_id=camera_id
    )

    # Disable OpenCV window in container environments
    engine.run(display=False)
