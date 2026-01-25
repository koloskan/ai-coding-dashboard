# Data Directory

This directory contains mock data files used for development and testing of the Marketing Dashboard.

## Files

### campaigns.json

Contains sample marketing campaign data with the following structure:

```json
{
  "campaigns": [
    {
      "id": "string",           // Unique campaign identifier
      "name": "string",         // Campaign name
      "status": "string",       // active | paused | completed | draft
      "budget": "number",       // Total budget in USD
      "spent": "number",        // Amount spent so far
      "startDate": "string",    // ISO date string
      "endDate": "string",      // ISO date string
      "platform": "string",     // google | facebook | instagram | twitter | linkedin
      "impressions": "number",  // Total impressions
      "clicks": "number",       // Total clicks
      "conversions": "number"   // Total conversions
    }
  ]
}
```

### analytics.json

Contains analytics and metrics data with the following structure:

```json
{
  "dashboardMetrics": {
    "totalCampaigns": "number",
    "activeCampaigns": "number",
    "totalBudget": "number",
    "totalSpent": "number",
    "totalImpressions": "number",
    "totalClicks": "number",
    "totalConversions": "number",
    "ctr": "number",            // Click-through rate (%)
    "conversionRate": "number", // Conversion rate (%)
    "roi": "number"             // Return on investment (%)
  },
  "dailyAnalytics": [
    {
      "date": "string",
      "impressions": "number",
      "clicks": "number",
      "conversions": "number",
      "spend": "number",
      "revenue": "number"
    }
  ],
  "platformBreakdown": [
    {
      "platform": "string",
      "impressions": "number",
      "clicks": "number",
      "conversions": "number",
      "spend": "number",
      "percentage": "number"
    }
  ]
}
```

## Usage

These mock data files are read by the Express server to provide API responses during development. In production, you would replace these with actual database queries.

### API Endpoints

- `GET /api/campaigns` - Returns all campaigns
- `GET /api/campaigns/:id` - Returns a specific campaign
- `GET /api/analytics` - Returns all analytics data
- `GET /api/analytics/dashboard` - Returns dashboard metrics

## Customization

Feel free to modify these files to test different scenarios:

1. Add more campaigns with different statuses
2. Modify metrics to test edge cases
3. Add historical data for trend analysis
4. Test with larger datasets for performance testing
