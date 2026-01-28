import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, BarChart3, Globe, Megaphone, HelpCircle } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import CriticalAlerts from './components/CriticalAlerts';
import DashboardCharts from './components/DashboardCharts';
import ProblemKeywordsTable from './components/ProblemKeywordsTable';
import HelpModal from './components/HelpModal';

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Types
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

interface RegionalPerformance {
  region: string;
  country: string;
  city: string;
  month: string;
  organic_traffic: number;
  paid_traffic: number;
  total_traffic: number;
  trials_started: number;
  paid_conversions: number;
  trial_to_paid_rate: number;
  mrr_usd: number;
  cac_usd: number;
  ltv_usd: number;
}

interface ChannelPerformance {
  month: string;
  channel: string;
  sessions: number;
  signups: number;
  conversion_rate: number;
  avg_session_duration_sec: number;
  bounce_rate: number;
  pages_per_session: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

function App() {
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetric[]>([]);
  const [regionalPerformance, setRegionalPerformance] = useState<RegionalPerformance[]>([]);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const location = useLocation();

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch monthly metrics
        const metricsResponse = await axios.get<ApiResponse<MonthlyMetric[]>>(
          `${API_BASE_URL}/monthly-metrics`
        );
        
        // DEBUG: Log the full API response
        console.log('Raw API Response:', metricsResponse.data);
        
        if (metricsResponse.data.success) {
          const metricsData = metricsResponse.data.data;
          
          // DEBUG: Log the data array
          console.log('Metrics Data Array:', metricsData);
          console.log('Array length:', metricsData.length);
          
          // DEBUG: Log the last item (latest month)
          if (metricsData.length > 0) {
            const latestMonth = metricsData[metricsData.length - 1];
            console.log('Latest Month Object:', latestMonth);
            console.log('Latest Month Keys:', Object.keys(latestMonth));
          }
          
          setMonthlyMetrics(metricsData);
        }

        // Fetch regional performance
        const regionalResponse = await axios.get<ApiResponse<RegionalPerformance[]>>(
          `${API_BASE_URL}/regional-performance`
        );
        if (regionalResponse.data.success) {
          setRegionalPerformance(regionalResponse.data.data);
        }

        // Fetch channel performance
        const channelResponse = await axios.get<ApiResponse<ChannelPerformance[]>>(
          `${API_BASE_URL}/channel-performance`
        );
        if (channelResponse.data.success) {
          setChannelPerformance(channelResponse.data.data);
        }

        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Poll for connection status every 30 seconds
    const interval = setInterval(async () => {
      try {
        await axios.get(`${API_BASE_URL}/status`);
        setIsConnected(true);
      } catch {
        setIsConnected(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get the most recent month's data
  const latestMetric = monthlyMetrics.length > 0 
    ? monthlyMetrics.sort((a, b) => b.month.localeCompare(a.month))[0]
    : null;

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/regional', label: 'Regional', icon: Globe },
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Marketing Dashboard
                </h1>
              </div>
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-accent-600 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Open user guide"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">How to Use</span>
              </button>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-accent-50 text-accent-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                latestMetric={latestMetric}
                isConnected={isConnected}
                isLoading={isLoading}
                monthlyMetrics={monthlyMetrics}
                regionalPerformance={regionalPerformance}
                channelPerformance={channelPerformance}
              />
            }
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/regional" element={<RegionalPage regionalPerformance={regionalPerformance} isLoading={isLoading} />} />
          <Route path="/campaigns" element={<CampaignsPage channelPerformance={channelPerformance} isLoading={isLoading} />} />
        </Routes>
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

// Dashboard Page Component
interface DashboardProps {
  latestMetric: MonthlyMetric | null;
  isConnected: boolean;
  isLoading: boolean;
  monthlyMetrics: MonthlyMetric[];
  regionalPerformance: RegionalPerformance[];
  channelPerformance: ChannelPerformance[];
}

function Dashboard({ latestMetric, isConnected, isLoading, monthlyMetrics, regionalPerformance, channelPerformance }: DashboardProps) {
  return (
    <div>
      <DashboardHeader
        latestMetric={latestMetric}
        isConnected={isConnected}
        isLoading={isLoading}
        monthlyMetrics={monthlyMetrics}
      />

      {/* Critical Alerts Section */}
      <div className="mt-8">
        <CriticalAlerts
          monthlyMetrics={monthlyMetrics}
          regionalPerformance={regionalPerformance}
          channelPerformance={channelPerformance}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <DashboardCharts
          monthlyMetrics={monthlyMetrics}
          isLoading={isLoading}
        />
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Monthly Trends Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          {monthlyMetrics.length > 0 ? (
            <div className="space-y-4">
              {[...monthlyMetrics]
                .sort((a, b) => b.month.localeCompare(a.month))
                .slice(0, 6)
                .map((metric) => (
                  <div key={metric.month} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{metric.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">
                        ${metric.mrr_usd.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {metric.unique_signups} signups
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          {latestMetric ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Website Traffic</p>
                <p className="text-xl font-bold text-gray-900">
                  {latestMetric.website_traffic.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Trials Started</p>
                <p className="text-xl font-bold text-gray-900">
                  {latestMetric.trials_started.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Paid Conversions</p>
                <p className="text-xl font-bold text-gray-900">
                  {latestMetric.paid_conversions.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Trial to Paid Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  {latestMetric.trial_to_paid_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Analytics Page with Keywords Table
function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
        <p className="text-gray-600">
          Detailed keyword performance, traffic analysis, and conversion metrics.
        </p>
      </div>
      
      {/* Problem Keywords Table */}
      <ProblemKeywordsTable />
    </div>
  );
}

interface RegionalPageProps {
  regionalPerformance: RegionalPerformance[];
  isLoading: boolean;
}

function RegionalPage({ regionalPerformance, isLoading }: RegionalPageProps) {
  // Group by region
  const regionSummary = regionalPerformance.reduce((acc, r) => {
    if (!acc[r.region]) {
      acc[r.region] = {
        totalTraffic: 0,
        totalTrials: 0,
        totalConversions: 0,
        totalMRR: 0,
        count: 0,
      };
    }
    acc[r.region].totalTraffic += r.total_traffic;
    acc[r.region].totalTrials += r.trials_started;
    acc[r.region].totalConversions += r.paid_conversions;
    acc[r.region].totalMRR += r.mrr_usd;
    acc[r.region].count += 1;
    return acc;
  }, {} as Record<string, { totalTraffic: number; totalTrials: number; totalConversions: number; totalMRR: number; count: number }>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Regional Performance</h2>
        <p className="text-gray-600 mb-6">
          Geographic performance data and market analysis by region.
        </p>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(regionSummary).map(([region, data]) => (
              <div key={region} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{region}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Traffic: <span className="font-medium text-gray-900">{data.totalTraffic.toLocaleString()}</span>
                  </p>
                  <p className="text-gray-600">
                    Trials: <span className="font-medium text-gray-900">{data.totalTrials.toLocaleString()}</span>
                  </p>
                  <p className="text-gray-600">
                    Conversions: <span className="font-medium text-gray-900">{data.totalConversions.toLocaleString()}</span>
                  </p>
                  <p className="text-gray-600">
                    MRR: <span className="font-medium text-green-600">${data.totalMRR.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CampaignsPageProps {
  channelPerformance: ChannelPerformance[];
  isLoading: boolean;
}

function CampaignsPage({ channelPerformance, isLoading }: CampaignsPageProps) {
  // Group by channel and calculate totals
  const channelSummary = channelPerformance.reduce((acc, c) => {
    if (!acc[c.channel]) {
      acc[c.channel] = {
        totalSessions: 0,
        totalSignups: 0,
        avgConversionRate: 0,
        avgBounceRate: 0,
        avgSessionDuration: 0,
        count: 0,
      };
    }
    acc[c.channel].totalSessions += c.sessions;
    acc[c.channel].totalSignups += c.signups;
    acc[c.channel].avgConversionRate += c.conversion_rate;
    acc[c.channel].avgBounceRate += c.bounce_rate;
    acc[c.channel].avgSessionDuration += c.avg_session_duration_sec;
    acc[c.channel].count += 1;
    return acc;
  }, {} as Record<string, { totalSessions: number; totalSignups: number; avgConversionRate: number; avgBounceRate: number; avgSessionDuration: number; count: number }>);

  // Calculate averages
  Object.keys(channelSummary).forEach(channel => {
    const data = channelSummary[channel];
    data.avgConversionRate = data.avgConversionRate / data.count;
    data.avgBounceRate = data.avgBounceRate / data.count;
    data.avgSessionDuration = data.avgSessionDuration / data.count;
  });

  // Sort channels by total sessions
  const sortedChannels = Object.entries(channelSummary)
    .sort(([, a], [, b]) => b.totalSessions - a.totalSessions);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaigns & Channel Performance</h2>
        <p className="text-gray-600">
          Channel performance metrics and campaign analytics.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Channel Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedChannels.map(([channel, data]) => {
              const isLowConversion = data.avgConversionRate < 2;
              return (
                <div
                  key={channel}
                  className={`bg-white rounded-xl shadow-sm border p-6 ${
                    isLowConversion ? 'border-red-200 bg-red-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{channel}</h3>
                    {isLowConversion && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Low Conversion
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Sessions</p>
                      <p className="text-lg font-bold text-gray-900">
                        {data.totalSessions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Signups</p>
                      <p className="text-lg font-bold text-gray-900">
                        {data.totalSignups.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Conversion Rate</p>
                      <p className={`text-lg font-bold ${isLowConversion ? 'text-red-600' : 'text-green-600'}`}>
                        {data.avgConversionRate.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bounce Rate</p>
                      <p className="text-lg font-bold text-gray-900">
                        {data.avgBounceRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Avg Session Duration: <span className="font-medium text-gray-900">
                        {Math.floor(data.avgSessionDuration / 60)}m {Math.floor(data.avgSessionDuration % 60)}s
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Channel Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Channel Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Signups</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bounce Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...channelPerformance]
                    .sort((a, b) => b.month.localeCompare(a.month) || b.sessions - a.sessions)
                    .slice(0, 20)
                    .map((row, idx) => {
                      const isLowConversion = row.conversion_rate < 2;
                      return (
                        <tr key={`${row.month}-${row.channel}-${idx}`} className={isLowConversion ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.month}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.channel}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.sessions.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.signups.toLocaleString()}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${isLowConversion ? 'text-red-600' : 'text-green-600'}`}>
                            {row.conversion_rate.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{row.bounce_rate.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
