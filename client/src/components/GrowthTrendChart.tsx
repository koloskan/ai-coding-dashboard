import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MonthlyMetric {
  month: string;
  website_traffic: number;
  unique_signups: number;
  trials_started: number;
  paid_conversions: number;
  mrr_usd: number;
  churn_rate: number;
  signup_to_trial_rate: number;
  trial_to_paid_rate: number;
  net_new_mrr: number;
  expansion_mrr: number;
  churned_mrr: number;
}

interface GrowthTrendChartProps {
  monthlyMetrics: MonthlyMetric[];
  isLoading: boolean;
}

// Format large numbers for axis
const formatAxisNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

// Format month for display (e.g., "2024-01" -> "Jan 24")
const formatMonth = (month: string): string => {
  // DEBUG: Log the input month
  console.log('formatMonth input:', month, 'type:', typeof month);
  
  if (!month || typeof month !== 'string') {
    return 'Unknown';
  }
  
  const parts = month.split('-');
  if (parts.length < 2) {
    console.warn('Invalid month format:', month);
    return month; // Return as-is if format is unexpected
  }
  
  const [year, monthNum] = parts;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(monthNum, 10) - 1;
  
  if (monthIndex < 0 || monthIndex > 11 || !year) {
    console.warn('Invalid month index or year:', { month, monthIndex, year });
    return month;
  }
  
  return `${monthNames[monthIndex]} ${year.slice(-2)}`;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload?: Record<string, unknown> }>;
  label?: string | number;
}) => {
  if (active && payload && payload.length) {
    // DEBUG: Log the tooltip data
    console.log('Tooltip payload:', payload);
    console.log('Tooltip label:', label);
    console.log('First payload item:', payload[0]);
    console.log('First payload.payload:', payload[0]?.payload);
    
    // Get the month from the first payload item's data, or fall back to label
    const monthLabel = (payload[0]?.payload?.month as string) || label;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{monthLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GrowthTrendChart({ monthlyMetrics, isLoading }: GrowthTrendChartProps) {
  // Sort by month and take last 12 months
  const chartData = [...monthlyMetrics]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((metric) => ({
      month: formatMonth(metric.month),
      'Website Traffic': metric.website_traffic,
      'Paid Conversions': metric.paid_conversions,
    }));

  // Calculate max values for dual axis scaling
  const maxTraffic = Math.max(...chartData.map((d) => d['Website Traffic']), 0);
  const maxConversions = Math.max(...chartData.map((d) => d['Paid Conversions']), 0);

  // Theme colors matching Tailwind primary palette
  const colors = {
    traffic: '#3b82f6', // blue-500
    conversions: '#10b981', // emerald-500
    grid: '#e5e7eb', // gray-200
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Growth Trend</h3>
          <p className="text-sm text-gray-500">Website Traffic vs Paid Conversions (Last 12 Months)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-full h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: colors.grid }}
                axisLine={{ stroke: colors.grid }}
              />
              {/* Left Y-Axis for Website Traffic */}
              <YAxis
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: colors.grid }}
                axisLine={{ stroke: colors.grid }}
                tickFormatter={formatAxisNumber}
                domain={[0, Math.ceil(maxTraffic * 1.1)]}
                label={{
                  value: 'Traffic',
                  angle: -90,
                  position: 'insideLeft',
                  fill: colors.traffic,
                  fontSize: 12,
                }}
              />
              {/* Right Y-Axis for Paid Conversions */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: colors.grid }}
                axisLine={{ stroke: colors.grid }}
                tickFormatter={formatAxisNumber}
                domain={[0, Math.ceil(maxConversions * 1.1)]}
                label={{
                  value: 'Conversions',
                  angle: 90,
                  position: 'insideRight',
                  fill: colors.conversions,
                  fontSize: 12,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Website Traffic"
                stroke={colors.traffic}
                strokeWidth={2}
                dot={{ fill: colors.traffic, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Paid Conversions"
                stroke={colors.conversions}
                strokeWidth={2}
                dot={{ fill: colors.conversions, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for chart
        </div>
      )}

      {/* Legend explanation */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Website Traffic (Left Axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-600">Paid Conversions (Right Axis)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
