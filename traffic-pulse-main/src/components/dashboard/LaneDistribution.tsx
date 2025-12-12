import { Columns3 } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { LaneWise } from '@/types/traffic';
import { cn } from '@/lib/utils';

interface LaneDistributionProps {
  lanes: LaneWise;
}

export function LaneDistribution({ lanes }: LaneDistributionProps) {
  const maxValue = Math.max(lanes.left, lanes.middle, lanes.right, 1);
  
  const laneData = [
    { label: 'Left', value: lanes.left, color: 'bg-chart-1' },
    { label: 'Middle', value: lanes.middle, color: 'bg-chart-2' },
    { label: 'Right', value: lanes.right, color: 'bg-chart-3' },
  ];
  
  return (
    <MetricCard 
      title="Lane Distribution" 
      icon={<Columns3 className="h-4 w-4 text-primary" />}
    >
      <div className="flex items-end justify-center gap-6 h-32">
        {laneData.map((lane) => (
          <div key={lane.label} className="flex flex-col items-center gap-2">
            <span className="font-mono font-bold text-foreground text-lg">
              {lane.value}
            </span>
            <div className="w-12 bg-muted rounded-t-md overflow-hidden relative" style={{ height: '80px' }}>
              <div 
                className={cn(
                  "absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-500 ease-out",
                  lane.color
                )}
                style={{ 
                  height: `${(lane.value / maxValue) * 100}%`,
                  minHeight: lane.value > 0 ? '8px' : '0px'
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {lane.label}
            </span>
          </div>
        ))}
      </div>
    </MetricCard>
  );
}
