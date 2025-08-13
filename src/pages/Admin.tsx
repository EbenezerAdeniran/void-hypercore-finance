import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin | ThriftPay";
  }, []);

  // Check if user has admin role
  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!roleLoading) {
      setLoading(false);
    }
  }, [roleLoading]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen void-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="hypercore-glow w-12 h-12 rounded-full border-2 border-primary animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: loans, refetch: refetchLoans } = useQuery({
    queryKey: ["admin", "loans", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select(`
          id, user_id, amount, status, created_at, purpose, term_months, interest_rate,
          profiles!inner(full_name, account_number)
        `)
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ["admin", "user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id, user_id, role, created_at,
          profiles!inner(full_name, account_number)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const approveLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const { error } = await supabase
        .from("loans")
        .update({ 
          status: "approved",
          approved_at: new Date().toISOString()
        })
        .eq("id", loanId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Loan approved successfully" });
      refetchLoans();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to approve loan", variant: "destructive" });
      console.error("Approve loan error:", error);
    },
  });

  const rejectLoanMutation = useMutation({
    mutationFn: async (loanId: string) => {
      const { error } = await supabase
        .from("loans")
        .update({ status: "rejected" })
        .eq("id", loanId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Loan rejected" });
      refetchLoans();
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to reject loan", variant: "destructive" });
      console.error("Reject loan error:", error);
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: "admin" | "user" }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User role updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "user-roles"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
      console.error("Update role error:", error);
    },
  });

  const approve = (id: string) => approveLoanMutation.mutate(id);
  const reject = (id: string) => rejectLoanMutation.mutate(id);
  const updateRole = (userId: string, newRole: "admin" | "user") => 
    updateUserRoleMutation.mutate({ userId, newRole });

  return (
    <main className="min-h-screen void-gradient px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Review and approve pending items</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
              <CardDescription>Approve or reject pending loans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loans && loans.length > 0 ? (
                  loans.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">Loan #{l.id.slice(0, 8)}</p>
                          <Badge variant={l.status === "pending" ? "secondary" : l.status === "approved" ? "default" : "destructive"}>
                            {l.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {l.profiles?.full_name || "Unknown"} · ₦{parseFloat(l.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {l.purpose} · {l.term_months}mo · {l.interest_rate}% APR
                        </p>
                      </div>
                      {l.status === "pending" && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => approve(l.id)}
                            disabled={approveLoanMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => reject(l.id)}
                            disabled={rejectLoanMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No applications found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRoles && userRoles.length > 0 ? (
                  userRoles.map((ur: any) => (
                    <div key={ur.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-muted/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{ur.profiles?.full_name || "Unknown User"}</p>
                          <Badge variant={ur.role === "admin" ? "default" : "secondary"}>
                            {ur.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Account: {ur.profiles?.account_number || "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant={ur.role === "admin" ? "secondary" : "default"}
                          onClick={() => updateRole(ur.user_id, ur.role === "admin" ? "user" : "admin")}
                          disabled={updateUserRoleMutation.isPending || ur.user_id === user?.id}
                        >
                          {ur.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No users found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
