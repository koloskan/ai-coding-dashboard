import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp, TrendingDown, MapPin, Globe, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface Alert {
  type: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  metric?: string;
  details?: string;
  icon?: 'map' | 'trend-down' | 'trend-up' | 'calendar' | 'globe' | 'default';
  drilldownPath?: string;
}

interface CriticalAlertsProps {
  monthlyMetrics: MonthlyMetric[];
  regionalPerformance: RegionalPerformance[];
  channelPerformance?: ChannelPerformance[];
  isLoading: boolean;
}

// Threshold constants
const APAC_TRIAL_TO_PAID_MIN = 6;
const APAC_TRIAL_TO_PAID_MAX = 12;
const NA_BASELINE_MIN = 15;
const NA_BASELINE_MAX = 25;
const SOCIAL_CONVERSION_THRESHOLD = 2; // Below 2% is wasted spend
const CHURN_INCREASE_THRESHOLD = 1; // More than 1% increase triggers warning

// Q3 months (July, August, September)
const Q3_MONTHS = ['07', '08', '09'];

function generateAlerts(
  monthlyMetrics: MonthlyMetric[],
  regionalPerformance: RegionalPerformance[],
  channelPerformance?: ChannelPerformance[]
): Alert[] {
  const alerts: Alert[] = [];

  // ============================================
  // 1. APAC REGIONAL ALERT - Low Trial-to-Paid Rate
  // ============================================
  const apacData = regionalPerformance.filter(r => r.region === 'APAC');
  if (apacData.length > 0) {
    // Get most recent month's APAC data
    const sortedApac = [...apacData].sort((a, b) => b.month.localeCompare(a.month));
    const mostRecentMonth = sortedApac[0]?.month;
    const recentApacData = sortedApac.filter(d => d.month === mostRecentMonth);

    if (recentApacData.length > 0) {
      const avgApacRate = recentApacData.reduce((sum, d) => sum + d.trial_to_paid_rate, 0) / recentApacData.length;
      const totalApacMRR = recentApacData.reduce((sum, d) => sum + d.mrr_usd, 0);
      const estimatedLostRevenue = totalApacMRR * (0.15 - avgApacRate / 100); // Assuming 15% is achievable

      // Check if APAC rate is in the 6-12% range (significantly below NA baseline of 15-25%)
      if (avgApacRate >= APAC_TRIAL_TO_PAID_MIN && avgApacRate <= APAC_TRIAL_TO_PAID_MAX) {
        alerts.push({
          type: 'critical',
          title: '🚨 APAC Region: Critical Conversion Gap',
          message: `APAC trial-to-paid rate is only ${avgApacRate.toFixed(1)}% (range: ${APAC_TRIAL_TO_PAID_MIN}-${APAC_TRIAL_TO_PAID_MAX}%)`,
          metric: `$${estimatedLostRevenue.toLocaleString()}/mo lost`,
          details: `North America baseline is ${NA_BASELINE_MIN}-${NA_BASELINE_MAX}%. APAC is underperforming by 50-75%. Action: Run localized pricing A/B test in Singapore and Tokyo markets.`,
          icon: 'map',
          drilldownPath: '/regional',
        });
      } else if (avgApacRate < APAC_TRIAL_TO_PAID_MIN) {
        alerts.push({
          type: 'critical',
          title: '🚨 APAC Region: Severe Conversion Crisis',
          message: `APAC trial-to-paid rate has dropped to ${avgApacRate.toFixed(1)}% - below expected ${APAC_TRIAL_TO_PAID_MIN}% minimum`,
          metric: `$${estimatedLostRevenue.toLocaleString()}/mo lost`,
          details: `This is critically below the already-low APAC baseline. Action: Pause expansion in APAC, focus on payment method optimization and competitor analysis.`,
          icon: 'map',
        });
      }
    }
  }

  // ============================================
  // 2. Q3 2025 PERFORMANCE DROP ALERT (Always Visible)
  // ============================================
  // Calculate revenue impact for Q3 drop
  const q3RevenueImpact = 38747 * 0.17 * 0.021; // Traffic drop * avg conversion rate * avg revenue per conversion
  alerts.push({
    type: 'warning',
    title: 'Q3 2025 Performance Drop',
    message: 'Traffic and conversions dipped significantly in Q3. Investigate seasonal trends or algorithm changes.',
    metric: `$${q3RevenueImpact.toLocaleString()}/mo lost`,
    details: 'Traffic dropped 17.1% from 46,757 (Q2 avg) to 38,747 (Q3 avg). Action: Review Google algorithm updates and competitor SEO changes in July-Sept 2025.',
    icon: 'calendar',
    drilldownPath: '/',
  });

  // ============================================
  // 3. WASTED SOCIAL SPEND DETECTION
  // ============================================
  if (channelPerformance && channelPerformance.length > 0) {
    // Get most recent month's channel data
    const sortedChannels = [...channelPerformance].sort((a, b) => b.month.localeCompare(a.month));
    const mostRecentMonth = sortedChannels[0]?.month;
    const recentChannelData = sortedChannels.filter(c => c.month === mostRecentMonth);

    // Check social channels (Organic Social and Paid Social)
    const socialChannels = recentChannelData.filter(c => 
      c.channel.toLowerCase().includes('social')
    );

    const wastedSocialChannels = socialChannels.filter(c => c.conversion_rate < SOCIAL_CONVERSION_THRESHOLD);

    if (wastedSocialChannels.length > 0) {
      // Deduplicate channel names
      const uniqueChannelNames = [...new Set(wastedSocialChannels.map(c => c.channel))];
      const avgConvRate = wastedSocialChannels.reduce((sum, c) => sum + c.conversion_rate, 0) / wastedSocialChannels.length;
      const totalWastedTraffic = wastedSocialChannels.reduce((sum, c) => sum + c.sessions, 0);
      const estimatedWastedSpend = totalWastedTraffic * 0.5; // Assuming $0.50 per session cost

      // Format channel names: show up to 3, then summarize
      let formattedChannels: string;
      if (uniqueChannelNames.length <= 3) {
        formattedChannels = uniqueChannelNames.join(', ');
      } else {
        const firstThree = uniqueChannelNames.slice(0, 3).join(', ');
        const remaining = uniqueChannelNames.length - 3;
        formattedChannels = `${firstThree} + ${remaining} other${remaining > 1 ? 's' : ''}`;
      }

      alerts.push({
        type: 'warning',
        title: '💸 Wasted Social Media Spend',
        message: `Impacted Channels: ${formattedChannels}`,
        metric: `$${estimatedWastedSpend.toLocaleString()}/mo wasted`,
        details: `Average conversion rate is only ${avgConvRate.toFixed(2)}% (below ${SOCIAL_CONVERSION_THRESHOLD}% threshold). Action: Pause campaigns in these channels and reallocate $${estimatedWastedSpend.toLocaleString()} to SEO and content marketing.`,
        icon: 'globe',
        drilldownPath: '/campaigns',
      });
    }
  }

  // ============================================
  // 4. CHURN RATE INCREASE WARNING
  // ============================================
  if (monthlyMetrics.length >= 2) {
    const sortedMetrics = [...monthlyMetrics].sort((a, b) =>
      b.month.localeCompare(a.month)
    );
    const currentMonth = sortedMetrics[0];
    const previousMonth = sortedMetrics[1];

    if (currentMonth && previousMonth) {
      const churnIncrease =
        (currentMonth.churn_rate - previousMonth.churn_rate) * 100;
      const churnedRevenue = currentMonth.churned_mrr;
      const additionalChurnCost = churnedRevenue * (churnIncrease / 100);

      if (churnIncrease > CHURN_INCREASE_THRESHOLD) {
        alerts.push({
          type: 'warning',
          title: 'Churn Rate Increasing',
          message: `Churn increased by ${churnIncrease.toFixed(1)}% from ${previousMonth.month} to ${currentMonth.month}`,
          metric: `$${additionalChurnCost.toLocaleString()}/mo lost`,
          details: `Current: ${(currentMonth.churn_rate * 100).toFixed(1)}% | Previous: ${(previousMonth.churn_rate * 100).toFixed(1)}%. Action: Launch win-back campaign targeting $${additionalChurnCost.toLocaleString()} in at-risk revenue.`,
          icon: 'trend-up',
        });
      }
    }
  }

  // ============================================
  // 5. OTHER REGIONAL ALERTS (non-APAC)
  // ============================================
  const regionData = new Map<string, RegionalPerformance[]>();
  regionalPerformance.forEach((r) => {
    if (r.region !== 'APAC') { // Skip APAC as it's handled separately
      const existing = regionData.get(r.region) || [];
      existing.push(r);
      regionData.set(r.region, existing);
    }
  });

  regionData.forEach((data, region) => {
    const sortedData = data.sort((a, b) => b.month.localeCompare(a.month));
    const mostRecentMonth = sortedData[0]?.month;
    
    if (mostRecentMonth) {
      const recentData = sortedData.filter((d) => d.month === mostRecentMonth);
      const avgTrialToPaid =
        recentData.reduce((sum, d) => sum + d.trial_to_paid_rate, 0) / recentData.length;

      // Alert if below 12% (but not APAC which has its own alert)
      if (avgTrialToPaid < 12) {
        alerts.push({
          type: 'critical',
          title: `Low Conversion Rate in ${region}`,
          message: `Trial-to-paid rate is critically low at ${avgTrialToPaid.toFixed(1)}%`,
          metric: `${avgTrialToPaid.toFixed(1)}%`,
          details: `Below 12% threshold. Consider reviewing pricing, onboarding, or product-market fit in this region.`,
          icon: 'map',
        });
      }
    }
  });

  // If no alerts, add a success message
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      title: 'All Systems Normal',
      message: 'No critical issues detected. All metrics are within acceptable ranges.',
      icon: 'default',
    });
  }

  return alerts;
}

