import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { AlertTriangle, ArrowUpDown, ArrowDown, ArrowUp, Bot, Info, Filter, X, Search } from 'lucide-react';

interface KeywordData {
  keyword: string;
  category: string;
  traffic_2024: number;
  traffic_2025: number;
  traffic_change_pct: number;
  position_2024: number;
  position_2025: number;
  position_change: number;
  signups_2024: number;
  signups_2025: number;
  conversion_rate_2024: number;
  conversion_rate_2025: number;
  ai_overview_triggered: string;
  difficulty_score: number;
  cpc_usd: number;
}

interface ApiResponse {
  success: boolean;
  data: KeywordData[];
  count?: number;
}

const API_BASE_URL = 'http://localhost:3001/api';

// Check if a keyword is "wasted traffic" (high traffic, low conversion)
const isWastedTraffic = (keyword: KeywordData): boolean => {
  return keyword.traffic_2025 > 2000 && keyword.conversion_rate_2025 < 1.5;
};

// Check if keyword is educational content (susceptible to AI Overview cannibalization)
const isEducationalContent = (keyword: KeywordData): boolean => {
  const educationalPatterns = ['how to', 'tutorial', 'guide', 'what is', 'learn', 'beginner', 'basics', 'introduction', 'explained'];
  const keywordLower = keyword.keyword.toLowerCase();
  return educationalPatterns.some(pattern => keywordLower.includes(pattern));
};

// Check if keyword is declining due to AI Overview (educational + declining 10-35% YoY)
const isAIOverviewCannibalized = (keyword: KeywordData): boolean => {
  const isEducational = isEducationalContent(keyword);
  const decline = keyword.traffic_change_pct;
  // Decline between -10% and -35%
  return isEducational && decline <= -10 && decline >= -35;
};

type SortField = 'traffic' | 'conversion' | 'change';
type SortDirection = 'asc' | 'desc' | null;
type FilterType = 'all' | 'wasted' | 'ai_cannibalized' | 'ai_triggered' | 'educational';

