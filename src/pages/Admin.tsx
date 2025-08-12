import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Admin | ThriftPay";
  }, []);

  const { data: loans } = useQuery({
    queryKey: ["admin", "loans", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("id, user_id, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return data ?? [];
    },
  });

  const approve = (id: string) => {
    toast({ title: "Action requires admin role", description: `Approval for loan ${id} is not enabled yet.` });
  };
  const reject = (id: string) => {
    toast({ title: "Action requires admin role", description: `Rejection for loan ${id} is not enabled yet.` });
  };

  return (
    <main className="min-h-screen void-gradient px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Review and approve pending items</p>
        </div>

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
                    <div>
                      <p className="font-medium">Loan #{l.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">Amount: {parseFloat(l.amount).toLocaleString("en-US", { style: "currency", currency: "USD" })} · Status: {l.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => approve(l.id)}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => reject(l.id)}>Reject</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No applications found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
