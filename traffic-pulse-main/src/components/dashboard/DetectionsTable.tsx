import { List } from 'lucide-react';
import { Detection } from '@/types/traffic';
import { cn } from '@/lib/utils';

interface DetectionsTableProps {
  detections: Detection[];
}

export function DetectionsTable({ detections }: DetectionsTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <List className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Live Detections
        </h3>
        <span className="ml-auto text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
          {detections.length} objects
        </span>
      </div>
      
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium mb-2 px-2">
          <span>Class</span>
          <span className="text-center">Confidence</span>
          <span className="text-right">BBox (x1,y1,x2,y2)</span>
        </div>
        
        <div className="h-[200px] overflow-y-auto pr-1">
          <div className="space-y-1">
            {detections.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No detections
              </div>
            ) : (
              detections.map((detection, index) => (
                <div 
                  key={index}
                  className={cn(
                    "grid grid-cols-3 gap-2 text-sm p-2 rounded-lg",
                    "bg-secondary/50 hover:bg-secondary transition-colors",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="font-medium text-foreground capitalize">
                    {detection.class_name}
                  </span>
                  <span className="text-center">
                    <span className={cn(
                      "font-mono px-2 py-0.5 rounded text-xs",
                      detection.confidence >= 0.8 
                        ? "bg-success/20 text-success" 
                        : detection.confidence >= 0.5 
                          ? "bg-warning/20 text-warning"
                          : "bg-destructive/20 text-destructive"
                    )}>
                      {(detection.confidence * 100).toFixed(1)}%
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground text-right">
                    [{detection.bbox.join(', ')}]
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
