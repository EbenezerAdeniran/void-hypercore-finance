import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Mail, Lock, User, ArrowRight } from "lucide-react";

const Auth = () => {
  return (
    <div className="min-h-screen void-gradient">
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <Navigation className="relative z-10" />

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Zap className="h-12 w-12 text-primary hypercore-glow" />
                <div className="absolute inset-0 animate-pulse">
                  <Zap className="h-12 w-12 text-accent opacity-50" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-glow">Access HYPERCORE</h1>
            <p className="text-muted-foreground mt-2">
              Enter the financial void to begin your journey
            </p>
          </div>

          <Card className="border-border/50 bg-card/20 backdrop-blur-lg">
            <CardContent className="p-6">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button className="w-full hypercore-glow mt-6">
                    Access Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button variant="ghost" className="w-full text-sm">
                    Forgot your access codes?
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        type="text" 
                        placeholder="John Doe"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="your@email.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button className="w-full hypercore-glow mt-6">
                    Initialize HYPERCORE
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By signing up, you agree to enter the VOID ∞ HYPERCORE
                  </p>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span>Military-grade encryption</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Badge variant="secondary" className="hypercore-glow">
              🔐 VOID ∞ SECURE
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Note: For full authentication functionality, connect to Supabase
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;