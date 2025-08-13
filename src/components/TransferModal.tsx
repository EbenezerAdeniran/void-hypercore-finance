import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeftRight, Building2, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userBalance: number;
}

interface Bank {
  id: string;
  name: string;
  code: string;
}

export function TransferModal({ open, onClose, onSuccess, userBalance }: TransferModalProps) {
  const [transferType, setTransferType] = useState<"internal" | "external">("internal");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [recipientInfo, setRecipientInfo] = useState<{name: string; account: string} | null>(null);
  const { toast } = useToast();

  // Fetch Nigerian banks for external transfers
  useEffect(() => {
    if (transferType === "external") {
      fetchBanks();
    }
  }, [transferType]);

  // Verify internal recipient when account number is entered
  useEffect(() => {
    if (transferType === "internal" && accountNumber.length === 10) {
      verifyInternalRecipient();
    } else {
      setRecipientInfo(null);
    }
  }, [accountNumber, transferType]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("nigerian_banks")
        .select("id, name, code")
        .order("name");

      if (error) {
        console.error("Error fetching banks:", error);
        toast({
          title: "Error",
          description: "Failed to load banks. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setBanks(data || []);
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const verifyInternalRecipient = async () => {
    try {
      const { data, error } = await supabase.rpc("find_user_by_account_number", {
        p_account_number: accountNumber
      });

      if (error) {
        console.error("Error verifying recipient:", error);
        return;
      }

      if (data && data.length > 0) {
        const recipient = data[0];
        setRecipientInfo({
          name: recipient.full_name || "Unknown User",
          account: recipient.account_number
        });
        setRecipientName(recipient.full_name || "Unknown User");
      } else {
        setRecipientInfo(null);
        setRecipientName("");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amountNum > userBalance) {
      toast({
        title: "Insufficient funds",
        description: `Your balance (₦${userBalance.toLocaleString()}) is insufficient for this transfer`,
        variant: "destructive",
      });
      return;
    }

    if (!accountNumber || !recipientName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (transferType === "external" && !bankCode) {
      toast({
        title: "Bank required",
        description: "Please select a bank for external transfers",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (transferType === "internal") {
        await handleInternalTransfer(amountNum);
      } else {
        await handleExternalTransfer(amountNum);
      }
    } catch (error: any) {
      console.error("Transfer error:", error);
      toast({
        title: "Transfer failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInternalTransfer = async (amountNum: number) => {
    const { data, error } = await supabase.rpc("perform_transfer", {
      p_sender_id: (await supabase.auth.getUser()).data.user?.id,
      p_recipient_account_number: accountNumber,
      p_amount: amountNum,
      p_note: description || null
    });

    if (error) {
      throw new Error(error.message);
    }

    toast({
      title: "Transfer successful",
      description: `₦${amountNum.toLocaleString()} transferred to ${recipientName}`,
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const handleExternalTransfer = async (amountNum: number) => {
    const { data, error } = await supabase.functions.invoke("paystack-transfer", {
      body: {
        account_number: accountNumber,
        bank_code: bankCode,
        amount: amountNum,
        recipient_name: recipientName,
        narration: description
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.success) {
      throw new Error(data.error || "Transfer failed");
    }

    toast({
      title: "Transfer initiated",
      description: `Bank transfer of ₦${amountNum.toLocaleString()} to ${recipientName} has been initiated`,
    });

    onSuccess?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setAmount("");
    setAccountNumber("");
    setRecipientName("");
    setBankCode("");
    setDescription("");
    setRecipientInfo(null);
    setTransferType("internal");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Send Money
          </DialogTitle>
          <DialogDescription>
            Transfer money to other ThriftPay users or bank accounts
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={transferType === "internal" ? "default" : "outline"}
              onClick={() => setTransferType("internal")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              ThriftPay User
            </Button>
            <Button
              type="button"
              variant={transferType === "external" ? "default" : "outline"}
              onClick={() => setTransferType("external")}
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              Bank Account
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
            />
            <p className="text-sm text-muted-foreground">
              Available balance: ₦{userBalance.toLocaleString()}
            </p>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              {transferType === "internal" ? "ThriftPay Account Number" : "Bank Account Number"}
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder={transferType === "internal" ? "9123456789" : "1234567890"}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={10}
              required
            />
          </div>

          {/* Recipient Info for Internal Transfers */}
          {transferType === "internal" && recipientInfo && (
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                <strong>Recipient:</strong> {recipientInfo.name}<br />
                <strong>Account:</strong> {recipientInfo.account}
              </AlertDescription>
            </Alert>
          )}

          {/* Bank Selection for External Transfers */}
          {transferType === "external" && (
            <div className="space-y-2">
              <Label htmlFor="bank">Bank</Label>
              <Select value={bankCode} onValueChange={setBankCode} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recipient Name for External Transfers */}
          {transferType === "external" && (
            <div className="space-y-2">
              <Label htmlFor="recipientName">Account Holder Name</Label>
              <Input
                id="recipientName"
                type="text"
                placeholder="John Doe"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this transfer for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Warning for External Transfers */}
          {transferType === "external" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bank transfers may take a few minutes to process and cannot be reversed.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : `Send ₦${amount || "0"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}