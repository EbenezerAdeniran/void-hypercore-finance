import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowUp, 
  ArrowDown,
  Search,
  Filter,
  Download,
  CreditCard,
  Zap,
  Calendar,
  DollarSign
} from "lucide-react";
import { useState } from "react";

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const mockTransactions = [
    { id: 1, type: 'credit', amount: 2500.00, description: 'Salary Deposit - TechCorp', date: '2024-01-15', time: '09:30 AM', category: 'Income', status: 'completed' },
    { id: 2, type: 'debit', amount: 45.99, description: 'Whole Foods Market', date: '2024-01-14', time: '06:45 PM', category: 'Food & Dining', status: 'completed' },
    { id: 3, type: 'debit', amount: 120.00, description: 'ConEd Electric Bill', date: '2024-01-13', time: '02:15 PM', category: 'Utilities', status: 'completed' },
    { id: 4, type: 'credit', amount: 500.00, description: 'Freelance Payment - WebDesign', date: '2024-01-12', time: '11:20 AM', category: 'Income', status: 'completed' },
    { id: 5, type: 'debit', amount: 89.99, description: 'Netflix Subscription', date: '2024-01-11', time: '03:00 PM', category: 'Entertainment', status: 'completed' },
    { id: 6, type: 'debit', amount: 250.00, description: 'Car Insurance Payment', date: '2024-01-10', time: '10:45 AM', category: 'Insurance', status: 'completed' },
    { id: 7, type: 'credit', amount: 1200.00, description: 'Investment Dividend', date: '2024-01-09', time: '12:00 PM', category: 'Investment', status: 'completed' },
    { id: 8, type: 'debit', amount: 75.50, description: 'Gas Station Fill-up', date: '2024-01-08', time: '08:30 AM', category: 'Transportation', status: 'completed' },
  ];

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalCredit = mockTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = mockTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen void-gradient">
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <Navigation className="relative z-10" />

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-glow">Transaction History</h1>
              <p className="text-muted-foreground">Track all your financial activities</p>
            </div>
            <Badge variant="secondary" className="hypercore-glow">
              HYPERCORE LEDGER
            </Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <ArrowUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">+${totalCredit.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-2">This period</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <ArrowDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">-${totalDebit.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-2">This period</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  ${(totalCredit - totalDebit).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">This period</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle>Transaction Controls</CardTitle>
                  <CardDescription>Filter and search your transactions</CardDescription>
                </div>
                <Button variant="outline" className="w-fit">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="credit">Income Only</SelectItem>
                    <SelectItem value="debit">Expenses Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Showing {filteredTransactions.length} of {mockTransactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                      }`}>
                        {transaction.type === 'credit' ? 
                          <ArrowUp className="h-5 w-5 text-success" /> : 
                          <ArrowDown className="h-5 w-5 text-destructive" />
                        }
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{transaction.description}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{transaction.date}</span>
                          </div>
                          <span>{transaction.time}</span>
                          <Badge variant="outline" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'credit' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="text-xs mt-1"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No transactions found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Transactions;