FROM ultralytics/ultralytics:latest

WORKDIR /app

# System deps for OpenCV GUI-less usage
RUN apt-get update && apt-get install -y libgl1 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV BACKEND_URL=http://backend:5001/update
ENV CAMERA_ID=camera_1
ENV STREAM_URL=0

CMD ["python", "inference/run_inference.py"]
