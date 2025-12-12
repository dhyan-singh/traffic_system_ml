import { Map } from "lucide-react";

const BASE_STREAM_URL = "http://127.0.0.1:5001/video_feed";

interface HeatmapPlaceholderProps {
  cameraId?: string;
}

export function HeatmapPlaceholder({ cameraId = 'default' }: HeatmapPlaceholderProps) {
  const streamUrl = `${BASE_STREAM_URL}?camera_id=${cameraId}`;

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <Map className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Congestion Heatmap (Live)
        </h3>
      </div>

      {/* Live Video Stream */}
      <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl border bg-black">
        <img
          src={streamUrl}
          alt="Live Traffic Stream"
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  );
}
