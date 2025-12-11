"""
A5 - Minimal Camera Stream Test
Reads phone IP camera stream and shows live preview.
"""

import cv2

def test_stream(url):
    print(f"[INFO] Trying to open stream: {url}")
    cap = cv2.VideoCapture(url)

    if not cap.isOpened():
        print("[ERROR] Failed to open stream.")
        return

    print("[INFO] Stream opened successfully. Press 'q' to exit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Can't read frame. Stream broken.")
            break

        cv2.imshow("A5 Stream Test", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    # Replace with your phone camera URL
    # stream_url = "http://192.0.0.2:8080/video"
    stream_url = "http://10.243.180.15:8080/video"
    test_stream(stream_url)