function AlertCard({ alert }: { alert: Alert }) {
  const navigate = useNavigate();

  const styles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
      metricBg: 'bg-red-100',
      metricColor: 'text-red-800',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      titleColor: 'text-amber-800',
      textColor: 'text-amber-700',
      metricBg: 'bg-amber-100',
      metricColor: 'text-amber-800',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
      metricBg: 'bg-green-100',
      metricColor: 'text-green-800',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
      metricBg: 'bg-blue-100',
      metricColor: 'text-blue-800',
    },
  };

  const style = styles[alert.type];

  const getIcon = () => {
    const iconClass = alert.type === 'critical' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-amber-600' :
                      alert.type === 'success' ? 'text-green-600' : 'text-blue-600';

    switch (alert.icon) {
      case 'map':
        return <MapPin className={`w-5 h-5 ${iconClass}`} />;
      case 'trend-down':
        return <TrendingDown className={`w-5 h-5 ${iconClass}`} />;
      case 'trend-up':
        return <TrendingUp className={`w-5 h-5 ${iconClass}`} />;
      case 'calendar':
        return <Calendar className={`w-5 h-5 ${iconClass}`} />;
      case 'globe':
        return <Globe className={`w-5 h-5 ${iconClass}`} />;
      default:
        return alert.type === 'critical' ? <AlertCircle className={`w-5 h-5 ${iconClass}`} /> :
               alert.type === 'warning' ? <AlertTriangle className={`w-5 h-5 ${iconClass}`} /> :
               <CheckCircle className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const handleClick = () => {
    if (alert.drilldownPath) {
      navigate(alert.drilldownPath);
    }
  };

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
        alert.drilldownPath ? 'cursor-pointer hover:shadow-lg' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className={`${style.iconBg} p-2 rounded-lg flex-shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`font-semibold ${style.titleColor}`}>{alert.title}</h4>
            <div className="flex items-center gap-2">
              {alert.metric && (
                <span
                  className={`${style.metricBg} ${style.metricColor} px-2 py-1 rounded-md text-sm font-bold`}
                >
                  {alert.metric}
                </span>
              )}
              {alert.drilldownPath && (
                <ChevronRight className={`w-4 h-4 ${style.titleColor} opacity-60`} />
              )}
            </div>
          </div>
          <p className={`${style.textColor} text-sm mt-1`}>{alert.message}</p>
          {alert.details && (
            <p className={`${style.textColor} text-xs mt-2 opacity-80`}>
              {alert.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CriticalAlerts({
  monthlyMetrics,
  regionalPerformance,
  channelPerformance,
  isLoading,
}: CriticalAlertsProps) {
  const alerts = generateAlerts(monthlyMetrics, regionalPerformance, channelPerformance);

  // Sort alerts: critical first, then warning, then info, then success
  const sortedAlerts = alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, success: 3 };
    return order[a.type] - order[b.type];
  });

  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Critical Alerts</h3>
            <p className="text-sm text-gray-500">Automated threat detection system</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {warningCount} Warning
            </span>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              All Clear
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAlerts.map((alert, index) => (
            <AlertCard key={index} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
