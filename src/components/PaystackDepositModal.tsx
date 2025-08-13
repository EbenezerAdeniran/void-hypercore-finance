import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Smartphone, Building2, QrCode } from "lucide-react";

interface PaystackDepositModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaystackDepositModal({ open, onClose, onSuccess }: PaystackDepositModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["card", "bank_transfer"]);
  const { toast } = useToast();

  const channels = [
    { id: "card", label: "Debit/Credit Card", icon: CreditCard },
    { id: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { id: "ussd", label: "USSD", icon: Smartphone },
    { id: "mobile_money", label: "Mobile Money", icon: Smartphone },
    { id: "qr", label: "QR Code", icon: QrCode },
  ];

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (selectedChannels.length === 0) {
      toast({
        title: "No payment method",
        description: "Please select at least one payment method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("paystack-deposit", {
        body: {
          amount: amountNum,
          channels: selectedChannels
        }
      });

      if (error) throw error;

      if (data.success) {
        // Open Paystack payment page in new tab
        window.open(data.data.authorization_url, '_blank');
        
        toast({
          title: "Payment initiated",
          description: "Complete your payment in the new tab. Your account will be credited automatically.",
        });

        onSuccess?.();
        onClose();
      } else {
        throw new Error(data.error || "Payment initialization failed");
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit failed",
        description: error.message || "Failed to initiate deposit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add money to your ThriftPay account via Paystack
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="space-y-3">
            <Label>Payment Methods</Label>
            <div className="grid grid-cols-1 gap-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={channel.id}
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <Label htmlFor={channel.id} className="flex items-center space-x-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      <span>{channel.label}</span>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Processing..." : "Continue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}