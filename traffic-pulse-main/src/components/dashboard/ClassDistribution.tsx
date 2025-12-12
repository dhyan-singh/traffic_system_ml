import { PieChart } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ClassDistribution as ClassDistributionType } from '@/types/traffic';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ClassDistributionProps {
  distribution: ClassDistributionType;
}

const COLORS = [
  'hsl(174, 72%, 50%)', // primary - car
  'hsl(142, 72%, 45%)', // success - motorcycle
  'hsl(38, 92%, 55%)',  // warning - bus
  'hsl(270, 72%, 55%)', // purple - truck
];

const CLASS_LABELS: Record<string, string> = {
  car: 'Car',
  motorcycle: 'Motorcycle',
  bus: 'Bus',
  truck: 'Truck',
};

export function ClassDistribution({ distribution }: ClassDistributionProps) {
  const data = Object.entries(distribution)
    .filter(([_, value]) => value !== undefined && value > 0)
    .map(([key, value]) => ({
      name: CLASS_LABELS[key] || key,
      value: value as number,
    }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <MetricCard 
        title="Class Distribution" 
        icon={<PieChart className="h-4 w-4 text-primary" />}
      >
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
          No vehicles detected
        </div>
      </MetricCard>
    );
  }

  return (
    <MetricCard 
      title="Class Distribution" 
      icon={<PieChart className="h-4 w-4 text-primary" />}
    >
      <div className="flex items-center gap-4">
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-col gap-1.5 flex-1">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-muted-foreground flex-1">{item.name}</span>
              <span className="font-mono font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </MetricCard>
  );
}
