import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/ui/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Banknote,
  Calculator
} from "lucide-react";
import { useState } from "react";

const Loans = () => {
  const [showApplication, setShowApplication] = useState(false);

  const mockLoans = [
    {
      id: 1,
      type: "Personal Loan",
      amount: 15000,
      remaining: 8240,
      rate: 4.5,
      term: 36,
      monthlyPayment: 420,
      nextPayment: "2024-01-30",
      status: "active",
      progress: 45
    },
    {
      id: 2,
      type: "Emergency Loan",
      amount: 5000,
      remaining: 0,
      rate: 6.2,
      term: 24,
      monthlyPayment: 0,
      nextPayment: "Completed",
      status: "completed",
      progress: 100
    }
  ];

  const loanApplications = [
    {
      id: 1,
      type: "Auto Loan",
      amount: 25000,
      status: "pending",
      submittedDate: "2024-01-10",
      expectedDecision: "2024-01-20"
    },
    {
      id: 2,
      type: "Home Improvement",
      amount: 10000,
      status: "approved",
      submittedDate: "2024-01-05",
      approvedDate: "2024-01-12"
    }
  ];

  const totalDebt = mockLoans.reduce((sum, loan) => sum + loan.remaining, 0);
  const monthlyPayments = mockLoans
    .filter(loan => loan.status === 'active')
    .reduce((sum, loan) => sum + loan.monthlyPayment, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'completed':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'approved':
        return 'bg-success/20 text-success';
      case 'rejected':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen void-gradient">
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <Navigation className="relative z-10" />

      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-glow">Loan Management</h1>
              <p className="text-muted-foreground">Access capital and manage your borrowing</p>
            </div>
            <Badge variant="secondary" className="hypercore-glow">
              HYPERCORE CREDIT
            </Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
                <Banknote className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">${totalDebt.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">Across all active loans</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
                <Calendar className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">${monthlyPayments}</div>
                <p className="text-xs text-muted-foreground mt-2">Due each month</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">$50,000</div>
                <p className="text-xs text-muted-foreground mt-2">Pre-approved limit</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Loan Actions</CardTitle>
              <CardDescription>Manage your borrowing needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  className="hypercore-glow flex-1"
                  onClick={() => setShowApplication(!showApplication)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Apply for Loan
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calculator className="h-4 w-4 mr-2" />
                  Loan Calculator
                </Button>
                <Button variant="outline" className="flex-1">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loan Application Form */}
          {showApplication && (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-primary/50">
              <CardHeader>
                <CardTitle className="text-primary">New Loan Application</CardTitle>
                <CardDescription>Apply for instant credit approval</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan-type">Loan Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="auto">Auto Loan</SelectItem>
                        <SelectItem value="home">Home Improvement</SelectItem>
                        <SelectItem value="emergency">Emergency Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan-amount">Loan Amount</Label>
                    <Input id="loan-amount" type="number" placeholder="10000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loan-term">Loan Term (months)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annual-income">Annual Income</Label>
                    <Input id="annual-income" type="number" placeholder="75000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loan-purpose">Purpose of Loan</Label>
                  <Textarea 
                    id="loan-purpose" 
                    placeholder="Describe how you plan to use this loan..."
                    className="h-24"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button className="hypercore-glow">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowApplication(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Loans */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Active Loans</CardTitle>
                <CardDescription>Your current borrowing portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLoans.map((loan) => (
                    <div key={loan.id} className="p-4 rounded-lg border border-border/30 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Banknote className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {loan.rate}% APR • {loan.term} months
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(loan.status)}>
                          {getStatusIcon(loan.status)}
                          <span className="ml-1 capitalize">{loan.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Remaining Balance</span>
                          <span className="font-bold">${loan.remaining.toLocaleString()}</span>
                        </div>
                        
                        {loan.status === 'active' && (
                          <>
                            <Progress value={loan.progress} className="h-2" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Monthly Payment</p>
                                <p className="font-medium">${loan.monthlyPayment}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Next Payment</p>
                                <p className="font-medium">{loan.nextPayment}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loan Applications */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Track your loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loanApplications.map((app) => (
                    <div key={app.id} className="p-4 rounded-lg border border-border/30 bg-muted/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{app.type}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${app.amount.toLocaleString()} requested
                          </p>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{app.submittedDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {app.status === 'approved' ? 'Approved' : 'Decision Expected'}
                          </p>
                          <p className="font-medium">
                            {app.approvedDate || app.expectedDecision}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {loanApplications.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No Applications</h3>
                      <p className="text-muted-foreground">Apply for your first loan to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Loans;