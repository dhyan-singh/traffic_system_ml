import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export function MetricCard({ title, icon, children, className }: MetricCardProps) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl p-5 transition-all duration-300",
      "hover:border-primary/30 hover:glow-primary",
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
