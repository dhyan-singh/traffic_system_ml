import { Map } from "lucide-react";

const STREAM_URL = "http://127.0.0.1:5001/video_feed";

export function HeatmapPlaceholder() {
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
          src={STREAM_URL}
          alt="Live Traffic Stream"
          className="w-full h-full object-contain"
        />
      </div>

    </div>
  );
}
