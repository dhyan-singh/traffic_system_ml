import { AlertTriangle, Shield, CarFront, Navigation } from 'lucide-react';
import { Alerts } from '@/types/traffic';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: Alerts;
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <AlertTriangle className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Real-Time Alerts
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Congestion Alert */}
        <div className={cn(
          "rounded-lg p-4 transition-all duration-300 border",
          alerts.congestion_alert 
            ? "bg-destructive/10 border-destructive/50 glow-destructive" 
            : "bg-success/10 border-success/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              alerts.congestion_alert ? "bg-destructive/20" : "bg-success/20"
            )}>
              <CarFront className={cn(
                "h-5 w-5",
                alerts.congestion_alert ? "text-destructive" : "text-success"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-semibold text-sm",
                alerts.congestion_alert ? "text-destructive" : "text-success"
              )}>
                {alerts.congestion_alert ? "High Congestion!" : "Normal Traffic"}
              </p>
              <p className="text-xs text-muted-foreground">
                Congestion Status
              </p>
            </div>
          </div>
        </div>
        
        {/* Accident Alert */}
        <div className={cn(
          "rounded-lg p-4 transition-all duration-300 border",
          alerts.accident_alert 
            ? "bg-destructive/10 border-destructive/50 glow-destructive animate-pulse" 
            : "bg-success/10 border-success/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              alerts.accident_alert ? "bg-destructive/20" : "bg-success/20"
            )}>
              <Shield className={cn(
                "h-5 w-5",
                alerts.accident_alert ? "text-destructive" : "text-success"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-semibold text-sm",
                alerts.accident_alert ? "text-destructive" : "text-success"
              )}>
                {alerts.accident_alert ? "Accident Suspected!" : "No Incidents"}
              </p>
              <p className="text-xs text-muted-foreground">
                Stationary Vehicle Alert
              </p>
            </div>
          </div>
        </div>
        
        {/* Wrong-Way Alert */}
        <div className={cn(
          "rounded-lg p-4 transition-all duration-300 border",
          alerts.wrong_way_alert 
            ? "bg-warning/10 border-warning/50 glow-warning animate-pulse" 
            : "bg-success/10 border-success/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              alerts.wrong_way_alert ? "bg-warning/20" : "bg-success/20"
            )}>
              <Navigation className={cn(
                "h-5 w-5",
                alerts.wrong_way_alert ? "text-warning" : "text-success"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-semibold text-sm",
                alerts.wrong_way_alert ? "text-warning" : "text-success"
              )}>
                {alerts.wrong_way_alert ? "Wrong-Way Vehicle!" : "All Clear"}
              </p>
              <p className="text-xs text-muted-foreground">
                Direction Alert
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
