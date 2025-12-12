import { Loader2, Radio } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Connecting to API...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative p-6 bg-card border border-border rounded-full">
            <Radio className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">{message}</span>
        </div>
      </div>
    </div>
  );
}
