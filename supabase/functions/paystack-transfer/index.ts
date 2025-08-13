import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackTransferRequest {
  account_number: string;
  bank_code: string;
  amount: number;
  recipient_name: string;
  narration?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") as string;

  if (!paystackSecretKey) {
    return new Response(
      JSON.stringify({ success: false, error: "Paystack configuration missing" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: PaystackTransferRequest = await req.json();

    if (!body.amount || body.amount <= 0 || !body.account_number || !body.bank_code || !body.recipient_name) {
      return new Response(
        JSON.stringify({ success: false, error: "All transfer details are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, full_name")
      .eq("user_id", user.id)
      .single();

    if (!profile || profile.balance < body.amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Insufficient funds" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const reference = `tf_${Date.now()}_${user.id.slice(0, 8)}`;

    // Create transfer recipient on Paystack
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: body.recipient_name,
        account_number: body.account_number,
        bank_code: body.bank_code,
        currency: "NGN"
      }),
    });

    const recipientData = await recipientResponse.json();

    if (!recipientData.status) {
      console.error("Recipient creation failed:", recipientData);
      return new Response(
        JSON.stringify({ success: false, error: recipientData.message || "Invalid recipient details" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initiate transfer
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(body.amount * 100), // Convert to kobo
        recipient: recipientData.data.recipient_code,
        reason: body.narration || `Transfer from ${profile.full_name || "Customer"}`,
        reference: reference
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferData.status) {
      console.error("Transfer initiation failed:", transferData);
      return new Response(
        JSON.stringify({ success: false, error: transferData.message || "Transfer failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Record transfer in database
    const { data: transfer, error: transferError } = await supabase
      .from("transfers")
      .insert({
        user_id: user.id,
        to_account_number: body.account_number,
        amount: body.amount,
        recipient_name: body.recipient_name,
        to_bank_name: recipientData.data.details?.bank_name || "Bank",
        description: body.narration,
        reference: reference,
        status: "pending"
      })
      .select()
      .single();

    if (transferError) {
      console.error("Transfer record creation error:", transferError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to record transfer" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Deduct amount from user balance
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({ balance: profile.balance - body.amount })
      .eq("user_id", user.id);

    if (balanceError) {
      console.error("Balance update error:", balanceError);
      // Should ideally reverse the Paystack transfer here
    }

    // Record transaction
    await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: body.amount,
        type: "debit",
        category: "transfer",
        description: `Bank transfer to ${body.recipient_name} (${body.account_number})`,
        date: new Date().toISOString().split('T')[0]
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transfer_code: transferData.data.transfer_code,
          reference: reference,
          status: transferData.data.status,
          transfer_id: transfer.id
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Paystack transfer error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});