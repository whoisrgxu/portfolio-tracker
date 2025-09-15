import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { PortfolioOverview } from './PortfolioOverview';
import { HoldingsTable } from './HoldingsTable';
import { PerformanceChart } from './PerformanceChart';
import { AddStockModal } from './AddStockModal';
import { getCurrentUser } from '../auth/login';
import { Stock } from '../Types/StockHoldingsInfo';
import {StockHoldingsInfoByUser} from '../utils/StockHoldingsInfoByUser';
import UserHoldingsService from '../utils/UserHolding';
import { supabase } from '../lib/supabase';

export interface PortfolioData {
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  stocks: Stock[];
}

// const mockPortfolioData: PortfolioData = {
//   totalValue: 125430.50,
//   totalCost: 118900.00,
//   totalReturn: 6530.50,
//   totalReturnPercent: 5.49,
//   dayChange: -850.25,
//   dayChangePercent: -0.67,
//   stocks: [
//     {
//       id: '1',
//       symbol: 'AAPL',
//       name: 'Apple Inc.',
//       shares: 50,
//       averagePrice: 145.30,
//       currentPrice: 173.50,
//       marketValue: 8675.00,
//       dayChange: -125.00,
//       dayChangePercent: -1.42,
//       totalReturn: 1410.00,
//       totalReturnPercent: 19.42
//     },
//     {
//       id: '2',
//       symbol: 'MSFT',
//       name: 'Microsoft Corporation',
//       shares: 35,
//       averagePrice: 285.60,
//       currentPrice: 338.50,
//       marketValue: 11847.50,
//       dayChange: -210.00,
//       dayChangePercent: -1.74,
//       totalReturn: 1851.50,
//       totalReturnPercent: 18.52
//     },
//     {
//       id: '3',
//       symbol: 'GOOGL',
//       name: 'Alphabet Inc.',
//       shares: 25,
//       averagePrice: 132.40,
//       currentPrice: 140.85,
//       marketValue: 3521.25,
//       dayChange: -87.50,
//       dayChangePercent: -2.42,
//       totalReturn: 211.25,
//       totalReturnPercent: 6.38
//     },
//     {
//       id: '4',
//       symbol: 'TSLA',
//       name: 'Tesla Inc.',
//       shares: 40,
//       averagePrice: 195.75,
//       currentPrice: 248.50,
//       marketValue: 9940.00,
//       dayChange: -320.00,
//       dayChangePercent: -3.12,
//       totalReturn: 2110.00,
//       totalReturnPercent: 26.96
//     },
//     {
//       id: '5',
//       symbol: 'NVDA',
//       name: 'NVIDIA Corporation',
//       shares: 15,
//       averagePrice: 420.80,
//       currentPrice: 875.30,
//       marketValue: 13129.50,
//       dayChange: -195.75,
//       dayChangePercent: -1.47,
//       totalReturn: 6817.00,
//       totalReturnPercent: 108.11
//     }
//   ]
// };

