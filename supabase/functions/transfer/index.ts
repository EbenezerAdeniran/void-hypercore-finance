import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferRequest {
  sender_id: string;
  recipient_account_number: string;
  amount: number;
  note?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });

  try {
    // Authenticate user via JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: TransferRequest = await req.json();

    // Basic client payload validation
    if (
      !body.sender_id ||
      !body.recipient_account_number ||
      typeof body.amount !== "number"
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Ensure the sender in payload matches the authenticated user
    if (body.sender_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Sender mismatch" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (body.amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Amount must be greater than 0" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Optional: quick existence check for recipient profile
    const { data: recipientProfile, error: recipientError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("account_number", body.recipient_account_number)
      .maybeSingle();

    if (recipientError) {
      console.error("Recipient lookup error", recipientError);
    }

    if (!recipientProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "Recipient not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Invoke atomic DB function
    const { data: result, error: rpcError } = await supabase.rpc(
      "perform_transfer",
      {
        p_sender_id: body.sender_id,
        p_recipient_account_number: body.recipient_account_number,
        p_amount: body.amount,
        p_note: body.note ?? null,
      }
    );

    if (rpcError) {
      console.error("perform_transfer error", rpcError);
      const message = rpcError.message || "Transfer failed";
      const normalized =
        message.includes("Insufficient funds")
          ? "Insufficient funds"
          : message.includes("Recipient not found")
          ? "Recipient not found"
          : message.includes("Sender not found")
          ? "Sender not found"
          : message.includes("Amount must be greater than 0")
          ? "Amount must be greater than 0"
          : "Transfer failed";

      return new Response(
        JSON.stringify({ success: false, error: normalized }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const txnId = Array.isArray(result) && result.length > 0 ? result[0].transaction_id : null;
    const transferId = Array.isArray(result) && result.length > 0 ? result[0].transfer_id : null;

    // Success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer completed",
        transaction_id: txnId,
        transfer_id: transferId,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("Unexpected error in transfer function:", e);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
