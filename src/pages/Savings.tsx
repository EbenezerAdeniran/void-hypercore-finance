import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus, 
  Calendar,
  DollarSign,
  TrendingUp,
  Zap,
  PiggyBank,
  Car,
  Home,
  Plane,
  GraduationCap
} from "lucide-react";
import { useState } from "react";

const Savings = () => {
  const [showNewGoal, setShowNewGoal] = useState(false);

  const mockSavingsGoals = [
    {
      id: 1,
      name: "Emergency Fund",
      target: 5000,
      current: 3420,
      deadline: "2024-12-31",
      category: "Emergency",
      icon: PiggyBank,
      color: "text-success"
    },
    {
      id: 2,
      name: "Vacation to Japan",
      target: 3000,
      current: 1250,
      deadline: "2024-08-15",
      category: "Travel",
      icon: Plane,
      color: "text-accent"
    },
    {
      id: 3,
      name: "New Car",
      target: 25000,
      current: 8900,
      deadline: "2025-06-30",
      category: "Transportation",
      icon: Car,
      color: "text-primary"
    },
    {
      id: 4,
      name: "House Down Payment",
      target: 50000,
      current: 12500,
      deadline: "2026-01-01",
      category: "Housing",
      icon: Home,
      color: "text-warning"
    }
  ];

  const totalSaved = mockSavingsGoals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = mockSavingsGoals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

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
                    <Input id="goal-name" placeholder="e.g., Dream Vacation" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-amount">Target Amount</Label>
                    <Input id="target-amount" type="number" placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Target Date</Label>
                    <Input id="deadline" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initial-amount">Initial Deposit</Label>
                    <Input id="initial-amount" type="number" placeholder="100" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button className="hypercore-glow">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Goal
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
            {mockSavingsGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const remaining = goal.target - goal.current;
              const IconComponent = goal.icon;
              
              return (
                <Card key={goal.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center`}>
                          <IconComponent className={`h-6 w-6 ${goal.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <CardDescription>{goal.category}</CardDescription>
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
                          ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
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
                          {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
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