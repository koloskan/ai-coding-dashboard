import { useState, useMemo } from 'react';
import { Globe, ArrowUpDown, ArrowDown, ArrowUp, ChevronRight, ChevronDown, Search, Filter, X, MapPin, Building2, Map } from 'lucide-react';

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

interface RegionalTableProps {
  regionalPerformance: RegionalPerformance[];
  isLoading: boolean;
}

type DrillLevel = 'region' | 'country' | 'city';
type SortField = 'name' | 'traffic' | 'conversions' | 'mrr' | 'conversion_rate';
type SortDirection = 'asc' | 'desc';

interface AggregatedData {
  name: string;
  totalTraffic: number;
  organicTraffic: number;
  paidTraffic: number;
  trials: number;
  conversions: number;
  mrr: number;
  avgConversionRate: number;
  avgCAC: number;
  avgLTV: number;
  count: number;
  hasChildren: boolean;
}

export default function RegionalTable({ regionalPerformance, isLoading }: RegionalTableProps) {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('region');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('mrr');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique regions for filter
  const regions = useMemo(() => {
    return [...new Set(regionalPerformance.map(r => r.region))].sort();
  }, [regionalPerformance]);

  // Get countries for selected region
  const countriesInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return [...new Set(
      regionalPerformance
        .filter(r => r.region === selectedRegion)
        .map(r => r.country)
    )].sort();
  }, [regionalPerformance, selectedRegion]);

  // Aggregate data based on drill level
  const aggregatedData = useMemo(() => {
    let filtered = [...regionalPerformance];

    // Apply region filter if drilling down
    if (selectedRegion) {
      filtered = filtered.filter(r => r.region === selectedRegion);
    }
    if (selectedCountry) {
      filtered = filtered.filter(r => r.country === selectedCountry);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.region.toLowerCase().includes(query) ||
        r.country.toLowerCase().includes(query) ||
        r.city.toLowerCase().includes(query)
      );
    }

    // Group by current drill level
    const groupKey = drillLevel === 'region' ? 'region' : drillLevel === 'country' ? 'country' : 'city';
    const grouped = filtered.reduce((acc, r) => {
      const key = r[groupKey];
      if (!acc[key]) {
        acc[key] = {
          name: key,
          totalTraffic: 0,
          organicTraffic: 0,
          paidTraffic: 0,
          trials: 0,
          conversions: 0,
          mrr: 0,
          avgConversionRate: 0,
          avgCAC: 0,
          avgLTV: 0,
          count: 0,
          hasChildren: drillLevel !== 'city',
        };
      }
      acc[key].totalTraffic += r.total_traffic;
      acc[key].organicTraffic += r.organic_traffic;
      acc[key].paidTraffic += r.paid_traffic;
      acc[key].trials += r.trials_started;
      acc[key].conversions += r.paid_conversions;
      acc[key].mrr += r.mrr_usd;
      acc[key].avgConversionRate += r.trial_to_paid_rate;
      acc[key].avgCAC += r.cac_usd;
      acc[key].avgLTV += r.ltv_usd;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, AggregatedData>);

    // Calculate averages
    Object.values(grouped).forEach(g => {
      g.avgConversionRate = g.avgConversionRate / g.count;
      g.avgCAC = g.avgCAC / g.count;
      g.avgLTV = g.avgLTV / g.count;
    });

    // Sort
    const result = Object.values(grouped).sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'traffic':
          comparison = a.totalTraffic - b.totalTraffic;
          break;
        case 'conversions':
          comparison = a.conversions - b.conversions;
          break;
        case 'mrr':
          comparison = a.mrr - b.mrr;
          break;
        case 'conversion_rate':
          comparison = a.avgConversionRate - b.avgConversionRate;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [regionalPerformance, drillLevel, selectedRegion, selectedCountry, searchQuery, sortField, sortDirection]);

  // Handle drill down
  const handleDrillDown = (item: AggregatedData) => {
    if (drillLevel === 'region') {
      setSelectedRegion(item.name);
      setDrillLevel('country');
    } else if (drillLevel === 'country') {
      setSelectedCountry(item.name);
      setDrillLevel('city');
    }
  };

  // Handle drill up
  const handleDrillUp = () => {
    if (drillLevel === 'city') {
      setSelectedCountry(null);
      setDrillLevel('country');
    } else if (drillLevel === 'country') {
      setSelectedRegion(null);
      setDrillLevel('region');
    }
  };

  // Reset to top level
  const resetDrill = () => {
    setSelectedRegion(null);
    setSelectedCountry(null);
    setDrillLevel('region');
  };

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

  // Get level icon
  const getLevelIcon = () => {
    switch (drillLevel) {
      case 'region': return <Globe className="w-5 h-5" />;
      case 'country': return <Map className="w-5 h-5" />;
      case 'city': return <Building2 className="w-5 h-5" />;
    }
  };

  // Check for low conversion regions
  const lowConversionItems = aggregatedData.filter(d => d.avgConversionRate < 0.10);

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
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {getLevelIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Geographic Performance</h3>
            <p className="text-sm text-gray-500">
              {drillLevel === 'region' && 'Click a region to drill down'}
              {drillLevel === 'country' && `${selectedRegion} → Countries`}
              {drillLevel === 'city' && `${selectedRegion} → ${selectedCountry} → Cities`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-primary-50 text-primary-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <button
          onClick={resetDrill}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            drillLevel === 'region'
              ? 'bg-primary-100 text-primary-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          All Regions
        </button>
        
        {selectedRegion && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => {
                setSelectedCountry(null);
                setDrillLevel('country');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                drillLevel === 'country'
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="w-4 h-4" />
              {selectedRegion}
            </button>
          </>
        )}
        
        {selectedCountry && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 font-medium rounded">
              <Building2 className="w-4 h-4" />
              {selectedCountry}
            </span>
          </>
        )}
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
                  placeholder="Search regions, countries, cities..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear */}
            {searchQuery && (
              <div className="flex items-end">
                <button
                  onClick={() => setSearchQuery('')}
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

      {/* Low Conversion Warning */}
      {lowConversionItems.length > 0 && drillLevel === 'region' && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Low Conversion Regions Detected
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {lowConversionItems.map(i => i.name).join(', ')} have conversion rates below 10%. 
                Click to drill down and identify specific problem areas.
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
                <button
                  onClick={() => handleSort('name')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  {drillLevel === 'region' ? 'Region' : drillLevel === 'country' ? 'Country' : 'City'}
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('traffic')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  Total Traffic
                  <SortIcon field="traffic" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <button
                  onClick={() => handleSort('conversions')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  Conversions
                  <SortIcon field="conversions" />
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
                  onClick={() => handleSort('mrr')}
                  className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors"
                >
                  MRR
                  <SortIcon field="mrr" />
                </button>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {aggregatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No data available for this selection
                </td>
              </tr>
            ) : (
              aggregatedData.map((item, index) => {
                const isLowConversion = item.avgConversionRate < 0.10;
                
                return (
                  <tr
                    key={`${item.name}-${index}`}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${
                      isLowConversion ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-gray-50'
                    } ${item.hasChildren ? 'cursor-pointer' : ''}`}
                    onClick={() => item.hasChildren && handleDrillDown(item)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {drillLevel === 'region' && <Globe className="w-4 h-4 text-gray-400" />}
                        {drillLevel === 'country' && <Map className="w-4 h-4 text-gray-400" />}
                        {drillLevel === 'city' && <Building2 className="w-4 h-4 text-gray-400" />}
                        <span className={`text-sm font-medium ${isLowConversion ? 'text-amber-900' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        {isLowConversion && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded">
                            Low Conv.
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {item.totalTraffic.toLocaleString()}
                      <div className="text-xs text-gray-500">
                        {Math.round((item.organicTraffic / item.totalTraffic) * 100)}% organic
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-900">
                      {item.conversions.toLocaleString()}
                      <div className="text-xs text-gray-500">
                        {item.trials.toLocaleString()} trials
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-medium ${
                      isLowConversion ? 'text-amber-700' : item.avgConversionRate > 0.15 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {(item.avgConversionRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-green-600">
                      ${item.mrr.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.hasChildren ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDrillDown(item);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                        >
                          Drill Down
                          <ChevronRight className="w-3 h-3" />
                        </button>
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
          Showing {aggregatedData.length} {drillLevel === 'region' ? 'regions' : drillLevel === 'country' ? 'countries' : 'cities'}
        </span>
        <div className="flex items-center gap-4">
          <span>
            Total MRR: <span className="font-medium text-green-600">
              ${aggregatedData.reduce((sum, d) => sum + d.mrr, 0).toLocaleString()}
            </span>
          </span>
          {drillLevel !== 'region' && (
            <button
              onClick={handleDrillUp}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to {drillLevel === 'country' ? 'Regions' : 'Countries'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
