# Traffic System ML - Dockerized Real-Time Traffic Analytics

End-to-end traffic monitoring system with edge AI inference, scalable backend API, and real-time dashboard.

## Architecture

- **Edge**: YOLOv8 inference engine (runs locally on host with camera access)
- **Backend**: Flask API with Redis for horizontal scaling (Dockerized)
- **Frontend**: React + Vite dashboard with real-time polling (Dockerized)
- **Redis**: Shared state store for multi-backend deployment (Dockerized)

## Quick Start

### 1. Start Backend + Frontend (Docker)

```bash
docker compose up --build
```

Access:
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Redis**: localhost:6379

### 2. Run Edge Inference (Local Python)

The edge service runs locally to access camera hardware:

```bash
cd edge
pip install -r requirements.txt
export BACKEND_URL=http://localhost:5001/update
export CAMERA_ID=camera_1
export STREAM_URL=0  # 0 for webcam, or rtsp://your-camera-url
python inference/run_inference.py
```

## Environment Variables

### Backend
- `REDIS_URL`: Redis connection string (default: in-memory fallback)
- `PORT`: Server port (default: 5001)

### Frontend
- `VITE_API_URL`: Backend API URL (build-time arg, default: http://backend:5001)

### Edge
- `BACKEND_URL`: Backend API endpoint (default: http://localhost:5001/update)
- `CAMERA_ID`: Unique camera identifier (default: camera_1)
- `STREAM_URL`: Camera stream (0 for webcam, or rtsp://... for IP camera)

## Scaling Backend

Deploy multiple backend replicas with shared Redis:

```yaml
# docker-compose.override.yml
services:
  backend:
    deploy:
      replicas: 3
```

Or use Docker Swarm / Kubernetes with a load balancer pointing to backend replicas.

## API Endpoints

### POST /update
Edge devices send detection data here. Payload includes `camera_id`.

### GET /latest?camera_id=camera_1
Fetch latest analytics for specific camera.

### GET /cameras
List all active cameras with last update timestamps.

## Development

### Backend Only
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend Only
```bash
cd traffic-pulse-main
npm install
npm run dev
```

### Edge Inference
```bash
cd edge
pip install -r requirements.txt
python inference/run_inference.py
```

## Production Deployment

1. Set `REDIS_URL` to persistent Redis instance (e.g., AWS ElastiCache, Redis Cloud)
2. Configure `VITE_API_URL` to your backend domain
3. Use HTTPS with reverse proxy (Nginx, Traefik, etc.)
4. Add authentication layer between edge and backend
5. Enable CORS restrictions on backend for specific frontend origin

## Troubleshooting

**Edge container fails with camera error:**
- Containers can't access host webcam by default
- Use IP camera with RTSP/HTTP stream URL
- Or run edge inference locally (see Option A above)
- On Linux, uncomment `devices` section and use `--profile edge`

**Frontend shows "Demo Mode":**
- Backend is not reachable or has no data yet
- Start edge inference to send data to backend
- Check `VITE_API_URL` points to correct backend

**Redis connection errors:**
- Backend will gracefully fall back to in-memory storage
- For production, ensure Redis is reachable at `REDIS_URL`

## License

MITan't open camera:**
- Ensure camera is connected and accessible on the host
- For IP cameras, use the full RTSP/HTTP URL in `STREAM_URL`
- Check camera permissions: `ls -l /dev/video*