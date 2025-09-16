import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

type Sector = {
  name: string;
  percentage: number;
};

type AnalyticsData = {
  sharpe_ratio: number;
  sharpe_ratio_change?: string;
  beta: number;
  beta_change?: string;
  volatility: number;
  volatility_change?: string;
  max_drawdown: number;
  drawdown_change?: string;
  value_at_risk: number;
  expected_shortfall: number;
  correlation_to_sp500: number;
  information_ratio: number;
  sector_exposure?: Sector[];
};
export function Analytics({ userId }) {
  
  const baseUrl: string = (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:8000"
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        console.log("Right before fetching!")
        const res = await fetch(`${baseUrl}/portfolio/analytics?user_id=${userId}`);
        console.log("fetched analytics: ",res.body);
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchAnalytics();
  }, [userId]);

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics available.</div>;

  const metrics = [
    {
      title: 'Sharpe Ratio',
      value: analytics.sharpe_ratio,
      description: 'Risk-adjusted return',
      trend: analytics.sharpe_ratio >= 0 ? 'up' : 'down',
      change: analytics.sharpe_ratio_change || '--'
    },
    {
      title: 'Beta',
      value: analytics.beta,
      description: 'Market sensitivity',
      trend: analytics.beta >= 1 ? 'up' : 'down',
      change: analytics.beta_change || '--'
    },
    {
      title: 'Volatility',
      value: `${analytics.volatility}%`,
      description: 'Standard deviation',
      trend: 'up',
      change: analytics.volatility_change || '--'
    },
    {
      title: 'Max Drawdown',
      value: `${analytics.max_drawdown}%`,
      description: 'Largest peak-to-trough decline',
      trend: 'down',
      change: analytics.drawdown_change || '--'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Advanced portfolio metrics and risk analysis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs">
                <Badge
                  variant={metric.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {metric.change}
                </Badge>
                <span className="text-muted-foreground">{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Risk Metrics
            </CardTitle>
            <CardDescription>Portfolio risk analysis over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Value at Risk (95%)</span>
                <span className="text-sm">${analytics.value_at_risk}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expected Shortfall</span>
                <span className="text-sm">${analytics.expected_shortfall}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Correlation to S&P 500</span>
                <span className="text-sm">{analytics.correlation_to_sp500}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Information Ratio</span>
                <span className="text-sm">{analytics.information_ratio}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* You can keep Sector Analysis static or fetch from backend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sector Analysis
            </CardTitle>
            <CardDescription>
              Portfolio exposure by sector
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics.sector_exposure || []).map((sector) => (
                <div key={sector.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">{sector.name}</span>
                  </div>
                  <span className="text-sm">{sector.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
