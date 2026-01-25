// CSV Data Loader
// Reads all CSV files from the /data folder and populates the data store

import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { 
  dataStore, 
  KeywordData, 
  MonthlyMetric, 
  RegionalPerformance, 
  ChannelPerformance 
} from './dataStore';

// Path to the data folder (relative to project root)
const DATA_FOLDER = path.join(__dirname, '../../../data');

// Specific file mappings
const FILE_MAPPINGS = {
  'monthly_metrics.csv': 'monthlyMetrics',
  'regional_performance.csv': 'regionalPerformance',
  'keywords.csv': 'keywords',
  'keyword_performance.csv': 'keywords',
  'channel_performance.csv': 'channelPerformance',
} as const;

/**
 * Parse a single CSV file and return the data as an array of objects
 */
function parseCSVFile(filePath: string): Promise<Record<string, string | number>[]> {
  return new Promise((resolve, reject) => {
    const results: Record<string, string | number>[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: Record<string, string>) => {
        // Convert numeric strings to numbers
        const parsedRow: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(row)) {
          const numValue = parseFloat(value);
          parsedRow[key] = isNaN(numValue) ? value : numValue;
        }
        results.push(parsedRow);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error: Error) => {
        reject(error);
      });
  });
}

/**
 * Get all CSV files from the data folder
 */
function getCSVFiles(): string[] {
  try {
    const files = fs.readdirSync(DATA_FOLDER);
    return files.filter(file => file.toLowerCase().endsWith('.csv'));
  } catch (error) {
    console.error('Error reading data folder:', error);
    return [];
  }
}

/**
 * Map raw data to KeywordData type
 */
function mapToKeywordData(data: Record<string, string | number>[]): KeywordData[] {
  return data.map(row => ({
    keyword: String(row.keyword || ''),
    category: String(row.category || ''),
    traffic_2024: Number(row.traffic_2024) || 0,
    traffic_2025: Number(row.traffic_2025) || 0,
    traffic_change_pct: Number(row.traffic_change_pct) || 0,
    position_2024: Number(row.position_2024) || 0,
    position_2025: Number(row.position_2025) || 0,
    position_change: Number(row.position_change) || 0,
    signups_2024: Number(row.signups_2024) || 0,
    signups_2025: Number(row.signups_2025) || 0,
    conversion_rate_2024: Number(row.conversion_rate_2024) || 0,
    conversion_rate_2025: Number(row.conversion_rate_2025) || 0,
    ai_overview_triggered: String(row.ai_overview_triggered || 'No'),
    difficulty_score: Number(row.difficulty_score) || 0,
    cpc_usd: Number(row.cpc_usd) || 0,
  }));
}

/**
 * Map raw data to MonthlyMetric type
 */
function mapToMonthlyMetrics(data: Record<string, string | number>[]): MonthlyMetric[] {
  return data.map(row => ({
    month: String(row.month || ''),
    website_traffic: Number(row.website_traffic) || 0,
    unique_signups: Number(row.unique_signups) || 0,
    trials_started: Number(row.trials_started) || 0,
    paid_conversions: Number(row.paid_conversions) || 0,
    mrr_usd: Number(row.mrr_usd) || 0,
    churn_rate: Number(row.churn_rate) || 0,
    signup_to_trial_rate: Number(row.signup_to_trial_rate) || 0,
    trial_to_paid_rate: Number(row.trial_to_paid_rate) || 0,
    net_new_mrr: Number(row.net_new_mrr) || 0,
    expansion_mrr: Number(row.expansion_mrr) || 0,
    churned_mrr: Number(row.churned_mrr) || 0,
  }));
}

/**
 * Map raw data to RegionalPerformance type
 */
function mapToRegionalPerformance(data: Record<string, string | number>[]): RegionalPerformance[] {
  return data.map(row => ({
    region: String(row.region || ''),
    country: String(row.country || ''),
    city: String(row.city || ''),
    month: String(row.month || ''),
    organic_traffic: Number(row.organic_traffic) || 0,
    paid_traffic: Number(row.paid_traffic) || 0,
    total_traffic: Number(row.total_traffic) || 0,
    trials_started: Number(row.trials_started) || 0,
    paid_conversions: Number(row.paid_conversions) || 0,
    trial_to_paid_rate: Number(row.trial_to_paid_rate) || 0,
    mrr_usd: Number(row.mrr_usd) || 0,
    cac_usd: Number(row.cac_usd) || 0,
    ltv_usd: Number(row.ltv_usd) || 0,
  }));
}

