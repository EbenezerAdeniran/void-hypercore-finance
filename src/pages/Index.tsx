import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, TrendingUp, Target, CreditCard, Bot, ArrowRight, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-fintech.jpg";

const Index = () => {
  return (
    <div className="min-h-screen void-gradient">
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      {/* Navigation */}
      <Navigation className="relative z-10" />

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-accent hypercore-glow">
                  VOID ∞ HYPERCORE
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-glow">
                  ThriftPay
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  The ultimate fintech platform for saving, borrowing, and managing your financial future with AI-powered insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="hypercore-glow text-lg px-8">
                  Launch Platform
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>AI-powered insights</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 hypercore-gradient opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="ThriftPay VOID HYPERCORE Interface"
                className="relative z-10 rounded-2xl border border-border/50 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-glow">Hypercore Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced financial tools powered by cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Savings</CardTitle>
                <CardDescription>
                  AI-optimized savings goals with automated micro-investments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Instant Loans</CardTitle>
                <CardDescription>
                  Real-time loan approval with blockchain-verified credit scoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Quantum Transactions</CardTitle>
                <CardDescription>
                  Lightning-fast, secure payments with advanced encryption
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  GOD MODE financial advisor with predictive analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Void Security</CardTitle>
                <CardDescription>
                  Military-grade encryption with biometric authentication
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Hypercore Analytics</CardTitle>
                <CardDescription>
                  Real-time financial insights with quantum computing power
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8 p-12 rounded-3xl border border-border/50 bg-card/20 backdrop-blur-lg">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-glow">
                Enter the Hypercore
              </h2>
              <p className="text-xl text-muted-foreground">
                Join the financial revolution and experience the future of money management
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="hypercore-glow text-lg px-12">
                Start Your Journey
                <Zap className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-12">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 ThriftPay VOID ∞ HYPERCORE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;