export function Dashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | undefined>({
    totalValue: 0,
    totalCost: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    stocks: []
  });
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);

  // On component mount, check if user is logged in and get their userId
  useEffect(() => {
    const fetchUser = async () => {
      const { user, error } = await getCurrentUser();
      if (!user) {
        setUserId(null);
        return;
      }
      setUserId(user.id);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (session?.user) {
        setUserId(session.user.id);
        // const tempStocks = await StockHoldingsInfoByUser(session.user.id);
        // setStocks(tempStocks);
        // setPortfolioData(getPortfolioData(tempStocks));
      } else {
        setUserId(null);
        setStocks([]); // Clear holdings on logout
      }
    });

    // Cleanup on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Whenever userId changes (i.e., user logs in), we can fetch their holdings
  useEffect(() => {
    if (!userId) {
      console.warn("Waiting for userId before fetching holdings...");
      return;
    }

    const fetchStocks = async () => {
      try {
        const tempStocks = await StockHoldingsInfoByUser(userId);
        console.log("Stocks fetched for user:", tempStocks);
        setStocks(tempStocks);
        setPortfolioData(getPortfolioData(tempStocks));
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
      }
    };

    fetchStocks();
  }, [userId]);

const getPortfolioData = (stocks: Stock[]): PortfolioData => {
  const totalValue = stocks.reduce((sum, s) => sum + s.marketValue, 0);
  const totalCost = stocks.reduce((sum, s) => sum + s.averagePrice * s.shares, 0);
  const totalReturn = totalValue - totalCost;
  const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  const dayChange = stocks.reduce((sum, s) => sum + s.dayChange, 0);
  const dayChangePercent = (totalValue - dayChange) > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalReturn,
    totalReturnPercent,
    dayChange,
    dayChangePercent,
    stocks
  };
};

  const handleAddStock = async(newStock: Omit<Stock, 'id' | 'marketValue' | 'totalReturn' | 'totalReturnPercent'>) => {
    const completeNewStock: Stock = {
      ...newStock,
      id: Date.now().toString(),
      marketValue: newStock.shares * newStock.currentPrice,
      totalReturn: (newStock.currentPrice - newStock.averagePrice) * newStock.shares,
      totalReturnPercent: ((newStock.currentPrice - newStock.averagePrice) / newStock.averagePrice) * 100
    };

    const updatedStocks = [...stocks, completeNewStock];
    const newTotalValue = updatedStocks.reduce((sum, s) => sum + s.marketValue, 0);
    const newTotalCost = updatedStocks.reduce((sum, s) => sum + (s.averagePrice * s.shares), 0);
    const newTotalReturn = newTotalValue - newTotalCost;
    const newTotalReturnPercent = (newTotalReturn / newTotalCost) * 100;
    const newDayChange = updatedStocks.reduce((sum, s) => sum + s.dayChange, 0);
    const newDayChangePercent = (newDayChange / (newTotalValue - newDayChange)) * 100;
    console.log("updatedStocks:", updatedStocks);
    setStocks(updatedStocks);

    const userHoldingsService = new UserHoldingsService(userId!);

    await userHoldingsService.addUserHolding(newStock);

    setPortfolioData({
      ...portfolioData,
      totalValue: newTotalValue,
      totalCost: newTotalCost,
      totalReturn: newTotalReturn,
      totalReturnPercent: newTotalReturnPercent,
      dayChange: newDayChange,
      dayChangePercent: newDayChangePercent,
      stocks: updatedStocks
    });
  };

  const handleRemoveStock = (stockId: string) => {
    const updatedStocks = portfolioData!.stocks.filter(stock => stock.id !== stockId);
    const newTotalValue = updatedStocks.reduce((sum, s) => sum + s.marketValue, 0);
    const newTotalCost = updatedStocks.reduce((sum, s) => sum + (s.averagePrice * s.shares), 0);
    const newTotalReturn = newTotalValue - newTotalCost;
    const newTotalReturnPercent = newTotalCost > 0 ? (newTotalReturn / newTotalCost) * 100 : 0;
    const newDayChange = updatedStocks.reduce((sum, s) => sum + s.dayChange, 0);
    const newDayChangePercent = newTotalValue > 0 ? (newDayChange / (newTotalValue - newDayChange)) * 100 : 0;

    setStocks(updatedStocks);
    setPortfolioData({
      ...portfolioData,
      totalValue: newTotalValue,
      totalCost: newTotalCost,
      totalReturn: newTotalReturn,
      totalReturnPercent: newTotalReturnPercent,
      dayChange: newDayChange,
      dayChangePercent: newDayChangePercent,
      stocks: updatedStocks
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Overview</h1>
          <p className="text-muted-foreground">Track and manage your investment portfolio</p>
        </div>
        <Button onClick={() => setIsAddStockModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Holding
        </Button>
      </div>

      {/* Portfolio Overview Cards */}
      <PortfolioOverview portfolioData={portfolioData!} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="holdings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-3">
          <TabsTrigger value="holdings" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Holdings
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="allocation" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Allocation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-6">
          <HoldingsTable stocks={stocks} onRemoveStock={handleRemoveStock} />
        </TabsContent>

        {/* <TabsContent value="performance" className="space-y-6">
          <PerformanceChart portfolioData={portfolioData!} />
        </TabsContent> */}

        <TabsContent value="allocation" className="space-y-6">
          <Card>
            {/* <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>
                Breakdown of your portfolio by individual holdings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stocks.map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-chart-1" />
                      <div>
                        <p className="font-medium">{stock.symbol}</p>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {((stock.marketValue / portfolioData!.totalValue) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${stock.marketValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent> */}
          </Card>
        </TabsContent>
      </Tabs>
      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onAddStock={handleAddStock}
      />
    </div>
  );
}