import { Activity } from 'lucide-react';
import { TimeSeriesPoint } from '@/types/traffic';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface CongestionChartProps {
  data: TimeSeriesPoint[];
}

export function CongestionChart({ data }: CongestionChartProps) {
  const chartData = data.map((point, index) => ({
    time: index,
    score: Math.round(point.value * 100),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Congestion Score Over Time
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">Last 60 seconds</span>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCongestion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0}/>
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
              domain={[0, 100]}
              ticks={[0, 35, 65, 100]}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 8%)', 
                border: '1px solid hsl(222, 47%, 16%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)'
              }}
              labelFormatter={(value) => `${value}s ago`}
              formatter={(value: number) => [`${value}%`, 'Congestion']}
            />
            <ReferenceLine 
              y={35} 
              stroke="hsl(142, 72%, 45%)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.5}
            />
            <ReferenceLine 
              y={65} 
              stroke="hsl(0, 72%, 55%)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(38, 92%, 55%)"
              strokeWidth={2}
              fill="url(#colorCongestion)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