export default function ProblemKeywordsTable() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('traffic');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch keywords data
  useEffect(() => {
    const fetchKeywords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ApiResponse>(`${API_BASE_URL}/keywords`);
        if (response.data.success) {
          setKeywords(response.data.data);
        } else {
          setError('Failed to load keywords data');
        }
      } catch (err) {
        console.error('Error fetching keywords:', err);
        setError('Unable to connect to server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywords();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(keywords.map(k => k.category))].filter(Boolean).sort();
    return cats;
  }, [keywords]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection(null);
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort keywords
  const filteredAndSortedKeywords = useMemo(() => {
    let result = [...keywords];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(k => 
        k.keyword.toLowerCase().includes(query) ||
        k.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(k => k.category === categoryFilter);
    }

    // Apply type filter
    switch (filterType) {
      case 'wasted':
        result = result.filter(isWastedTraffic);
        break;
      case 'ai_cannibalized':
        result = result.filter(isAIOverviewCannibalized);
        break;
      case 'ai_triggered':
        result = result.filter(k => k.ai_overview_triggered === 'Yes');
        break;
      case 'educational':
        result = result.filter(isEducationalContent);
        break;
    }

    // Apply sorting
    if (sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'traffic':
            comparison = a.traffic_2025 - b.traffic_2025;
            break;
          case 'conversion':
            comparison = a.conversion_rate_2025 - b.conversion_rate_2025;
            break;
          case 'change':
            comparison = a.traffic_change_pct - b.traffic_change_pct;
            break;
        }
        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [keywords, searchQuery, categoryFilter, filterType, sortField, sortDirection]);

  // Count problem keywords (from full dataset)
  const wastedTrafficCount = keywords.filter(isWastedTraffic).length;
  const aiCannibalizedCount = keywords.filter(isAIOverviewCannibalized).length;
  const aiTriggeredCount = keywords.filter(k => k.ai_overview_triggered === 'Yes').length;
  const educationalCount = keywords.filter(isEducationalContent).length;

  // Clear all filters
  const clearFilters = () => {
    setFilterType('all');
    setCategoryFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = filterType !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== '';

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field || sortDirection === null) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'desc' 
      ? <ArrowDown className="w-4 h-4 text-primary-600" />
      : <ArrowUp className="w-4 h-4 text-primary-600" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-60 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Problem Keywords</h3>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Problem Keywords</h3>
            <p className="text-sm text-gray-500">
              {wastedTrafficCount > 0 || aiCannibalizedCount > 0 ? (
                <span>
                  {wastedTrafficCount > 0 && (
                    <span className="text-red-600 font-medium">
                      {wastedTrafficCount} wasted traffic
                    </span>
                  )}
                  {wastedTrafficCount > 0 && aiCannibalizedCount > 0 && ' • '}
                  {aiCannibalizedCount > 0 && (
                    <span className="text-purple-600 font-medium">
                      {aiCannibalizedCount} AI cannibalized
                    </span>
                  )}
                </span>
              ) : (
                'Keywords requiring attention'
              )}
            </p>
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-primary-50 text-primary-700'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
          )}
        </button>
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
                  placeholder="Search keywords..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Issue Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="all">All Keywords ({keywords.length})</option>
                <option value="wasted">Wasted Traffic ({wastedTrafficCount})</option>
                <option value="ai_cannibalized">AI Cannibalized ({aiCannibalizedCount})</option>
                <option value="ai_triggered">AI Overview Triggered ({aiTriggeredCount})</option>
                <option value="educational">Educational Content ({educationalCount})</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
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
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filterType === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({keywords.length})
        </button>
        <button
          onClick={() => setFilterType('wasted')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filterType === 'wasted'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          🔥 Wasted Traffic ({wastedTrafficCount})
        </button>
        <button
          onClick={() => setFilterType('ai_cannibalized')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filterType === 'ai_cannibalized'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          🤖 AI Cannibalized ({aiCannibalizedCount})
        </button>
        <button
          onClick={() => setFilterType('ai_triggered')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filterType === 'ai_triggered'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          AI Triggered ({aiTriggeredCount})
        </button>
      </div>

      {/* AI Overview Warning Banner */}
      {filterType === 'ai_cannibalized' && aiCannibalizedCount > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Bot className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800">
                AI Overview Cannibalization Detected
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Educational content keywords (e.g., "how to", "tutorial") are declining 10-35% YoY 
                due to Google AI Overview providing direct answers. Consider pivoting to 
                transactional or comparison keywords.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Keyword
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('traffic')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  Traffic (2025)
                  <SortIcon field="traffic" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('change')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  YoY Change
                  <SortIcon field="change" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('conversion')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  Conv. Rate
                  <SortIcon field="conversion" />
                </button>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                <span className="inline-flex items-center gap-1" title="AI Overview cannibalization risk">
                  AI Impact
                  <Info className="w-3 h-3 text-gray-400" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedKeywords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {hasActiveFilters ? (
                    <div>
                      <p>No keywords match your filters</p>
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    'No keywords data available'
                  )}
                </td>
              </tr>
            ) : (
              filteredAndSortedKeywords.map((keyword, index) => {
                const isWasted = isWastedTraffic(keyword);
                const isAICannibalized = isAIOverviewCannibalized(keyword);
                const isEducational = isEducationalContent(keyword);
                
                // Determine row background
                let rowBg = 'hover:bg-gray-50';
                if (isWasted && isAICannibalized) {
                  rowBg = 'bg-gradient-to-r from-red-50 to-purple-50 hover:from-red-100 hover:to-purple-100';
                } else if (isWasted) {
                  rowBg = 'bg-red-50 hover:bg-red-100';
                } else if (isAICannibalized) {
                  rowBg = 'bg-purple-50 hover:bg-purple-100';
                }

                return (
                  <tr
                    key={`${keyword.keyword}-${index}`}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${rowBg}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {isWasted && (
                          <span title="Wasted Traffic">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          </span>
                        )}
                        {isAICannibalized && (
                          <span title="AI Cannibalized">
                            <Bot className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          </span>
                        )}
                        <div>
                          <span className={`text-sm ${isWasted || isAICannibalized ? 'font-medium' : ''} ${
                            isWasted ? 'text-red-900' : isAICannibalized ? 'text-purple-900' : 'text-gray-900'
                          }`}>
                            {keyword.keyword}
                          </span>
                          {isEducational && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                              Educational
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {keyword.category || '—'}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${
                      isWasted ? 'text-red-900' : isAICannibalized ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {keyword.traffic_2025.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-sm">
                      <span className={`font-medium ${
                        keyword.traffic_change_pct < -10 ? 'text-red-600' :
                        keyword.traffic_change_pct < 0 ? 'text-amber-600' :
                        keyword.traffic_change_pct > 10 ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {keyword.traffic_change_pct > 0 ? '+' : ''}{keyword.traffic_change_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right text-sm ${
                      isWasted ? 'text-red-900 font-medium' : 'text-gray-600'
                    }`}>
                      {keyword.conversion_rate_2025.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {keyword.ai_overview_triggered === 'Yes' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          <Bot className="w-3 h-3" />
                          Triggered
                        </span>
                      ) : isEducational ? (
                        <span className="text-xs text-amber-600">At Risk</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {filteredAndSortedKeywords.length} of {keywords.length} keywords
          {hasActiveFilters && ' (filtered)'}
        </span>
        <div className="flex items-center gap-4">
          {wastedTrafficCount > 0 && (
            <span className="text-red-600">
              ⚠️ {wastedTrafficCount} wasted traffic
            </span>
          )}
          {aiCannibalizedCount > 0 && (
            <span className="text-purple-600">
              🤖 {aiCannibalizedCount} AI cannibalized
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
