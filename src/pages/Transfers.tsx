import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Send, Wallet, Plus } from "lucide-react";
import { TransferModal } from "@/components/TransferModal";
import { TransferHistory } from "@/components/TransferHistory";

interface Transfer {
  id: string;
  user_id: string;
  amount: number;
  to_account_number: string;
  to_bank_name: string | null;
  recipient_name: string | null;
  description: string | null;
  reference: string | null;
  status: string;
  scheduled_date: string | null;
  created_at: string;
}

const Transfers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // SEO basics
  useEffect(() => {
    const title = "Transfers | ThriftPay";
    const description = "Send money securely with ThriftPay transfers. Schedule payments and track status.";
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = description;
      document.head.appendChild(m);
    }

    const canonicalHref = window.location.origin + "/transfers";
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalHref);
  }, []);

  const [form, setForm] = useState({
    recipient_name: "",
    to_account_number: "",
    to_bank_name: "",
    amount: "",
    description: "",
    reference: "",
    scheduled_date: "",
  });

  const isValid = useMemo(() => {
    const amt = Number(form.amount);
    const acct = form.to_account_number.trim();
    return /^\d{6,}$/.test(acct) && !isNaN(amt) && amt > 0;
  }, [form.amount, form.to_account_number]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["transfers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transfers")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data as Transfer[]) ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["profile-balance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("balance, full_name, account_number")
        .eq("user_id", user?.id ?? "")
        .maybeSingle();
      if (error) throw error;
      return data as { balance: number | null; full_name: string | null; account_number: string | null } | null;
    },
    enabled: !!user?.id,
  });

  const onSubmit = async () => {
    if (!user?.id) return;
    if (!isValid) {
      toast({ title: "Check details", description: "Enter a valid amount and account number." });
      return;
    }

    const amt = Number(form.amount);
    const currentBalance = Number((profile as any)?.balance ?? 0);
    if (amt > currentBalance) {
      toast({ title: "Insufficient funds", description: "Your balance is not enough for this transfer." });
      return;
    }

    const { data: resp, error } = await supabase.functions.invoke("transfer", {
      body: {
        sender_id: user.id,
        recipient_account_number: form.to_account_number.trim(),
        amount: amt,
        note: form.description || null,
      },
    });

    if (error || !(resp as any)?.success) {
      const message = (error as any)?.message || (resp as any)?.error || "Please try again.";
      toast({ title: "Transfer failed", description: message });
    } else {
      toast({
        title: "Transfer completed",
        description: `Transaction ID: ${(resp as any)?.transaction_id || "—"}`,
      });
      setForm({
        recipient_name: "",
        to_account_number: "",
        to_bank_name: "",
        amount: "",
        description: "",
        reference: "",
        scheduled_date: "",
      });
      refetch();
      refetchProfile();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,hsl(var(--background))_0%,hsl(var(--muted))/30_100%)]">
      <header>
        <Navigation />
      </header>

      <main className="container mx-auto px-6 pb-24">
        <section className="mt-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Create and track your money transfers. All transfers are protected by RLS and only visible to you.
              </p>
            </div>
            <Button onClick={() => setTransferModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid gap-6 md:grid-cols-3 mt-8">
          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  ₦{(profile?.balance || 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{profile?.account_number || "Loading..."}</p>
                <p className="text-xs text-muted-foreground">ThriftPay Account Number</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => setTransferModalOpen(true)}
                disabled={!user?.id}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Money
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Transfer History */}
        <section className="mt-8">
          <TransferHistory />
        </section>
      </main>

      <TransferModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={() => {
          refetch();
          refetchProfile();
          toast({
            title: "Transfer completed",
            description: "Your transfer has been processed successfully",
          });
        }}
        userBalance={profile?.balance || 0}
      />
    </div>
  );
};

export default Transfers;
