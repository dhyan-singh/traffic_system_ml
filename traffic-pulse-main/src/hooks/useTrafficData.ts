import { useState, useEffect, useCallback, useRef } from 'react';
import { TrafficData, TimeSeriesPoint } from '@/types/traffic';

// Backend API endpoint
// Backend API endpoint — uses Vite env var VITE_API_URL if present, otherwise localhost for dev
const BASE_API = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:5001';
const API_URL = BASE_API.replace(/\/$/, '') + '/latest';


// Polling interval (1 second)
const POLLING_INTERVAL = 1000;

// Max history for charts
const MAX_HISTORY_POINTS = 60;

// ---------------------------------------------------------------------------
// DEMO DATA (used only when backend is unavailable)
// ---------------------------------------------------------------------------
function generateDemoData(): TrafficData {
  const vehicleCount = Math.floor(Math.random() * 8) + 2;
  const congestionScore = Math.random() * 0.7;

  const classNames = ['car', 'motorcycle', 'bus', 'truck'];

  const detections = Array.from({ length: vehicleCount }, () => {
    const className = classNames[Math.floor(Math.random() * classNames.length)];
    return {
      class_id: classNames.indexOf(className),
      class_name: className,
      confidence: Math.random() * 0.3 + 0.7,
      bbox: [
        Math.floor(Math.random() * 400),
        Math.floor(Math.random() * 300),
        Math.floor(Math.random() * 200),
        Math.floor(Math.random() * 200),
      ] as [number, number, number, number],
    };
  });

  const class_distribution = detections.reduce((acc, det) => {
    acc[det.class_name] = (acc[det.class_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    fps: Math.random() * 5 + 20,
    num_detections: vehicleCount,
    detections,
    metrics: {
      vehicle_count: vehicleCount,
      class_distribution,
      congestion_score: congestionScore,
      lane_wise: {
        left: Math.floor(Math.random() * 4),
        middle: Math.floor(Math.random() * 4),
        right: Math.floor(Math.random() * 4),
      },
    },
    alerts: {
      congestion_alert: congestionScore > 0.65,
      accident_alert: Math.random() > 0.92,
      wrong_way_alert: Math.random() > 0.9,
    },
  };
}

// ---------------------------------------------------------------------------
// MAIN HOOK
// ---------------------------------------------------------------------------
export function useTrafficData() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [vehicleCountHistory, setVehicleCountHistory] = useState<TimeSeriesPoint[]>([]);
  const [congestionHistory, setCongestionHistory] = useState<TimeSeriesPoint[]>([]);

  const failedAttempts = useRef(0);

  // -------------------------------------------------------------------------
  // PUSH NEW HISTORY VALUES
  // -------------------------------------------------------------------------
  const updateHistoryData = useCallback((trafficData: TrafficData) => {
    const now = Date.now();

    if (trafficData.metrics) {
      setVehicleCountHistory(prev => {
        const updated = [...prev, { timestamp: now, value: trafficData.metrics.vehicle_count }];
        return updated.slice(-MAX_HISTORY_POINTS);
      });

      setCongestionHistory(prev => {
        const updated = [...prev, { timestamp: now, value: trafficData.metrics.congestion_score }];
        return updated.slice(-MAX_HISTORY_POINTS);
      });
    }
  }, []);

  // -------------------------------------------------------------------------
  // MAIN FETCH FUNCTION (from backend API)
  // -------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const jsonData = await response.json();

      // Backend running but has no data yet
      if (Object.keys(jsonData).length === 0) {
        setError('Waiting for real-time data...');
        setIsConnected(true);
        return;
      }

      // Valid backend data received
      failedAttempts.current = 0;
      setIsDemoMode(false);
      setIsConnected(true);
      setIsLoading(false);
      setError(null);

      setData(jsonData);
      updateHistoryData(jsonData);

    } catch (err: any) {
      failedAttempts.current += 1;

      // If backend fails 3 times → switch to demo mode
      if (failedAttempts.current >= 3) {
        setIsDemoMode(true);
        setIsConnected(true);   // frontend still running
        setIsLoading(false);
        setError(null);

        const demo = generateDemoData();
        setData(demo);
        updateHistoryData(demo);
      } else {
        setIsConnected(false);
        setError(err.message || 'API connection failed');
      }
    }
  }, [updateHistoryData]);

  // -------------------------------------------------------------------------
  // DEMO MODE CYCLER
  // -------------------------------------------------------------------------
  const generateDemoUpdate = useCallback(() => {
    const demo = generateDemoData();
    setData(demo);
    updateHistoryData(demo);
  }, [updateHistoryData]);

  // -------------------------------------------------------------------------
  // EFFECT → POLLING LOOP
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      if (isDemoMode) {
        generateDemoUpdate();
      } else {
        fetchData();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData, generateDemoUpdate, isDemoMode]);

  // -------------------------------------------------------------------------
  // RETURN VALUES TO FRONTEND
  // -------------------------------------------------------------------------
  return {
    data,
    isLoading,
    error,
    isConnected,
    isDemoMode,
    vehicleCountHistory,
    congestionHistory,
  };
}