/**
 * Map raw data to ChannelPerformance type
 */
function mapToChannelPerformance(data: Record<string, string | number>[]): ChannelPerformance[] {
  return data.map(row => ({
    month: String(row.month || ''),
    channel: String(row.channel || ''),
    sessions: Number(row.sessions) || 0,
    signups: Number(row.signups) || 0,
    conversion_rate: Number(row.conversion_rate) || 0,
    avg_session_duration_sec: Number(row.avg_session_duration_sec) || 0,
    bounce_rate: Number(row.bounce_rate) || 0,
    pages_per_session: Number(row.pages_per_session) || 0,
  }));
}

/**
 * Get the data type based on filename
 */
function getDataTypeFromFilename(filename: string): keyof typeof FILE_MAPPINGS | 'other' {
  const lowerFilename = filename.toLowerCase();
  
  // Check exact matches first
  if (lowerFilename in FILE_MAPPINGS) {
    return lowerFilename as keyof typeof FILE_MAPPINGS;
  }
  
  // Check partial matches for flexibility
  if (lowerFilename.includes('monthly') || lowerFilename.includes('metrics')) {
    return 'monthly_metrics.csv';
  }
  if (lowerFilename.includes('regional') || lowerFilename.includes('geographic')) {
    return 'regional_performance.csv';
  }
  if (lowerFilename.includes('keyword')) {
    return 'keywords.csv';
  }
  if (lowerFilename.includes('channel')) {
    return 'channel_performance.csv';
  }
  
  return 'other';
}

/**
 * Load all CSV files from the data folder
 */
export async function loadAllCSVData(): Promise<void> {
  const csvFiles = getCSVFiles();
  
  if (csvFiles.length === 0) {
    console.warn('No CSV files found in data folder');
    return;
  }
  
  console.log(`Found ${csvFiles.length} CSV file(s) to load...`);
  
  for (const filename of csvFiles) {
    const filePath = path.join(DATA_FOLDER, filename);
    const fileKey = filename.replace('.csv', '').replace('.CSV', '');
    
    try {
      console.log(`Loading: ${filename}`);
      const data = await parseCSVFile(filePath);
      
      // Store raw data
      dataStore.rawData[fileKey] = data;
      dataStore.filesLoaded.push(filename);
      
      // Map to typed data based on filename
      const dataType = getDataTypeFromFilename(filename);
      const mappedType = dataType !== 'other' ? FILE_MAPPINGS[dataType] : null;
      
      switch (mappedType) {
        case 'keywords':
          dataStore.keywords = mapToKeywordData(data);
          console.log(`  -> Mapped ${data.length} records to keywords`);
          break;
        case 'monthlyMetrics':
          dataStore.monthlyMetrics = mapToMonthlyMetrics(data);
          console.log(`  -> Mapped ${data.length} records to monthlyMetrics`);
          break;
        case 'regionalPerformance':
          dataStore.regionalPerformance = mapToRegionalPerformance(data);
          console.log(`  -> Mapped ${data.length} records to regionalPerformance`);
          break;
        case 'channelPerformance':
          dataStore.channelPerformance = mapToChannelPerformance(data);
          console.log(`  -> Mapped ${data.length} records to channelPerformance`);
          break;
        default:
          console.log(`  -> Stored ${data.length} records in rawData['${fileKey}']`);
      }
      
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
    }
  }
  
  // Update metadata
  dataStore.loadedAt = new Date();
  
  console.log('');
  console.log('='.repeat(50));
  console.log('Data Loaded Successfully');
  console.log('='.repeat(50));
  console.log(`Files loaded: ${dataStore.filesLoaded.length}`);
  console.log(`Keywords: ${dataStore.keywords.length} records`);
  console.log(`Monthly Metrics: ${dataStore.monthlyMetrics.length} records`);
  console.log(`Regional Performance: ${dataStore.regionalPerformance.length} records`);
  console.log(`Channel Performance: ${dataStore.channelPerformance.length} records`);
  console.log(`Raw data collections: ${Object.keys(dataStore.rawData).length}`);
  console.log('='.repeat(50));
}
