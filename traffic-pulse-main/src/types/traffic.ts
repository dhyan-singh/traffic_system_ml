export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface ClassDistribution {
  car?: number;
  motorcycle?: number;
  bus?: number;
  truck?: number;
  [key: string]: number | undefined;
}

export interface LaneWise {
  left: number;
  middle: number;
  right: number;
}

export interface Metrics {
  vehicle_count: number;
  class_distribution: ClassDistribution;
  congestion_score: number;
  lane_wise: LaneWise;
}

export interface Alerts {
  congestion_alert: boolean;
  accident_alert: boolean;
  wrong_way_alert: boolean;
}

export interface TrafficData {
  fps: number;
  num_detections: number;
  detections: Detection[];
  metrics: Metrics;
  alerts: Alerts;
}

export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
}
