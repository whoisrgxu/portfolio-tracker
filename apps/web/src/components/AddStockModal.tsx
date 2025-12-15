import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Stock } from '../Types/StockHoldingsInfo';
import { StockInfoService as StockObj } from '../utils/Stock';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (stock: Omit<Stock, 'id' | 'marketValue' | 'totalReturn' | 'totalReturnPercent'>) => void;
}

// Mock stock data for search suggestions
type StockSuggestion = {
  symbol: string;
  name: string;
  currentPrice: number;
};

// Mock stock suggestions for fallback
const mockStockSuggestions: StockSuggestion[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 173.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 142.30 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 378.85 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 155.20 },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 248.50 },
  { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 320.15 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 875.30 },
  { symbol: 'NFLX', name: 'Netflix Inc.', currentPrice: 485.20 }
];

export function AddStockModal({ isOpen, onClose, onAddStock }: AddStockModalProps) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  // const [dayChange, setDayChange] = useState('');
  // const [dayChangePercent, setDayChangePercent] = useState('');
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestRef = useRef(0);

  const fetchSuggestions = useCallback(async (value: string) => {
    const trimmedValue = value.trim();
    console.log('fetchSuggestions called with:', trimmedValue);

    if (!trimmedValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const requestId = ++latestRequestRef.current;

    // First try to get real data from API
    const stock = new StockObj(trimmedValue);
    try {
      console.log('Fetching stock data for:', trimmedValue);
      await stock.fetchAll();

      if (latestRequestRef.current !== requestId) {
        console.log('Request cancelled, latest request ID:', latestRequestRef.current, 'current request ID:', requestId);
        return;
      }

      console.log('Stock data fetched:', { info: stock.info, price: stock.price });

      if (stock.info && stock.price) {
        const suggestion = {
          symbol: stock.symbol.toUpperCase(),
          name: stock.info.description,
          currentPrice: stock.price,
        };
        console.log('Setting suggestion:', suggestion);
        setSuggestions([suggestion]);
        setShowSuggestions(true);
        setName(suggestion.name);
        setCurrentPrice(suggestion.currentPrice.toString());
      } else {
        console.log('No valid stock data found, trying mock data');
        // Fallback to mock data
        const mockSuggestions = mockStockSuggestions.filter(s => 
          s.symbol.toLowerCase().includes(trimmedValue.toLowerCase()) ||
          s.name.toLowerCase().includes(trimmedValue.toLowerCase())
        );
        if (mockSuggestions.length > 0) {
          console.log('Using mock suggestions:', mockSuggestions);
          setSuggestions(mockSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } catch (error) {
      console.error('Error fetching stock data, using mock data:', error);
      if (latestRequestRef.current === requestId) {
        // Fallback to mock data when API fails
        const mockSuggestions = mockStockSuggestions.filter(s => 
          s.symbol.toLowerCase().includes(trimmedValue.toLowerCase()) ||
          s.name.toLowerCase().includes(trimmedValue.toLowerCase())
        );
        if (mockSuggestions.length > 0) {
          console.log('Using mock suggestions as fallback:', mockSuggestions);
          setSuggestions(mockSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    console.log('useEffect triggered, symbol:', symbol);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!symbol.trim()) {
      console.log('Symbol is empty, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      searchTimeoutRef.current = null;
      return;
    }

    console.log('Setting timeout to fetch suggestions for:', symbol);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(symbol);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [symbol, fetchSuggestions]);

  const handleSuggestionClick = (suggestion: StockSuggestion) => {
    setSymbol(suggestion.symbol);
    setName(suggestion.name);
    setCurrentPrice(suggestion.currentPrice.toString());
    setShowSuggestions(false);
    
    // Generate mock day change data
    const mockDayChange = (Math.random() - 0.5) * 10; // Random change between -5 and +5
    const mockDayChangePercent = (mockDayChange / suggestion.currentPrice) * 100;
    // setDayChange(mockDayChange.toFixed(2));
    // setDayChangePercent(mockDayChangePercent.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !name || !shares || !averagePrice || !currentPrice) {
      return;
    }
    console.log("Adding stock:", {symbol, name, shares, averagePrice, currentPrice});

    onAddStock({
      symbol: symbol.toUpperCase(),
      name,
      shares: parseFloat(shares),
      averagePrice: parseFloat(averagePrice),
      currentPrice: parseFloat(currentPrice),
      dayChange: 0, // Default value for dayChange
      dayChangePercent: 0, // Default value for dayChangePercent
    });

    // Reset form
    setSymbol('');
    setName('');
    setShares('');
    setAveragePrice('');
    setCurrentPrice('');
    // setDayChange('');
    // setDayChangePercent('');
    setShowSuggestions(false);
    
    onClose();
    console.log("Stock added and modal closed.");
  };

  const handleClose = () => {
    // Reset form when closing
    setSymbol('');
    setName('');
    setShares('');
    setAveragePrice('');
    setCurrentPrice('');
    // setDayChange('');
    // setDayChangePercent('');
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
            <div className="flex items-center">
              <Input
              id="symbol"
              placeholder="e.g., AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                    searchTimeoutRef.current = null;
                  }
                  if (suggestions[0]) {
                    handleSuggestionClick(suggestions[0]);
                  } else {
                    fetchSuggestions(symbol);
                  }
                }
              }}
              required
              />
            </div>
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
          
          {/* <div className="grid grid-cols-2 gap-4">
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
            </div> */}
            
            {/* <div className="space-y-2">
              <Label htmlFor="dayChangePercent">Day Change (%)</Label>
              <Input
                id="dayChangePercent"
                type="number"
                step="0.01"
                placeholder="e.g., -1.42"
                value={dayChangePercent}
                onChange={(e) => setDayChangePercent(e.target.value)}
              />
            </div> */}
          {/* </div> */}
          
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
