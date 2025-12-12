import { WifiOff, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-full inline-flex mb-6">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Connection Error
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {message}
        </p>
        <div className="bg-card border border-border rounded-lg p-4 text-left mb-6">
          <p className="text-xs text-muted-foreground mb-2">Expected endpoint:</p>
          <code className="text-sm font-mono text-primary">
            GET http://127.0.0.1:5001/latest
          </code>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}
