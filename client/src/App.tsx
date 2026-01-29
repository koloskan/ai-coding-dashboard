import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, BarChart3, Globe, Megaphone, HelpCircle } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import CriticalAlerts from './components/CriticalAlerts';
import DashboardCharts from './components/DashboardCharts';
import ProblemKeywordsTable from './components/ProblemKeywordsTable';
import RegionalTable from './components/RegionalTable';
import ChannelsTable from './components/ChannelsTable';
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
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Regional Performance</h2>
        <p className="text-gray-600">
          Geographic performance data with drill-down from region → country → city.
        </p>
      </div>
      
      <RegionalTable regionalPerformance={regionalPerformance} isLoading={isLoading} />
    </div>
  );
}

interface CampaignsPageProps {
  channelPerformance: ChannelPerformance[];
  isLoading: boolean;
}

function CampaignsPage({ channelPerformance, isLoading }: CampaignsPageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaigns & Channel Performance</h2>
        <p className="text-gray-600">
          Channel performance metrics with filtering and monthly breakdown.
        </p>
      </div>
      
      <ChannelsTable channelPerformance={channelPerformance} isLoading={isLoading} />
    </div>
  );
}

export default App;
