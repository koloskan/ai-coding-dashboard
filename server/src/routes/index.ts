import { Router, Request, Response } from 'express';
import { dataStore, getDataStoreStatus } from '../data/dataStore';

const router = Router();

// GET /api/status - Get data loading status
router.get('/status', (_req: Request, res: Response) => {
  const status = getDataStoreStatus();
  res.json({
    success: true,
    data: {
      ...status,
      recordCounts: {
        keywords: dataStore.keywords.length,
        monthlyMetrics: dataStore.monthlyMetrics.length,
        regionalPerformance: dataStore.regionalPerformance.length,
        channelPerformance: dataStore.channelPerformance.length,
        rawDataCollections: Object.keys(dataStore.rawData).length,
      },
    },
  });
});

// GET /api/keywords - Get all keyword data
router.get('/keywords', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.keywords,
    count: dataStore.keywords.length,
  });
});

// GET /api/keywords/category/:category - Get keywords by category
router.get('/keywords/category/:category', (req: Request, res: Response) => {
  const category = req.params.category;
  const filtered = dataStore.keywords.filter(
    k => k.category.toLowerCase() === category.toLowerCase()
  );
  res.json({
    success: true,
    data: filtered,
    count: filtered.length,
  });
});

// GET /api/keywords/search - Search keywords
router.get('/keywords/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  if (!query) {
    res.json({ success: true, data: [], count: 0 });
    return;
  }
  
  const filtered = dataStore.keywords.filter(
    k => k.keyword.toLowerCase().includes(query)
  );
  res.json({
    success: true,
    data: filtered,
    count: filtered.length,
  });
});

// GET /api/monthly-metrics - Get monthly metrics (overall trends)
router.get('/monthly-metrics', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.monthlyMetrics,
    count: dataStore.monthlyMetrics.length,
  });
});

// GET /api/regional-performance - Get regional performance (geographic insights)
router.get('/regional-performance', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.regionalPerformance,
    count: dataStore.regionalPerformance.length,
  });
});

// GET /api/channel-performance - Get channel performance data
router.get('/channel-performance', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: dataStore.channelPerformance,
    count: dataStore.channelPerformance.length,
  });
});

// GET /api/channel-performance/channel/:channel - Get performance by channel
router.get('/channel-performance/channel/:channel', (req: Request, res: Response) => {
  const channel = req.params.channel;
  const filtered = dataStore.channelPerformance.filter(
    c => c.channel.toLowerCase() === channel.toLowerCase()
  );
  res.json({
    success: true,
    data: filtered,
    count: filtered.length,
  });
});

// GET /api/channel-performance/month/:month - Get performance by month
router.get('/channel-performance/month/:month', (req: Request, res: Response) => {
  const month = req.params.month;
  const filtered = dataStore.channelPerformance.filter(
    c => c.month === month
  );
  res.json({
    success: true,
    data: filtered,
    count: filtered.length,
  });
});

// GET /api/raw/:collection - Get raw data by collection name
router.get('/raw/:collection', (req: Request, res: Response) => {
  const collection = req.params.collection;
  const data = dataStore.rawData[collection];
  
  if (!data) {
    res.status(404).json({
      success: false,
      error: `Collection '${collection}' not found`,
      availableCollections: Object.keys(dataStore.rawData),
    });
    return;
  }
  
  res.json({
    success: true,
    data: data,
    count: data.length,
  });
});

// GET /api/raw - List all raw data collections
router.get('/raw', (_req: Request, res: Response) => {
  const collections = Object.keys(dataStore.rawData).map(name => ({
    name,
    recordCount: dataStore.rawData[name].length,
  }));
  
  res.json({
    success: true,
    data: collections,
  });
});

// GET /api/analytics/summary - Get analytics summary
router.get('/analytics/summary', (_req: Request, res: Response) => {
  const keywords = dataStore.keywords;
  
  if (keywords.length === 0) {
    res.json({
      success: true,
      data: null,
      message: 'No keyword data loaded',
    });
    return;
  }
  
  // Calculate summary statistics
  const totalTraffic2024 = keywords.reduce((sum, k) => sum + k.traffic_2024, 0);
  const totalTraffic2025 = keywords.reduce((sum, k) => sum + k.traffic_2025, 0);
  const totalSignups2024 = keywords.reduce((sum, k) => sum + k.signups_2024, 0);
  const totalSignups2025 = keywords.reduce((sum, k) => sum + k.signups_2025, 0);
  
  const avgConversionRate2024 = keywords.reduce((sum, k) => sum + k.conversion_rate_2024, 0) / keywords.length;
  const avgConversionRate2025 = keywords.reduce((sum, k) => sum + k.conversion_rate_2025, 0) / keywords.length;
  
  const avgDifficultyScore = keywords.reduce((sum, k) => sum + k.difficulty_score, 0) / keywords.length;
  const avgCPC = keywords.reduce((sum, k) => sum + k.cpc_usd, 0) / keywords.length;
  
  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  keywords.forEach(k => {
    categoryBreakdown[k.category] = (categoryBreakdown[k.category] || 0) + 1;
  });
  
  // AI Overview triggered count
  const aiOverviewTriggered = keywords.filter(k => k.ai_overview_triggered === 'Yes').length;
  
  res.json({
    success: true,
    data: {
      totalKeywords: keywords.length,
      traffic: {
        total2024: totalTraffic2024,
        total2025: totalTraffic2025,
        changePercent: ((totalTraffic2025 - totalTraffic2024) / totalTraffic2024 * 100).toFixed(2),
      },
      signups: {
        total2024: totalSignups2024,
        total2025: totalSignups2025,
        changePercent: ((totalSignups2025 - totalSignups2024) / totalSignups2024 * 100).toFixed(2),
      },
      conversionRate: {
        avg2024: avgConversionRate2024.toFixed(2),
        avg2025: avgConversionRate2025.toFixed(2),
      },
      avgDifficultyScore: avgDifficultyScore.toFixed(2),
      avgCPC: avgCPC.toFixed(2),
      categoryBreakdown,
      aiOverviewTriggered,
      aiOverviewPercentage: ((aiOverviewTriggered / keywords.length) * 100).toFixed(2),
    },
  });
});

// GET /api/analytics/top-performers - Get top performing keywords
router.get('/analytics/top-performers', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = (req.query.sortBy as string) || 'traffic_change_pct';
  
  const sorted = [...dataStore.keywords].sort((a, b) => {
    const aVal = (a as unknown as Record<string, number>)[sortBy] || 0;
    const bVal = (b as unknown as Record<string, number>)[sortBy] || 0;
    return bVal - aVal;
  });
  
  res.json({
    success: true,
    data: sorted.slice(0, limit),
    count: Math.min(limit, sorted.length),
  });
});

export default router;
