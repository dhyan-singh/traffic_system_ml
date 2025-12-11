# src/utils/logger.py

import csv
import os
from datetime import datetime

class VehicleLogger:
    """
    Logs detected vehicles into a CSV file.
    CSV Format:
    id,vehicle_type,confidence,timestamp
    """

    def __init__(self, filename="vehicle_log.csv"):
        self.filename = filename

        # Create log file with header if it doesn't exist
        if not os.path.exists(self.filename):
            with open(self.filename, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["id", "vehicle_type", "confidence", "timestamp"])

    def log(self, detections):
        """
        Write detections to CSV file.
        Each detection = {track_id, class_name, confidence}
        """

        with open(self.filename, "a", newline="") as f:
            writer = csv.writer(f)

            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            for d in detections:
                writer.writerow([
                    d.get("track_id", -1),
                    d["class_name"],
                    d["confidence"],
                    timestamp
                ])
