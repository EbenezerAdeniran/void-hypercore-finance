import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Zap,
  PiggyBank
} from "lucide-react";
import { useState } from "react";

const Savings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showNewGoal, setShowNewGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState<number | "">("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [initialAmount, setInitialAmount] = useState<number | "">("");

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["savings_goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"savings_goals">[];
    },
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("savings_goals")
        .insert({
          user_id: user.id,
          title: goalName,
          target_amount: Number(targetAmount || 0),
          current_amount: Number(initialAmount || 0),
          target_date: targetDate ? targetDate : null,
        })
        .select("*")
        .single();
      if (error) throw error;
      if (Number(initialAmount) > 0) {
        await supabase.from("transactions").insert({
          user_id: user.id,
          amount: Number(initialAmount),
          type: "credit",
          category: "savings",
          description: `Initial deposit to "${goalName}"`,
          date: new Date().toISOString().slice(0,10),
        });
      }
      return data as Tables<"savings_goals">;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals", user?.id] });
      toast({ title: "Goal created", description: "Your savings goal was created." });
      setShowNewGoal(false);
      setGoalName(""); setTargetAmount(""); setTargetDate(""); setInitialAmount("");
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" as any });
    }
  });

  const [depositOpen, setDepositOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Tables<"savings_goals"> | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | "">("");

  const depositMutation = useMutation({
    mutationFn: async () => {
      if (!user || !activeGoal) throw new Error("Missing data");
      const amount = Number(depositAmount || 0);
      if (amount <= 0) throw new Error("Enter a valid amount");
      const { error: upErr } = await supabase
        .from("savings_goals")
        .update({ current_amount: (activeGoal.current_amount || 0) + amount })
        .eq("id", activeGoal.id)
        .eq("user_id", user.id);
      if (upErr) throw upErr;
      const { error: txErr } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount,
        type: "credit",
        category: "savings",
        description: `Deposit to "${activeGoal.title}"`,
        date: new Date().toISOString().slice(0,10),
      });
      if (txErr) throw txErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings_goals", user?.id] });
      setDepositOpen(false);
      setDepositAmount("");
      setActiveGoal(null);
      toast({ title: "Deposit successful", description: "Funds added to your goal." });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" as any });
    }
  });

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="min-h-screen void-gradient">
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <Navigation className="relative z-10" />

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-glow">Savings Goals</h1>
              <p className="text-muted-foreground">Build your financial future with smart saving</p>
            </div>
            <Badge variant="secondary" className="hypercore-glow">
              HYPERCORE VAULT
            </Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                <PiggyBank className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">${totalSaved.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Across all goals</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">${totalTarget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Total savings target</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{overallProgress.toFixed(1)}%</div>
                <Progress value={overallProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your savings efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  className="hypercore-glow flex-1"
                  onClick={() => setShowNewGoal(!showNewGoal)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Goal
                </Button>
                <Button variant="outline" className="flex-1">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
                <Button variant="outline" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Auto-Save Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* New Goal Form */}
          {showNewGoal && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-primary/50">
            <CardHeader>
              <CardTitle className="text-primary">Create New Savings Goal</CardTitle>
              <CardDescription>Set up a new financial target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input id="goal-name" placeholder="e.g., Dream Vacation" value={goalName} onChange={(e)=>setGoalName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount</Label>
                  <Input id="target-amount" type="number" placeholder="5000" value={targetAmount} onChange={(e)=>setTargetAmount(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input id="deadline" type="date" value={targetDate} onChange={(e)=>setTargetDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-amount">Initial Deposit</Label>
                  <Input id="initial-amount" type="number" placeholder="100" value={initialAmount} onChange={(e)=>setInitialAmount(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button className="hypercore-glow" onClick={()=>createGoal.mutate()} disabled={createGoal.isPending}>
                  <Zap className="h-4 w-4 mr-2" />
                  {createGoal.isPending ? "Creating..." : "Create Goal"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewGoal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Savings Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const progress = (Number(goal.current_amount || 0) / Number(goal.target_amount || 0)) * 100 || 0;
              const remaining = Number(goal.target_amount || 0) - Number(goal.current_amount || 0);
              return (
                <Card key={goal.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center`}>
                          <PiggyBank className={`h-6 w-6 text-primary`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>
                            {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : "No target date"}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {progress.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          ${Number(goal.current_amount || 0).toLocaleString()} / ${Number(goal.target_amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-bold text-lg">${remaining.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={()=>{ setActiveGoal(goal); setDepositOpen(true); }}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Funds
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add funds to savings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {activeGoal ? `Goal: ${activeGoal.title}` : ""}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Amount</Label>
                  <Input id="deposit-amount" type="number" value={depositAmount} onChange={(e)=>setDepositAmount(e.target.value === "" ? "" : Number(e.target.value))} placeholder="100" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setDepositOpen(false)}>Cancel</Button>
                <Button onClick={()=>depositMutation.mutate()} disabled={depositMutation.isPending}>
                  {depositMutation.isPending ? "Processing..." : "Add Funds"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Savings Tips */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>HYPERCORE Savings Tips</CardTitle>
              <CardDescription>Optimize your savings strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Auto-Save</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up automatic transfers to reach your goals faster
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Target className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="font-semibold">Smart Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Break large goals into smaller, achievable milestones
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <h3 className="font-semibold">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Regular monitoring keeps you motivated and on track
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Savings;