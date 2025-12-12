import { useTrafficData } from '@/hooks/useTrafficData';
import { Header } from '@/components/dashboard/Header';
import { VehicleCountCard } from '@/components/dashboard/VehicleCountCard';
import { CongestionGauge } from '@/components/dashboard/CongestionGauge';
import { LaneDistribution } from '@/components/dashboard/LaneDistribution';
import { ClassDistribution } from '@/components/dashboard/ClassDistribution';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { VehicleCountChart } from '@/components/dashboard/VehicleCountChart';
import { CongestionChart } from '@/components/dashboard/CongestionChart';
import { DetectionsTable } from '@/components/dashboard/DetectionsTable';
import { HeatmapPlaceholder } from '@/components/dashboard/HeatmapPlaceholder';
import { LoadingState } from '@/components/dashboard/LoadingState';

const Index = () => {
  const { 
    data, 
    isLoading, 
    isConnected,
    isDemoMode,
    vehicleCountHistory,
    congestionHistory 
  } = useTrafficData();

  if (isLoading && !data) {
    return <LoadingState message="Connecting to traffic API..." />;
  }

  const defaultMetrics = {
    vehicle_count: 0,
    class_distribution: {},
    congestion_score: 0,
    lane_wise: { left: 0, middle: 0, right: 0 }
  };

  const defaultAlerts = {
    congestion_alert: false,
    accident_alert: false,
    wrong_way_alert: false
  };

  const metrics = data?.metrics || defaultMetrics;
  const alerts = data?.alerts || defaultAlerts;
  const detections = data?.detections || [];
  const fps = data?.fps || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header fps={fps} isConnected={isConnected} isDemoMode={isDemoMode} />
      
      <main className="p-6 space-y-6">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-center">
            <p className="text-warning text-sm">
              <strong>Demo Mode Active:</strong> Showing simulated traffic data. Connect your backend API at{' '}
              <code className="bg-warning/20 px-2 py-0.5 rounded">http://127.0.0.1:5001/latest</code>{' '}
              for real data.
            </p>
          </div>
        )}

        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <VehicleCountCard count={metrics.vehicle_count} />
          <CongestionGauge score={metrics.congestion_score} />
          <LaneDistribution lanes={metrics.lane_wise} />
          <ClassDistribution distribution={metrics.class_distribution} />
        </section>

        {/* Alerts Panel */}
        <section>
          <AlertsPanel alerts={alerts} />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VehicleCountChart data={vehicleCountHistory} />
          <CongestionChart data={congestionHistory} />
        </section>

        {/* Bottom Two Columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DetectionsTable detections={detections} />
          <HeatmapPlaceholder />
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-4 border-t border-border">
          <p>Edge AI Smart Traffic Monitoring System • Real-time analytics powered by YOLOv8</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
