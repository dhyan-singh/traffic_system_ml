import { Gauge } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { cn } from '@/lib/utils';

interface CongestionGaugeProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score <= 0.35) return 'bg-success';
  if (score <= 0.65) return 'bg-warning';
  return 'bg-destructive';
}

function getScoreTextColor(score: number): string {
  if (score <= 0.35) return 'text-success';
  if (score <= 0.65) return 'text-warning';
  return 'text-destructive';
}

function getScoreLabel(score: number): string {
  if (score <= 0.35) return 'Low';
  if (score <= 0.65) return 'Moderate';
  return 'High';
}

export function CongestionGauge({ score }: CongestionGaugeProps) {
  const percentage = Math.round(score * 100);
  
  return (
    <MetricCard 
      title="Congestion Score" 
      icon={<Gauge className="h-4 w-4 text-primary" />}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <span className={cn(
            "text-4xl font-bold font-mono animate-scale-in",
            getScoreTextColor(score)
          )}>
            {percentage}%
          </span>
          <span className={cn(
            "text-sm font-medium mb-1 px-2 py-0.5 rounded-full",
            score <= 0.35 && "bg-success/20 text-success",
            score > 0.35 && score <= 0.65 && "bg-warning/20 text-warning",
            score > 0.65 && "bg-destructive/20 text-destructive"
          )}>
            {getScoreLabel(score)}
          </span>
        </div>
        
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
              getScoreColor(score)
            )}
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex">
            <div className="w-[35%] border-r border-background/50" />
            <div className="w-[30%] border-r border-background/50" />
            <div className="flex-1" />
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>35%</span>
          <span>65%</span>
          <span>100%</span>
        </div>
      </div>
    </MetricCard>
  );
}
