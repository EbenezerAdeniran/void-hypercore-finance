import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Settings, Home, CreditCard, Target, TrendingUp, Zap } from "lucide-react";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("flex items-center justify-between p-6", className)}>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Zap className="h-8 w-8 text-primary hypercore-glow" />
            <div className="absolute inset-0 animate-pulse">
              <Zap className="h-8 w-8 text-accent opacity-50" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-glow">ThriftPay</h1>
            <p className="text-xs text-muted-foreground">VOID ∞ HYPERCORE</p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <Button variant="ghost" className="text-foreground hover:text-primary">
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
        <Button variant="ghost" className="text-foreground hover:text-primary">
          <CreditCard className="h-4 w-4 mr-2" />
          Transactions
        </Button>
        <Button variant="ghost" className="text-foreground hover:text-primary">
          <Target className="h-4 w-4 mr-2" />
          Savings
        </Button>
        <Button variant="ghost" className="text-foreground hover:text-primary">
          <TrendingUp className="h-4 w-4 mr-2" />
          Loans
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
        <Button size="sm" className="hypercore-glow">
          Get Started
        </Button>
      </div>
    </nav>
  );
}