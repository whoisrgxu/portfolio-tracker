import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Stock } from './Dashboard';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (stock: Omit<Stock, 'id' | 'marketValue' | 'totalReturn' | 'totalReturnPercent'>) => void;
}

// Mock stock data for search suggestions
const stockSuggestions = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 173.50 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 338.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 140.85 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 127.74 },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 248.50 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 875.30 },
  { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 296.42 },
  { symbol: 'NFLX', name: 'Netflix Inc.', currentPrice: 432.11 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', currentPrice: 142.68 },
  { symbol: 'CRM', name: 'Salesforce Inc.', currentPrice: 215.30 }
];

export function AddStockModal({ isOpen, onClose, onAddStock }: AddStockModalProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [dayChange, setDayChange] = useState('');
  const [dayChangePercent, setDayChangePercent] = useState('');
  const [suggestions, setSuggestions] = useState<typeof stockSuggestions>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSymbolChange = (value: string) => {
    setSymbol(value.toUpperCase());
    
    if (value.length > 0) {
      const filtered = stockSuggestions.filter(stock => 
        stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
        stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: typeof stockSuggestions[0]) => {
    setSymbol(suggestion.symbol);
    setName(suggestion.name);
    setCurrentPrice(suggestion.currentPrice.toString());
    setShowSuggestions(false);
    
    // Generate mock day change data
    const mockDayChange = (Math.random() - 0.5) * 10; // Random change between -5 and +5
    const mockDayChangePercent = (mockDayChange / suggestion.currentPrice) * 100;
    setDayChange(mockDayChange.toFixed(2));
    setDayChangePercent(mockDayChangePercent.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !name || !shares || !averagePrice || !currentPrice) {
      return;
    }

    onAddStock({
      symbol,
      name,
      shares: parseFloat(shares),
      averagePrice: parseFloat(averagePrice),
      currentPrice: parseFloat(currentPrice),
      dayChange: parseFloat(dayChange) || 0,
      dayChangePercent: parseFloat(dayChangePercent) || 0,
    });

    // Reset form
    setSymbol('');
    setName('');
    setShares('');
    setAveragePrice('');
    setCurrentPrice('');
    setDayChange('');
    setDayChangePercent('');
    setShowSuggestions(false);
    
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setSymbol('');
    setName('');
    setShares('');
    setAveragePrice('');
    setCurrentPrice('');
    setDayChange('');
    setDayChangePercent('');
    setShowSuggestions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Stock to Portfolio</DialogTitle>
          <DialogDescription>
            Enter the details of the stock you want to add to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., AAPL"
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.symbol}
                    className="p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="font-medium">{suggestion.symbol}</div>
                    <div className="text-sm text-muted-foreground">{suggestion.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${suggestion.currentPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              placeholder="e.g., Apple Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                step="0.01"
                placeholder="e.g., 100"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="averagePrice">Average Price</Label>
              <Input
                id="averagePrice"
                type="number"
                step="0.01"
                placeholder="e.g., 150.00"
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentPrice">Current Price</Label>
            <Input
              id="currentPrice"
              type="number"
              step="0.01"
              placeholder="e.g., 173.50"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayChange">Day Change ($)</Label>
              <Input
                id="dayChange"
                type="number"
                step="0.01"
                placeholder="e.g., -2.50"
                value={dayChange}
                onChange={(e) => setDayChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dayChangePercent">Day Change (%)</Label>
              <Input
                id="dayChangePercent"
                type="number"
                step="0.01"
                placeholder="e.g., -1.42"
                value={dayChangePercent}
                onChange={(e) => setDayChangePercent(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Stock</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}