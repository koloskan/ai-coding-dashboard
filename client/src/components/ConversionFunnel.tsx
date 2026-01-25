import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Filter, ArrowRight } from 'lucide-react';

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

interface ConversionFunnelProps {
  latestMetric: MonthlyMetric | null;
  isLoading: boolean;
}

// Funnel stage colors (gradient from blue to green)
const FUNNEL_COLORS = [
  '#3b82f6', // blue-500 - Traffic
  '#6366f1', // indigo-500 - Signups
  '#8b5cf6', // violet-500 - Trials
  '#10b981', // emerald-500 - Conversions
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; percentage: string } }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-medium text-gray-900">{data.value.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-600">
          Rate: <span className="font-medium text-gray-900">{data.percentage}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom label for bars
const renderCustomLabel = (props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}) => {
  const { x = 0, y = 0, width = 0, value = 0 } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 10}
      fill="#374151"
      textAnchor="middle"
      fontSize={14}
      fontWeight={600}
    >
      {value.toLocaleString()}
    </text>
  );
};

export default function ConversionFunnel({ latestMetric, isLoading }: ConversionFunnelProps) {
  if (!latestMetric) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Filter className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for funnel
        </div>
      </div>
    );
  }

  // Calculate conversion rates
  const signupRate = ((latestMetric.unique_signups / latestMetric.website_traffic) * 100).toFixed(1);
  const trialRate = ((latestMetric.trials_started / latestMetric.unique_signups) * 100).toFixed(1);
  const conversionRate = ((latestMetric.paid_conversions / latestMetric.trials_started) * 100).toFixed(1);

  // Prepare funnel data
  const funnelData = [
    {
      name: 'Website Traffic',
      value: latestMetric.website_traffic,
      percentage: '100%',
    },
    {
      name: 'Signups',
      value: latestMetric.unique_signups,
      percentage: `${signupRate}%`,
    },
    {
      name: 'Trials Started',
      value: latestMetric.trials_started,
      percentage: `${trialRate}%`,
    },
    {
      name: 'Paid Conversions',
      value: latestMetric.paid_conversions,
      percentage: `${conversionRate}%`,
    },
  ];

  // Calculate step-by-step conversion rates for the flow indicators
  const flowRates = [
    { from: 'Traffic', to: 'Signups', rate: signupRate },
    { from: 'Signups', to: 'Trials', rate: trialRate },
    { from: 'Trials', to: 'Paid', rate: conversionRate },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Filter className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Funnel</h3>
            <p className="text-sm text-gray-500">
              {latestMetric.month} - Traffic to Paid Conversion Flow
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse w-full h-64 bg-gray-100 rounded-lg"></div>
        </div>
      ) : (
        <>
          {/* Funnel Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value: number) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                >
                  {funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index]} />
                  ))}
                  <LabelList dataKey="value" content={renderCustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Flow Indicators */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {flowRates.map((flow, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{flow.from}</span>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{flow.rate}%</span>
                  </div>
                  <span className="text-sm text-gray-600">{flow.to}</span>
                  {index < flowRates.length - 1 && (
                    <span className="text-gray-300 mx-2">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            {funnelData.map((stage, index) => (
              <div
                key={stage.name}
                className="text-center p-3 rounded-lg"
                style={{ backgroundColor: `${FUNNEL_COLORS[index]}10` }}
              >
                <p className="text-xs text-gray-500 mb-1">{stage.name}</p>
                <p
                  className="text-lg font-bold"
                  style={{ color: FUNNEL_COLORS[index] }}
                >
                  {stage.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
