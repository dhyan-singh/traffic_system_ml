"""
B4 - Export YOLOv8n to ONNX for edge optimization
"""

from ultralytics import YOLO

if __name__ == "__main__":
    model = YOLO("yolov8n.pt")

    print("[INFO] Exporting to ONNX...")
    model.export(
        format="onnx",
        opset=12,
        simplify=True,
        dynamic=True
    )

    print("[INFO] ONNX export finished!")
