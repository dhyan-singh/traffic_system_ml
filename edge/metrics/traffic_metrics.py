"""
C1 - Traffic Metrics Module
Converts YOLO detections → actionable traffic metrics
"""

VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

class TrafficMetrics:
    
    @staticmethod
    @staticmethod
    def filter_vehicles(detections):
        """
        Keep only vehicle detections and group them into LIGHT / HEAVY categories
        """
    
        vehicles = []
    
        for det in detections:
            name = det["class_name"]
    
            # Keep only relevant traffic vehicles
            if name not in ["car", "truck", "bus", "motorcycle", "van"]:
                continue
             
            # ✅ Vehicle grouping – Accuracy fix
            if name in ["truck", "bus"]:
                det["vehicle_group"] = "heavy"
            else:
                det["vehicle_group"] = "light"
    
            vehicles.append(det)
    
        return vehicles

    @staticmethod
    def vehicle_count(detections):
        """
        Total vehicles detected.
        """
        return len(detections)

    @staticmethod
    def class_distribution(detections):
        """
        Returns class-wise count: {car: 10, bus: 2, truck: 1}
        """
        dist = {}
        for d in detections:
            cname = VEHICLE_CLASSES.get(d["class_id"], "other")
            dist[cname] = dist.get(cname, 0) + 1
        return dist

    @staticmethod
    def congestion_score(detections, frame_width, frame_height):
        """
        Congestion score = sum of bbox areas / frame area
        Range ~0.0 to 1.0
        """
        frame_area = frame_width * frame_height
        total_area = 0

        for d in detections:
            x1, y1, x2, y2 = d["bbox"]
            area = (x2 - x1) * (y2 - y1)
            total_area += area

        score = total_area / frame_area
        return round(min(score, 1.0), 3)

    @staticmethod
    def lane_wise_count(detections, frame_width):
        """
        Divide frame into 3 virtual lanes (left, middle, right).
        Count vehicles per lane.
        """
        lane_size = frame_width / 3
        lanes = {"left": 0, "middle": 0, "right": 0}

        for d in detections:
            x1, _, x2, _ = d["bbox"]
            center = (x1 + x2) / 2

            if center < lane_size:
                lanes["left"] += 1
            elif center < 2 * lane_size:
                lanes["middle"] += 1
            else:
                lanes["right"] += 1

        return lanes
