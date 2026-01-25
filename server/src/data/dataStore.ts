// Global Data Store for CSV Data
// This module holds all parsed CSV data in memory for API access

export interface KeywordData {
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

export interface MonthlyMetric {
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

export interface RegionalPerformance {
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

export interface ChannelPerformance {
  month: string;
  channel: string;
  sessions: number;
  signups: number;
  conversion_rate: number;
  avg_session_duration_sec: number;
  bounce_rate: number;
  pages_per_session: number;
}

export interface DataStore {
  // Keyword performance data
  keywords: KeywordData[];
  
  // Monthly metrics for overall trends
  monthlyMetrics: MonthlyMetric[];
  
  // Regional performance for geographic insights
  regionalPerformance: RegionalPerformance[];
  
  // Channel performance data
  channelPerformance: ChannelPerformance[];
  
  // Raw data from all CSV files (keyed by filename without extension)
  rawData: Record<string, Record<string, string | number>[]>;
  
  // Metadata
  loadedAt: Date | null;
  filesLoaded: string[];
}

// Initialize empty data store
export const dataStore: DataStore = {
  keywords: [],
  monthlyMetrics: [],
  regionalPerformance: [],
  channelPerformance: [],
  rawData: {},
  loadedAt: null,
  filesLoaded: [],
};

// Helper function to get data store status
export function getDataStoreStatus(): { loaded: boolean; filesLoaded: string[]; loadedAt: Date | null } {
  return {
    loaded: dataStore.loadedAt !== null,
    filesLoaded: dataStore.filesLoaded,
    loadedAt: dataStore.loadedAt,
  };
}
