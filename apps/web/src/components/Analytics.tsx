import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

export function Analytics() {
  const metrics = [
    {
      title: 'Sharpe Ratio',
      value: '1.42',
      description: 'Risk-adjusted return',
      trend: 'up',
      change: '+0.12'
    },
    {
      title: 'Beta',
      value: '0.89',
      description: 'Market sensitivity',  
      trend: 'down',
      change: '-0.05'
    },
    {
      title: 'Volatility',
      value: '18.5%',
      description: 'Standard deviation',
      trend: 'up',
      change: '+1.2%'
    },
    {
      title: 'Max Drawdown',
      value: '12.3%',
      description: 'Largest peak-to-trough decline',
      trend: 'down',
      change: '-2.1%'
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
                  variant={metric.trend === 'up' ? "default" : "destructive"}
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
            <CardDescription>
              Portfolio risk analysis over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Value at Risk (95%)</span>
                <span className="text-sm">$8,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expected Shortfall</span>
                <span className="text-sm">$12,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Correlation to S&P 500</span>
                <span className="text-sm">0.73</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Information Ratio</span>
                <span className="text-sm">0.89</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Technology</span>
                </div>
                <span className="text-sm">42.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Healthcare</span>
                </div>
                <span className="text-sm">18.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium">Financial</span>
                </div>
                <span className="text-sm">15.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">Consumer Goods</span>
                </div>
                <span className="text-sm">12.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Other</span>
                </div>
                <span className="text-sm">10.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}