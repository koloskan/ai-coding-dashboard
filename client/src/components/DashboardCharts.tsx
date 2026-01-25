import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
} from 'recharts';
import { TrendingUp, Filter } from 'lucide-react';

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

interface DashboardChartsProps {
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
  if (!month || typeof month !== 'string') {
    return 'Unknown';
  }
  
  const parts = month.split('-');
  if (parts.length < 2) {
    return month;
  }
  
  const [year, monthNum] = parts;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(monthNum, 10) - 1;
  
  if (monthIndex < 0 || monthIndex > 11 || !year) {
    return month;
  }
  
  return `${monthNames[monthIndex]} ${year.slice(-2)}`;
};

// Custom tooltip for the trend chart
const TrendTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload?: Record<string, unknown> }>;
  label?: string | number;
}) => {
  if (active && payload && payload.length) {
    const monthLabel = (payload[0]?.payload?.month as string) || label;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{monthLabel}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toLocaleString() || 0}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for the funnel chart
const FunnelTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload?: { stage: string; users: number } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data?.stage}</p>
        <p className="text-sm text-gray-600">
          Users: <span className="font-medium text-gray-900">{data?.users?.toLocaleString() || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ monthlyMetrics, isLoading }: DashboardChartsProps) {
  // Check if data exists
  if (!monthlyMetrics || monthlyMetrics.length === 0) {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-80 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-80 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-800">No chart data available</p>
      </div>
    );
  }

  // Prepare trend chart data - sort by month and format
  const trendData = [...monthlyMetrics]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((metric) => ({
      month: formatMonth(metric.month),
      website_traffic: metric.website_traffic,
      paid_conversions: metric.paid_conversions,
    }));

  // Get the most recent month for funnel chart
  const sortedMetrics = [...monthlyMetrics].sort((a, b) => b.month.localeCompare(a.month));
  const latestMetric = sortedMetrics[0];

  // Prepare funnel chart data
  const funnelData = latestMetric ? [
    { stage: 'Website Traffic', users: latestMetric.website_traffic },
    { stage: 'Signups', users: latestMetric.unique_signups },
    { stage: 'Trials Started', users: latestMetric.trials_started },
    { stage: 'Paid Conversions', users: latestMetric.paid_conversions },
  ] : [];

  // Funnel bar colors
  const funnelColors = ['#60a5fa', '#818cf8', '#a78bfa', '#34d399'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trend Chart - ComposedChart with Bar and Line */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Traffic & Conversions Trend</h3>
            <p className="text-sm text-gray-500">Last 12 months performance</p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              {/* Left Y-Axis for Paid Conversions (Line) */}
              <YAxis
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatAxisNumber}
                label={{
                  value: 'Conversions',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#10b981',
                  fontSize: 11,
                }}
              />
              {/* Right Y-Axis for Website Traffic (Bar) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatAxisNumber}
                label={{
                  value: 'Traffic',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#60a5fa',
                  fontSize: 11,
                }}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {/* Bar for Website Traffic - Right Axis */}
              <Bar
                yAxisId="right"
                dataKey="website_traffic"
                name="Website Traffic"
                fill="#60a5fa"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
              />
              {/* Line for Paid Conversions - Left Axis */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="paid_conversions"
                name="Paid Conversions"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel Chart - BarChart for most recent month */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Filter className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
            <p className="text-sm text-gray-500">
              {latestMetric ? formatMonth(latestMetric.month) : 'Latest month'} - User journey stages
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="stage"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{
                  value: 'Stage',
                  position: 'insideBottom',
                  offset: -5,
                  fill: '#6b7280',
                  fontSize: 12,
                }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatAxisNumber}
                label={{
                  value: 'Users',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#6b7280',
                  fontSize: 12,
                }}
              />
              <Tooltip content={<FunnelTooltip />} />
              <Bar
                dataKey="users"
                name="Users"
                radius={[8, 8, 0, 0]}
              >
                {funnelData.map((_, index) => (
                  <rect key={`bar-${index}`} fill={funnelColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Summary Stats */}
        {latestMetric && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-2 text-center">
              {funnelData.map((item, index) => (
                <div key={item.stage} className="p-2">
                  <p className="text-xs text-gray-500 truncate">{item.stage}</p>
                  <p className="text-sm font-bold" style={{ color: funnelColors[index] }}>
                    {item.users.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
