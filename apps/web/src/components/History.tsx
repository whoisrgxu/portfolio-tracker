import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, Filter, Search } from 'lucide-react';
import { Input } from './ui/input';

export function History() {
  const transactions = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'Buy',
      symbol: 'AAPL',
      quantity: 25,
      price: 185.25,
      total: 4631.25,
      status: 'Completed'
    },
    {
      id: '2',
      date: '2024-01-12',
      type: 'Sell',
      symbol: 'TSLA',
      quantity: 10,
      price: 242.50,
      total: 2425.00,
      status: 'Completed'
    },
    {
      id: '3',
      date: '2024-01-10',
      type: 'Buy',
      symbol: 'MSFT',
      quantity: 15,
      price: 380.00,
      total: 5700.00,
      status: 'Completed'
    },
    {
      id: '4',
      date: '2024-01-08',
      type: 'Dividend',
      symbol: 'AAPL',
      quantity: 50,
      price: 0.24,
      total: 12.00,
      status: 'Completed'
    },
    {
      id: '5',
      date: '2024-01-05',
      type: 'Buy',
      symbol: 'GOOGL',
      quantity: 8,
      price: 145.30,
      total: 1162.40,
      status: 'Pending'
    }
  ];

  const dividends = [
    {
      id: '1',
      date: '2024-01-08',
      symbol: 'AAPL',
      shares: 50,
      rate: 0.24,
      amount: 12.00,
      status: 'Paid'
    },
    {
      id: '2',
      date: '2023-12-15',
      symbol: 'MSFT',
      shares: 35,
      rate: 0.75,
      amount: 26.25,
      status: 'Paid'
    },
    {
      id: '3',
      date: '2023-12-12',
      symbol: 'AAPL',
      shares: 50,
      rate: 0.24,
      amount: 12.00,
      status: 'Paid'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Buy':
        return 'bg-blue-100 text-blue-800';
      case 'Sell':
        return 'bg-green-100 text-green-800';
      case 'Dividend':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'default';
      case 'Pending':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
          <p className="text-muted-foreground">
            View all your trading activity and dividend payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.symbol}
                        </TableCell>
                        <TableCell className="text-right">
                          {transaction.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.total)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dividends">
          <Card>
            <CardHeader>
              <CardTitle>Dividend History</CardTitle>
              <CardDescription>
                Your dividend payments and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Rate per Share</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dividends.map((dividend) => (
                      <TableRow key={dividend.id}>
                        <TableCell>
                          {new Date(dividend.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {dividend.symbol}
                        </TableCell>
                        <TableCell className="text-right">
                          {dividend.shares}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(dividend.rate)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(dividend.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(dividend.status)}>
                            {dividend.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}