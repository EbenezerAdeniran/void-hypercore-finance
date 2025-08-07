import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  CreditCard, 
  ArrowUp, 
  ArrowDown,
  Eye,
  EyeOff,
  Plus,
  Send,
  Wallet,
  PiggyBank,
  Banknote
} from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const mockTransactions = [
    { id: 1, type: 'credit', amount: 2500, description: 'Salary Deposit', date: '2024-01-15', category: 'Income' },
    { id: 2, type: 'debit', amount: 45.99, description: 'Grocery Store', date: '2024-01-14', category: 'Food' },
    { id: 3, type: 'debit', amount: 120.00, description: 'Electric Bill', date: '2024-01-13', category: 'Utilities' },
    { id: 4, type: 'credit', amount: 500.00, description: 'Freelance Payment', date: '2024-01-12', category: 'Income' },
  ];

  return (
    <div className="min-h-screen void-gradient">
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <Navigation className="relative z-10" />

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-glow">HYPERCORE Dashboard</h1>
              <p className="text-muted-foreground">Welcome to your financial command center</p>
            </div>
            <Badge variant="secondary" className="hypercore-glow">
              VOID ∞ ONLINE
            </Badge>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="h-8 w-8 p-0"
                >
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-glow">
                  {balanceVisible ? '$12,847.32' : '••••••••'}
                </div>
                <div className="flex items-center space-x-2 text-sm text-success mt-2">
                  <ArrowUp className="h-4 w-4" />
                  <span>+2.5% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings</CardTitle>
                <PiggyBank className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">$3,420.00</div>
                <Progress value={68} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">68% of $5,000 goal</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <Banknote className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">$8,240.00</div>
                <p className="text-xs text-muted-foreground mt-2">Next payment: $420 due Jan 30</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your finances with one click</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-24 flex-col space-y-2 hypercore-glow">
                  <Send className="h-6 w-6" />
                  <span>Send Money</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Wallet className="h-6 w-6" />
                  <span>Add Funds</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Target className="h-6 w-6" />
                  <span>New Goal</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col space-y-2">
                  <Plus className="h-6 w-6" />
                  <span>Apply Loan</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                        }`}>
                          {transaction.type === 'credit' ? 
                            <ArrowUp className="h-4 w-4 text-success" /> : 
                            <ArrowDown className="h-4 w-4 text-destructive" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'credit' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Savings Goals */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Savings Goals</CardTitle>
                <CardDescription>Track your financial objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Emergency Fund</span>
                      <span>$3,420 / $5,000</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vacation Fund</span>
                      <span>$1,250 / $3,000</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Car</span>
                      <span>$8,900 / $25,000</span>
                    </div>
                    <Progress value={36} className="h-2" />
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Goal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;