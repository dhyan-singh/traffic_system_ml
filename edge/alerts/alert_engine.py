# """
# C2 - Alert Engine
# Generates real-time alerts based on metrics & detections

# Teacher ko yehi chahiye: “YOLO detections se real-time intelligent decisions niklo.”
# Alerts = system ko smart banate hain →

# Congestion alert

# Accident (vehicle standing still)

# Wrong-way detection

# Dashboard me yahi highlight hoga.
# """

# import time


# class AlertEngine:

#     def __init__(self):
#         # Store movement history for accident/stationary detection
#         self.previous_positions = {}
#         self.stationary_start = {}

#     # --------------------------------------------------------
#     # 1️⃣ Congestion Alert
#     # --------------------------------------------------------
#     def congestion_alert(self, score, threshold=0.25):
#         """
#         Trigger alert if congestion score is high.
#         """
#         return score >= threshold

#     # --------------------------------------------------------
#     # 2️⃣ Accident / Stationary Object Detection
#     # --------------------------------------------------------
#     def detect_stationary(self, detections, freeze_threshold_sec=5):
#         """
#         Detect vehicles that haven't moved for X seconds → potential accident.
#         """

#         current_time = time.time()
#         stationary_alert = False

#         for idx, det in enumerate(detections):
#             cls = det["class_id"]
#             if cls not in [2, 3, 5, 7]:  # only vehicles
#                 continue

#             x1, y1, x2, y2 = det["bbox"]
#             center = ((x1 + x2) / 2, (y1 + y2) / 2)

#             # First time seeing this object
#             if idx not in self.previous_positions:
#                 self.previous_positions[idx] = center
#                 self.stationary_start[idx] = current_time
#                 continue

#             # If center didn't move > 10 pixels
#             prev_center = self.previous_positions[idx]
#             dist = ((center[0] - prev_center[0]) ** 2 +
#                     (center[1] - prev_center[1]) ** 2) ** 0.5

#             if dist < 10:  # Vehicle barely moved
#                 # Check if stationary for long enough
#                 if current_time - self.stationary_start[idx] >= freeze_threshold_sec:
#                     stationary_alert = True
#             else:
#                 # Reset timer if object moved
#                 self.stationary_start[idx] = current_time

#             self.previous_positions[idx] = center

#         return stationary_alert

#     # --------------------------------------------------------
#     # 3️⃣ Wrong-Way Detection
#     # --------------------------------------------------------
#     def detect_wrong_way(self, detections):
#         """
#         Vehicles moving from right → left across lanes = wrong way.
#         We track the horizontal movement of bounding box centers.
#         """

#         wrong_way = False

#         for idx, det in enumerate(detections):
#             x1, y1, x2, y2 = det["bbox"]
#             center_x = (x1 + x2) / 2

#             # First time seeing object
#             if idx not in self.previous_positions:
#                 self.previous_positions[idx] = center_x
#                 continue

#             prev_x = self.previous_positions[idx]

#             # Moving significantly left → right allowed
#             # Moving right → left means wrong way
#             if center_x < prev_x - 25:  # moving left significantly
#                 wrong_way = True

#             self.previous_positions[idx] = center_x

#         return wrong_way

#     # --------------------------------------------------------
#     # 4️⃣ Aggregate all alerts
#     # --------------------------------------------------------
#     def generate_alerts(self, metrics, detections):
#         alerts = {
#             "congestion_alert": self.congestion_alert(metrics["congestion_score"]),
#             "accident_alert": self.detect_stationary(detections),
#             "wrong_way_alert": self.detect_wrong_way(detections)
#         }
#         return alerts



"""
C2 - Alert Engine (FIXED VERSION)
Separate tracking for stationary and wrong-way detection.
"""

import time

class AlertEngine:

    def __init__(self):
        # For accident detection (stationary logic)
        self.stationary_positions = {}
        self.stationary_start = {}

        # For wrong-way detection
        self.wrongway_positions = {}

    # --------------------------------------------------------
    # 1️⃣ Congestion Alert
    # --------------------------------------------------------
    def congestion_alert(self, score, threshold=0.25):
        return score >= threshold

    # --------------------------------------------------------
    # 2️⃣ Accident / Stationary Detection
    # --------------------------------------------------------
    def detect_stationary(self, detections, freeze_threshold_sec=5):
        current_time = time.time()
        stationary_alert = False

        for idx, det in enumerate(detections):
            x1, y1, x2, y2 = det["bbox"]
            center = ((x1 + x2) / 2, (y1 + y2) / 2)

            # First time seeing this object
            if idx not in self.stationary_positions:
                self.stationary_positions[idx] = center
                self.stationary_start[idx] = current_time
                continue

            prev_center = self.stationary_positions[idx]
            dist = ((center[0] - prev_center[0]) ** 2 +
                    (center[1] - prev_center[1]) ** 2) ** 0.5

            if dist < 10:  # Not moving
                if current_time - self.stationary_start[idx] >= freeze_threshold_sec:
                    stationary_alert = True
            else:
                self.stationary_start[idx] = current_time

            self.stationary_positions[idx] = center

        return stationary_alert

    # --------------------------------------------------------
    # 3️⃣ Wrong-Way Detection (FIXED)
    # --------------------------------------------------------
    def detect_wrong_way(self, detections):
        wrong_way = False

        for idx, det in enumerate(detections):
            x1, y1, x2, y2 = det["bbox"]
            center_x = (x1 + x2) / 2  # float

            # First time we see this vehicle in wrong-way tracking
            if idx not in self.wrongway_positions:
                self.wrongway_positions[idx] = center_x
                continue

            prev_x = self.wrongway_positions[idx]

            # FIX: ensure prev_x is float, NOT tuple
            if not isinstance(prev_x, (int, float)):
                prev_x = float(prev_x[0]) if isinstance(prev_x, tuple) else float(prev_x)

            # Wrong-way detection logic
            if center_x < prev_x - 25:
                wrong_way = True

            self.wrongway_positions[idx] = center_x

        return wrong_way

    # --------------------------------------------------------
    # 4️⃣ Aggregate Alerts
    # --------------------------------------------------------
    def generate_alerts(self, metrics, detections):
        return {
            "congestion_alert": self.congestion_alert(metrics["congestion_score"]),
            "accident_alert": self.detect_stationary(detections),
            "wrong_way_alert": self.detect_wrong_way(detections),
        }
