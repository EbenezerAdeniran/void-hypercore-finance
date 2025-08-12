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
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositMethod, setDepositMethod] = useState<"bank_transfer" | "card" | "mobile_money">("bank_transfer");
  const [depositResult, setDepositResult] = useState<any>(null);
  const { toast } = useToast();

  const handleDepositSubmit = async () => {
    const amountNum = Number(depositAmount);
    if (!amountNum || amountNum <= 0) {
      toast({ title: "Invalid amount", description: "Enter an amount greater than 0" });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('deposit', {
        body: { amount: amountNum, method: depositMethod },
      });
      if (error) throw error;
      setDepositResult(data);
      toast({ title: "Deposit initialized", description: `Reference ${data?.reference || ''}` });
    } catch (e: any) {
      toast({ title: "Deposit failed", description: e?.message || 'Please try again' });
    }
  };

  const { data: recentTransactions } = useQuery<any[]>({
    queryKey: ['transactions', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, description, created_at, amount, type, category')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: allTransactions } = useQuery<any[]>({
    queryKey: ['transactions','all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type');
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalBalance = useMemo(() => {
    if (!allTransactions) return 0;
    return allTransactions.reduce((sum: number, t: any) => {
      const amt = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount);
      const type = (t.type ?? '').toLowerCase();
      const isIncome = type === 'income' || type === 'credit';
      return sum + (isIncome ? amt : -amt);
    }, 0);
  }, [allTransactions]);

  const { data: savingsGoals } = useQuery<any[]>({
    queryKey: ['savings_goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('id, title, current_amount, target_amount, created_at, updated_at');
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalSavings = useMemo(() => {
    if (!savingsGoals) return 0;
    return savingsGoals.reduce((sum: number, g: any) => {
      const amt = typeof g.current_amount === 'number' ? g.current_amount : parseFloat(g.current_amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [savingsGoals]);

  const totalSavingsTarget = useMemo(() => {
    if (!savingsGoals) return 0;
    return savingsGoals.reduce((sum: number, g: any) => {
      const amt = typeof g.target_amount === 'number' ? g.target_amount : parseFloat(g.target_amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [savingsGoals]);

  const savingsPercent = totalSavingsTarget > 0 ? Math.min(100, (totalSavings / totalSavingsTarget) * 100) : 0;

  const { data: loans } = useQuery<any[]>({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('id, status, amount');
      if (error) throw error;
      return data ?? [];
    },
  });

  const activeLoansAmount = useMemo(() => {
    if (!loans) return 0;
    const activeStatuses = new Set(['approved', 'active', 'pending']);
    return loans.reduce((sum: number, l: any) => {
      const status = (l.status ?? '').toLowerCase();
      if (!activeStatuses.has(status)) return sum;
      const amt = typeof l.amount === 'number' ? l.amount : parseFloat(l.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }, [loans]);

  useEffect(() => {
    document.title = 'Dashboard | HYPERCORE Finance';
  }, []);


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
                  {balanceVisible ? totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '••••••••'}
                </div>
                <div className="flex items-center space-x-2 text-sm text-success mt-2">
                  <ArrowUp className="h-4 w-4" />
                  <span>Live balance from transactions</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings</CardTitle>
                <PiggyBank className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {totalSavings.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
                <Progress value={savingsPercent} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">{Math.round(savingsPercent)}% of {totalSavingsTarget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} total goals</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <Banknote className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  {activeLoansAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Active loans total</p>
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
                <Button variant="outline" className="h-24 flex-col space-y-2" onClick={() => setDepositOpen(true)}>
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
                  {recentTransactions && recentTransactions.length > 0 ? (
                    recentTransactions.map((tx: any) => {
                      const type = (tx.type ?? '').toLowerCase();
                      const isCredit = type === 'income' || type === 'credit';
                      const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount);
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit ? 'bg-success/20' : 'bg-destructive/20'}`}>
                              {isCredit ? (
                                <ArrowUp className="h-4 w-4 text-success" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{tx.description || 'No description'}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(tx.created_at), 'PP p')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isCredit ? 'text-success' : 'text-destructive'}`}>
                              {isCredit ? '+' : '-'}
                              {Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.category}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                  )}
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
                  {savingsGoals && savingsGoals.length > 0 ? (
                    savingsGoals.map((g: any) => {
                      const current = typeof g.current_amount === 'number' ? g.current_amount : parseFloat(g.current_amount);
                      const target = typeof g.target_amount === 'number' ? g.target_amount : parseFloat(g.target_amount);
                      const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                      return (
                        <div key={g.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{g.title}</span>
                            <span>
                              {current.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} /{' '}
                              {target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No savings goals yet</p>
                  )}

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