import { useState, useEffect } from 'react';

interface Camera {
  id: string;
  last_update: string;
}

const BASE_API = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://127.0.0.1:5001';
const CAMERAS_URL = `${BASE_API.replace(/\/$/, '')}/cameras`;

// Polling interval for cameras list (5 seconds)
const POLLING_INTERVAL = 5000;

export function useCameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch(CAMERAS_URL, { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setCameras(data.cameras || []);
        setIsLoading(false);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch cameras');
        setIsLoading(false);
      }
    };

    fetchCameras();

    const interval = setInterval(fetchCameras, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { cameras, isLoading, error };
}
