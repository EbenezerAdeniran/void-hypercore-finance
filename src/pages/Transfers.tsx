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
import { CalendarDays, Clock, Send } from "lucide-react";

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
    return form.to_account_number.trim().length >= 6 && !isNaN(amt) && amt > 0;
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

  const onSubmit = async () => {
    if (!user?.id) return;
    if (!isValid) {
      toast({ title: "Check details", description: "Enter a valid amount and account number." });
      return;
    }

    const amt = Number(form.amount);
    const { error } = await supabase.from("transfers").insert([
      {
        user_id: user.id,
        amount: amt,
        to_account_number: form.to_account_number.trim(),
        to_bank_name: form.to_bank_name || null,
        recipient_name: form.recipient_name || null,
        description: form.description || null,
        reference: form.reference || null,
        status: "pending",
        scheduled_date: form.scheduled_date || null,
      },
    ]);

    if (error) {
      toast({ title: "Transfer failed", description: error.message });
    } else {
      toast({ title: "Transfer created", description: "Your transfer has been scheduled." });
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
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,hsl(var(--background))_0%,hsl(var(--muted))/30_100%)]">
      <header>
        <Navigation />
      </header>

      <main className="container mx-auto px-6 pb-24">
        <section className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Create and track your money transfers. All transfers are protected by RLS and only visible to you.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 mt-8">
          <Card className="border-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> New transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient_name">Recipient name</Label>
                  <Input id="recipient_name" placeholder="e.g. Jane Doe" value={form.recipient_name} onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="to_account_number">Account number *</Label>
                  <Input id="to_account_number" placeholder="e.g. 0123456789" value={form.to_account_number} onChange={(e) => setForm((f) => ({ ...f, to_account_number: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="to_bank_name">Bank name</Label>
                  <Input id="to_bank_name" placeholder="e.g. Thrift Bank" value={form.to_bank_name} onChange={(e) => setForm((f) => ({ ...f, to_bank_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scheduled_date">Scheduled date</Label>
                    <div className="relative">
                      <Input id="scheduled_date" type="date" value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} />
                      <CalendarDays className="h-4 w-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" placeholder="e.g. INV-1024" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Optional note" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <Button className="mt-2" onClick={onSubmit} disabled={!isValid || !user?.id}>
                  Create transfer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted/40">
            <CardHeader>
              <CardTitle>Recent transfers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Loading transfers…</p>
              ) : !data || data.length === 0 ? (
                <p className="text-muted-foreground">No transfers yet. Create your first one on the left.</p>
              ) : (
                <div className="space-y-4">
                  {data.map((t) => (
                    <div key={t.id} className="rounded-lg border border-muted/40 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {t.recipient_name || "Recipient"} • {t.to_bank_name || "Bank"}
                          </p>
                          <p className="text-sm text-muted-foreground">Acct: {t.to_account_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${" "+Number(t.amount).toLocaleString()}</p>
                          <div className="flex items-center justify-end gap-2">
                            <Badge variant="secondary">{t.status}</Badge>
                            {t.scheduled_date ? (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" /> {new Date(t.scheduled_date).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {t.description ? (
                        <div className="mt-3 text-sm text-muted-foreground">{t.description}</div>
                      ) : null}
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Ref: {t.reference || "—"}</span>
                        <span>Created {new Date(t.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Transfers;
