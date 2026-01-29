import { useState, useMemo } from 'react';
import { Megaphone, ArrowUpDown, ArrowDown, ArrowUp, Search, Filter, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

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

interface ChannelsTableProps {
  channelPerformance: ChannelPerformance[];
  isLoading: boolean;
}

type SortField = 'channel' | 'sessions' | 'signups' | 'conversion_rate' | 'bounce_rate';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'summary' | 'monthly';

interface ChannelSummary {
  channel: string;
  totalSessions: number;
  totalSignups: number;
  avgConversionRate: number;
  avgBounceRate: number;
  avgSessionDuration: number;
  avgPagesPerSession: number;
  monthlyData: ChannelPerformance[];
  trend: 'up' | 'down' | 'stable';
  isWasted: boolean;
}

export default function ChannelsTable({ channelPerformance, isLoading }: ChannelsTableProps) {
  const [sortField, setSortField] = useState<SortField>('sessions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [filterWasted, setFilterWasted] = useState(false);

  // Get unique channels
  const channels = useMemo(() => {
    return [...new Set(channelPerformance.map(c => c.channel))].sort();
  }, [channelPerformance]);

  // Get unique months
  const months = useMemo(() => {
    return [...new Set(channelPerformance.map(c => c.month))].sort();
  }, [channelPerformance]);

  // Check if channel is "wasted spend" (high sessions, low conversion)
  const isWastedChannel = (summary: ChannelSummary): boolean => {
    return summary.totalSessions > 5000 && summary.avgConversionRate < 1.5;
  };

  // Calculate channel summaries
  const channelSummaries = useMemo(() => {
    const summaries: Record<string, ChannelSummary> = {};

    channelPerformance.forEach(c => {
      if (!summaries[c.channel]) {
        summaries[c.channel] = {
          channel: c.channel,
          totalSessions: 0,
          totalSignups: 0,
          avgConversionRate: 0,
          avgBounceRate: 0,
          avgSessionDuration: 0,
          avgPagesPerSession: 0,
          monthlyData: [],
          trend: 'stable',
          isWasted: false,
        };
      }
      summaries[c.channel].totalSessions += c.sessions;
      summaries[c.channel].totalSignups += c.signups;
      summaries[c.channel].avgConversionRate += c.conversion_rate;
      summaries[c.channel].avgBounceRate += c.bounce_rate;
      summaries[c.channel].avgSessionDuration += c.avg_session_duration_sec;
      summaries[c.channel].avgPagesPerSession += c.pages_per_session;
      summaries[c.channel].monthlyData.push(c);
    });

    // Calculate averages and trends
    Object.values(summaries).forEach(s => {
      const count = s.monthlyData.length;
      s.avgConversionRate = s.avgConversionRate / count;
      s.avgBounceRate = s.avgBounceRate / count;
      s.avgSessionDuration = s.avgSessionDuration / count;
      s.avgPagesPerSession = s.avgPagesPerSession / count;
      s.isWasted = isWastedChannel(s);

      // Calculate trend (compare last 3 months to previous 3)
      const sortedMonthly = [...s.monthlyData].sort((a, b) => a.month.localeCompare(b.month));
      if (sortedMonthly.length >= 6) {
        const recent = sortedMonthly.slice(-3);
        const previous = sortedMonthly.slice(-6, -3);
        const recentAvg = recent.reduce((sum, m) => sum + m.signups, 0) / 3;
        const previousAvg = previous.reduce((sum, m) => sum + m.signups, 0) / 3;
        if (recentAvg > previousAvg * 1.1) s.trend = 'up';
        else if (recentAvg < previousAvg * 0.9) s.trend = 'down';
      }
    });

    return Object.values(summaries);
  }, [channelPerformance]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...channelSummaries];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => c.channel.toLowerCase().includes(query));
    }

    // Apply wasted filter
    if (filterWasted) {
      result = result.filter(c => c.isWasted);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'channel':
          comparison = a.channel.localeCompare(b.channel);
          break;
        case 'sessions':
          comparison = a.totalSessions - b.totalSessions;
          break;
        case 'signups':
          comparison = a.totalSignups - b.totalSignups;
          break;
        case 'conversion_rate':
          comparison = a.avgConversionRate - b.avgConversionRate;
          break;
        case 'bounce_rate':
          comparison = a.avgBounceRate - b.avgBounceRate;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [channelSummaries, searchQuery, filterWasted, sortField, sortDirection]);

  // Get monthly data for selected channel
  const selectedChannelData = useMemo(() => {
    if (!selectedChannel) return [];
    const summary = channelSummaries.find(c => c.channel === selectedChannel);
    return summary?.monthlyData.sort((a, b) => b.month.localeCompare(a.month)) || [];
  }, [channelSummaries, selectedChannel]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'desc' 
      ? <ArrowDown className="w-4 h-4 text-primary-600" />
      : <ArrowUp className="w-4 h-4 text-primary-600" />;
  };

  // Count wasted channels
  const wastedCount = channelSummaries.filter(c => c.isWasted).length;

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Megaphone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
            <p className="text-sm text-gray-500">
              {wastedCount > 0 ? (
                <span className="text-amber-600 font-medium">
                  {wastedCount} channels with wasted spend detected
                </span>
              ) : (
                'Marketing channel analytics and ROI'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode('summary');
                setSelectedChannel(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'summary'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters || filterWasted
                ? 'bg-primary-50 text-primary-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {filterWasted && <span className="w-2 h-2 bg-primary-500 rounded-full"></span>}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search channels..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Wasted Filter */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={filterWasted}
                  onChange={(e) => setFilterWasted(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show only wasted spend</span>
              </label>
            </div>

            {/* Clear */}
            {(searchQuery || filterWasted) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterWasted(false);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterWasted(false)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            !filterWasted
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Channels ({channelSummaries.length})
        </button>
        <button
          onClick={() => setFilterWasted(true)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filterWasted
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          🔥 Wasted Spend ({wastedCount})
        </button>
      </div>

      {/* Channel Selection for Monthly View */}
      {viewMode === 'monthly' && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Select Channel</label>
          <select
            value={selectedChannel || ''}
            onChange={(e) => setSelectedChannel(e.target.value || null)}
            className="w-full max-w-xs px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="">Choose a channel...</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>{channel}</option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Table */}
      {viewMode === 'summary' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('channel')}
                    className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                  >
                    Channel
                    <SortIcon field="channel" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('sessions')}
                    className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                  >
                    Sessions
                    <SortIcon field="sessions" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('signups')}
                    className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                  >
                    Signups
                    <SortIcon field="signups" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('conversion_rate')}
                    className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                  >
                    Conv. Rate
                    <SortIcon field="conversion_rate" />
                  </button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  <button
                    onClick={() => handleSort('bounce_rate')}
                    className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                  >
                    Bounce Rate
                    <SortIcon field="bounce_rate" />
                  </button>
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No channels match your filters
                  </td>
                </tr>
              ) : (
                filteredData.map((channel, index) => (
                  <tr
                    key={`${channel.channel}-${index}`}
                    className={`border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${
                      channel.isWasted ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedChannel(channel.channel);
                      setViewMode('monthly');
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {channel.isWasted && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className={`text-sm font-medium ${channel.isWasted ? 'text-amber-900' : 'text-gray-900'}`}>
                          {channel.channel}
                        </span>
                        {channel.isWasted && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded">
                            Wasted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {channel.totalSessions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {channel.totalSignups.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${
                      channel.avgConversionRate < 1.5 ? 'text-amber-700' : 
                      channel.avgConversionRate > 3 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {channel.avgConversionRate.toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-right text-sm ${
                      channel.avgBounceRate > 60 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {channel.avgBounceRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {channel.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <TrendingUp className="w-4 h-4" />
                          Up
                        </span>
                      )}
                      {channel.trend === 'down' && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600">
                          <TrendingDown className="w-4 h-4" />
                          Down
                        </span>
                      )}
                      {channel.trend === 'stable' && (
                        <span className="text-xs text-gray-400">Stable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Table */}
      {viewMode === 'monthly' && selectedChannel && (
        <div className="overflow-x-auto">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{selectedChannel} - Monthly Breakdown</h4>
            <p className="text-sm text-gray-500">Detailed performance by month</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Sessions</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Signups</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conv. Rate</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bounce Rate</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg. Duration</th>
              </tr>
            </thead>
            <tbody>
              {selectedChannelData.map((data, index) => (
                <tr
                  key={`${data.month}-${index}`}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{data.month}</td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900">
                    {data.sessions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-900">
                    {data.signups.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-medium ${
                    data.conversion_rate < 1.5 ? 'text-amber-700' : 
                    data.conversion_rate > 3 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {data.conversion_rate.toFixed(2)}%
                  </td>
                  <td className={`py-3 px-4 text-right text-sm ${
                    data.bounce_rate > 60 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {data.bounce_rate.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-600">
                    {formatDuration(data.avg_session_duration_sec)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'monthly' && !selectedChannel && (
        <div className="py-12 text-center text-gray-500">
          <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a channel above to view monthly breakdown</p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>
          {viewMode === 'summary' 
            ? `Showing ${filteredData.length} of ${channelSummaries.length} channels`
            : selectedChannel 
              ? `${selectedChannelData.length} months of data`
              : 'Select a channel to view details'
          }
        </span>
        <div className="flex items-center gap-4">
          <span>
            Total Sessions: <span className="font-medium text-gray-900">
              {filteredData.reduce((sum, c) => sum + c.totalSessions, 0).toLocaleString()}
            </span>
          </span>
          <span>
            Total Signups: <span className="font-medium text-green-600">
              {filteredData.reduce((sum, c) => sum + c.totalSignups, 0).toLocaleString()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
