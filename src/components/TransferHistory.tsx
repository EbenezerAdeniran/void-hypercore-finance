import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transfer {
  id: string;
  to_account_number: string;
  amount: number;
  recipient_name: string | null;
  to_bank_name: string | null;
  description: string | null;
  reference: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  description: string | null;
  date: string;
  created_at: string;
}

export function TransferHistory() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "transfers" | "transactions">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transfersResult, transactionsResult] = await Promise.all([
        supabase
          .from("transfers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20)
      ]);

      if (transfersResult.error) {
        console.error("Error fetching transfers:", transfersResult.error);
        toast({
          title: "Error",
          description: "Failed to load transfers",
          variant: "destructive",
        });
      } else {
        setTransfers(transfersResult.data || []);
      }

      if (transactionsResult.error) {
        console.error("Error fetching transactions:", transactionsResult.error);
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      } else {
        setTransactions((transactionsResult.data || []) as Transaction[]);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredData = () => {
    const allItems = [];

    if (filter === "all" || filter === "transfers") {
      allItems.push(...transfers.map(transfer => ({
        ...transfer,
        type: "transfer" as const,
        direction: "outgoing" as const
      })));
    }

    if (filter === "all" || filter === "transactions") {
      allItems.push(...transactions.map(transaction => ({
        ...transaction,
        type: "transaction" as const,
        direction: transaction.type === "credit" ? "incoming" : "outgoing"
      })));
    }

    return allItems.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>Loading your recent activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = filteredData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>Your recent transfers and transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="transfers">Transfers Only</SelectItem>
                <SelectItem value="transactions">Transactions Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity found</p>
            <p className="text-sm">Your transfers and transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    item.direction === "incoming" 
                      ? "bg-green-100 text-green-600" 
                      : "bg-blue-100 text-blue-600"
                  }`}>
                    {item.direction === "incoming" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.type === "transfer" 
                        ? `Transfer to ${(item as any).recipient_name || (item as any).to_account_number}`
                        : (item as any).description || `${(item as any).category} transaction`
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                      {item.type === "transfer" && (item as any).to_bank_name && (
                        <> • {(item as any).to_bank_name}</>
                      )}
                    </p>
                    {item.type === "transfer" && (item as any).description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {(item as any).description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    item.direction === "incoming" ? "text-green-600" : "text-gray-900"
                  }`}>
                    {item.direction === "incoming" ? "+" : "-"}₦{item.amount.toLocaleString()}
                  </p>
                  {item.type === "transfer" && (
                    <Badge variant={getStatusColor((item as any).status)} className="mt-1">
                      {(item as any).status}
                    </Badge>
                  )}
                  {item.type === "transaction" && (
                    <Badge variant="outline" className="mt-1">
                      {(item as any).type}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}