import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PortfolioData } from './Dashboard';

interface PerformanceChartProps {
  portfolioData: PortfolioData;
}

// Mock historical data for the chart
const generateHistoricalData = (currentValue: number) => {
  const data: { date: string; value: number }[] = [];
  const startValue = currentValue * 0.85; // Start 15% lower
  const dataPoints = 30; // 30 days of data
  
  for (let i = 0; i < dataPoints; i++) {
    const progress = i / (dataPoints - 1);
    const volatility = Math.sin(i * 0.5) * 0.02; // Add some volatility
    const trendValue = startValue + (currentValue - startValue) * progress;
    const value = trendValue * (1 + volatility);
    
    const date = new Date();
    date.setDate(date.getDate() - (dataPoints - 1 - i));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value * 100) / 100,
    });
  }
  
  return data;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function PerformanceChart({ portfolioData }: PerformanceChartProps) {
  const historicalData = generateHistoricalData(portfolioData.totalValue);
  
  const allocationData = portfolioData.stocks.map((stock, index) => ({
    name: stock.symbol,
    value: stock.marketValue,
    percentage: ((stock.marketValue / portfolioData.totalValue) * 100).toFixed(1),
    color: COLORS[index % COLORS.length]
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Value: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-primary">
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.percentage}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="line" className="space-y-4">
        <TabsList>
          <TabsTrigger value="line">Performance Trend</TabsTrigger>
          <TabsTrigger value="allocation">Allocation Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>
                30-day portfolio value trend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      className="text-muted-foreground"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>
                Distribution of your investments by stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="h-[400px] flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="lg:w-64 space-y-3">
                  <h4 className="font-medium">Breakdown</h4>
                  {allocationData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.percentage}%</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}