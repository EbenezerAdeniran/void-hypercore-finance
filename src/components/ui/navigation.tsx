import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, Settings, Home, CreditCard, Target, TrendingUp, Zap, Bot, Send } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={cn("flex items-center justify-between p-6", className)}>
      <Link to="/" className="flex items-center space-x-2">
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
      </Link>

      <div className="hidden md:flex items-center space-x-6">
        <Button 
          variant={isActive('/dashboard') ? 'default' : 'ghost'} 
          className={isActive('/dashboard') ? 'hypercore-glow' : 'text-foreground hover:text-primary'}
          asChild
        >
          <Link to="/dashboard">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        <Button 
          variant={isActive('/transactions') ? 'default' : 'ghost'} 
          className={isActive('/transactions') ? 'hypercore-glow' : 'text-foreground hover:text-primary'}
          asChild
        >
          <Link to="/transactions">
            <CreditCard className="h-4 w-4 mr-2" />
            Transactions
          </Link>
        </Button>
        <Button 
          variant={isActive('/transfers') ? 'default' : 'ghost'} 
          className={isActive('/transfers') ? 'hypercore-glow' : 'text-foreground hover:text-primary'}
          asChild
        >
          <Link to="/transfers">
            <Send className="h-4 w-4 mr-2" />
            Transfers
          </Link>
        </Button>
        <Button 
          variant={isActive('/savings') ? 'default' : 'ghost'} 
          className={isActive('/savings') ? 'hypercore-glow' : 'text-foreground hover:text-primary'}
          asChild
        >
          <Link to="/savings">
            <Target className="h-4 w-4 mr-2" />
            Savings
          </Link>
        </Button>
        <Button 
          variant={isActive('/loans') ? 'default' : 'ghost'} 
          className={isActive('/loans') ? 'hypercore-glow' : 'text-foreground hover:text-primary'}
          asChild
        >
          <Link to="/loans">
            <TrendingUp className="h-4 w-4 mr-2" />
            Loans
          </Link>
        </Button>
        <Button 
          variant={isActive('/ai-assistant') ? 'default' : 'ghost'} 
          className={isActive('/ai-assistant') ? 'hypercore-glow' : 'text-foreground hover:text-primary'}
          asChild
        >
          <Link to="/ai-assistant">
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/auth">Sign In</Link>
        </Button>
        <Button size="sm" className="hypercore-glow" asChild>
          <Link to="/auth">Get Started</Link>
        </Button>
      </div>
    </nav>
  );
}