import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { MoreHorizontal, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from './Dashboard';

interface HoldingsTableProps {
  stocks: Stock[];
  onRemoveStock: (stockId: string) => void;
}

export function HoldingsTable({ stocks, onRemoveStock }: HoldingsTableProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
        <CardDescription>
          Current positions in your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">Day Change</TableHead>
                <TableHead className="text-right">Total Return</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={stock.name}>
                      {stock.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{stock.shares}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stock.averagePrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stock.currentPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(stock.marketValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`font-medium ${
                        stock.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(stock.dayChange)}
                      </span>
                      <Badge 
                        variant={stock.dayChangePercent >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {formatPercent(stock.dayChangePercent)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`font-medium ${
                        stock.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(stock.totalReturn)}
                      </span>
                      <Badge 
                        variant={stock.totalReturnPercent >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {stock.totalReturnPercent >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercent(stock.totalReturnPercent)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onRemoveStock(stock.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {stocks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No stocks in your portfolio yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the "Add Holding" button to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}