import { DollarSign, Users, TrendingDown, Wifi, WifiOff } from 'lucide-react';

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

interface DashboardHeaderProps {
  latestMetric: MonthlyMetric | null;
  isConnected: boolean;
  isLoading: boolean;
}

// Format number as currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format number as percentage
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Format number with commas
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

function MetricCard({ title, value, icon, iconBgColor, iconColor }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHeader({ latestMetric, isConnected, isLoading }: DashboardHeaderProps) {
  // DEBUG: Log props received
  console.log('DashboardHeader Props received:', { latestMetric, isConnected, isLoading });
  
  return (
    <div className="mb-8">
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Executive Summary</h1>
          <p className="text-gray-500 mt-1">
            {latestMetric ? `Data for ${latestMetric.month}` : 'Loading metrics...'}
          </p>
        </div>
        
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
          {isConnected ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Connected</span>
            </>
          ) : (
            <>
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-8 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : latestMetric ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total MRR"
            value={formatCurrency(latestMetric.mrr_usd)}
            icon={<DollarSign className="w-6 h-6" />}
            iconBgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <MetricCard
            title="Monthly Signups"
            value={formatNumber(latestMetric.unique_signups)}
            icon={<Users className="w-6 h-6" />}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Churn Rate"
            value={formatPercentage(latestMetric.churn_rate)}
            icon={<TrendingDown className="w-6 h-6" />}
            iconBgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            {isConnected 
              ? 'No metrics data available. Please check if the data files are loaded on the server.'
              : 'Unable to connect to the server. Please ensure the server is running on http://localhost:3001'}
          </p>
        </div>
      )}
    </div>
  );
}
