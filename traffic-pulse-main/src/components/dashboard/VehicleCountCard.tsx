import { Car } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface VehicleCountCardProps {
  count: number;
}

export function VehicleCountCard({ count }: VehicleCountCardProps) {
  return (
    <MetricCard 
      title="Total Vehicles" 
      icon={<Car className="h-4 w-4 text-primary" />}
    >
      <div className="flex flex-col">
        <span className="text-5xl font-bold text-foreground font-mono animate-scale-in">
          {count}
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          Vehicles Detected
        </span>
      </div>
    </MetricCard>
  );
}
