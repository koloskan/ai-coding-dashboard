import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, ArrowUpDown, ArrowDown, ArrowUp, Bot, Info } from 'lucide-react';

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

type SortDirection = 'asc' | 'desc' | null;

export default function ProblemKeywordsTable() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

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

  // Sort keywords by traffic
  const handleSort = () => {
    if (sortDirection === null || sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection('asc');
    }
  };

  // Get sorted keywords
  const sortedKeywords = [...keywords].sort((a, b) => {
    if (sortDirection === 'desc') {
      return b.traffic_2025 - a.traffic_2025;
    } else if (sortDirection === 'asc') {
      return a.traffic_2025 - b.traffic_2025;
    }
    return 0;
  });

  // Count problem keywords
  const wastedTrafficCount = keywords.filter(isWastedTraffic).length;
  const aiCannibalizedCount = keywords.filter(isAIOverviewCannibalized).length;

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
      <div className="flex items-center justify-between mb-6">
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

        {/* Legend */}
        <div className="flex flex-col gap-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-red-100 rounded"></span>
            Wasted Traffic (Traffic &gt; 2K, Conv &lt; 1.5%)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 bg-purple-100 rounded"></span>
            AI Overview Cannibalization
          </span>
        </div>
      </div>

      {/* AI Overview Warning Banner */}
      {aiCannibalizedCount > 0 && (
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
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <button
                  onClick={handleSort}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  Traffic (2025)
                  {sortDirection === null && <ArrowUpDown className="w-4 h-4" />}
                  {sortDirection === 'desc' && <ArrowDown className="w-4 h-4 text-primary-600" />}
                  {sortDirection === 'asc' && <ArrowUp className="w-4 h-4 text-primary-600" />}
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Conversion Rate
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
            {sortedKeywords.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No keywords data available
                </td>
              </tr>
            ) : (
              sortedKeywords.map((keyword, index) => {
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
                    <td className={`py-3 px-4 text-right text-sm font-medium ${
                      isWasted ? 'text-red-900' : isAICannibalized ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {keyword.traffic_2025.toLocaleString()}
                      {keyword.traffic_change_pct !== 0 && (
                        <span className={`ml-1 text-xs ${
                          keyword.traffic_change_pct < 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          ({keyword.traffic_change_pct > 0 ? '+' : ''}{keyword.traffic_change_pct.toFixed(1)}%)
                        </span>
                      )}
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
      {keywords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Total: {keywords.length} keywords</span>
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
      )}
    </div>
  );
}
