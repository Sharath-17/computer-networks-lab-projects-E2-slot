import { Activity, Gauge, TrendingUp, AlertCircle } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function SidebarRight() {
  const { metrics, selectedMetric, setSelectedMetric, isSimulating } = useNetworkStore();

  const latestMetric = metrics.length > 0 && isSimulating
    ? metrics[metrics.length - 1]
    : {
        latency: 0,
        throughput: 0,
        jitter: 0,
        packetLoss: 0,
      };

  const chartData = isSimulating ? metrics.map((m, index) => ({
    time: index,
    value: m[selectedMetric],
    timestamp: m.timestamp || Date.now(),
  })) : [];

  const metricConfig = {
    latency: {
      label: 'Latency',
      unit: 'ms',
      icon: Activity,
      color: 'text-blue-400',
    },
    throughput: {
      label: 'Throughput',
      unit: 'Mbps',
      icon: TrendingUp,
      color: 'text-green-400',
    },
    jitter: {
      label: 'Jitter',
      unit: 'ms',
      icon: Gauge,
      color: 'text-yellow-400',
    },
    packetLoss: {
      label: 'Packet Loss',
      unit: '%',
      icon: AlertCircle,
      color: 'text-red-400',
    },
  };

  return (
    <div className="w-80 bg-secondary/30 backdrop-blur-md border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Network Metrics</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
            const config = metricConfig[key];
            const Icon = config.icon;
            const isSelected = selectedMetric === key;

            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMetric(key)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary/20 border-primary'
                    : 'bg-secondary/50 border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
                <div className="text-xl font-semibold">
                  {latestMetric[key].toFixed(2)}
                  <span className="text-xs text-muted-foreground ml-1">{config.unit}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-secondary/50 rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium mb-4">
            {metricConfig[selectedMetric].label} Timeline
          </h3>
          {chartData.length > 0 && isSimulating ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--secondary))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              {isSimulating ? 'Waiting for metrics...' : 'No simulation running. Click "Run" to start.'}
            </div>
          )}
        </div>

        {/* Latest Metrics Detail */}
        {isSimulating && metrics.length > 0 && (
          <div className="bg-secondary/50 rounded-lg border border-border p-4">
            <h3 className="text-sm font-medium mb-3">Current Values</h3>
            <div className="space-y-2">
              {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
                const config = metricConfig[key];
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="text-muted-foreground">{config.label}</span>
                    </div>
                    <span className="font-medium">
                      {latestMetric[key].toFixed(2)} {config.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isSimulating && metrics.length === 0 && (
          <div className="bg-secondary/50 rounded-lg border border-border p-4 text-center text-muted-foreground text-sm">
            No simulation running. Click "Run" to start.
          </div>
        )}
      </div>
    </div>
  );
}
