import {StockInfoService} from './Stock';
import UserHoldingsService from './UserHolding';

export async function StockHoldingsInfoByUser(userId: string) {

  const userHoldingsService = new UserHoldingsService(userId);
  const userHoldings = await userHoldingsService.getUserHoldings();

  const stockInfoPromises = userHoldings.map(async (holding: any) => {
    const stockService = new StockInfoService(holding.symbol);
    await stockService.fetchAll();
    return {
      id: Date.now().toString(), // Placeholder, replace with actual ID if available
      symbol: holding.symbol,
      name: stockService.info?.description || 'N/A',
      currentPrice: stockService.price,
      averagePrice: holding.avg_cost,
      shares: holding.quantity,
      dayChange: stockService.dayChange,
      dayChangePercent: stockService.dayChangePercent,
      marketValue: stockService.price != null? stockService.price * holding.quantity : 0,
      totalReturn: stockService.price != null? (stockService.price - holding.avg_cost) * holding.quantity : 0,
      totalReturnPercent: stockService.price != null? ((stockService.price - holding.avg_cost) / holding.avg_cost) * 100 : 0,
    };
  });
  const stockHoldingsInfo = await Promise.all(stockInfoPromises);
  return stockHoldingsInfo;
}