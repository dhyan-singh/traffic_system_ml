import { Activity, Wifi, WifiOff, FlaskConical } from 'lucide-react';

interface HeaderProps {
  fps: number;
  isConnected: boolean;
  isDemoMode?: boolean;
}

export function Header({ fps, isConnected, isDemoMode }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Edge AI Smart Traffic Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time traffic monitoring & analytics
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isDemoMode && (
            <div className="flex items-center gap-2 bg-warning/10 border border-warning/30 px-3 py-1.5 rounded-lg">
              <FlaskConical className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-warning">Demo Mode</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg">
            <span className="text-sm text-muted-foreground">FPS:</span>
            <span className="font-mono text-lg font-semibold text-primary">
              {fps.toFixed(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <div className="live-indicator w-3 h-3 bg-success rounded-full glow-success" />
                <Wifi className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">LIVE</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-destructive rounded-full" />
                <WifiOff className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
