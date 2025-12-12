import { TrendingUp } from 'lucide-react';
import { TimeSeriesPoint } from '@/types/traffic';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface VehicleCountChartProps {
  data: TimeSeriesPoint[];
}

export function VehicleCountChart({ data }: VehicleCountChartProps) {
  const chartData = data.map((point, index) => ({
    time: index,
    count: point.value,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Vehicle Count Over Time
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">Last 60 seconds</span>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(222, 47%, 16%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              stroke="hsl(215, 20%, 55%)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 8%)', 
                border: '1px solid hsl(222, 47%, 16%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              labelFormatter={(value) => `${value}s ago`}
              formatter={(value: number) => [value, 'Vehicles']}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(174, 72%, 50%)"
              strokeWidth={2}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
