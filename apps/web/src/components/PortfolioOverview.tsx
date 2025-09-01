import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity } from 'lucide-react';
import { PortfolioData } from './Dashboard';

interface PortfolioOverviewProps {
  portfolioData: PortfolioData;
}

export function PortfolioOverview({ portfolioData }: PortfolioOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    portfolioData &&
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(portfolioData.totalValue)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Portfolio worth</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Return */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Return</CardTitle>
          {portfolioData.totalReturn >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(portfolioData.totalReturn)}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Badge 
              variant={portfolioData.totalReturnPercent >= 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {formatPercent(portfolioData.totalReturnPercent)}
            </Badge>
            <span className="text-muted-foreground">all time</span>
          </div>
        </CardContent>
      </Card>

      {/* Day Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            portfolioData.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(portfolioData.dayChange)}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Badge 
              variant={portfolioData.dayChangePercent >= 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {formatPercent(portfolioData.dayChangePercent)}
            </Badge>
            <span className="text-muted-foreground">today</span>
          </div>
        </CardContent>
      </Card>

      {/* Cost Basis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(portfolioData.totalCost)}
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Total invested</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}