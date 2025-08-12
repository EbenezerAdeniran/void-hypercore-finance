// ThriftPay Deposit Webhook Receiver
// Verifies webhook secret, finalizes deposits atomically, and credits user balances

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface DepositWebhookPayload {
  transaction_id: string;
  amount: number;
  status: "success" | "failed" | "pending";
  reference: string;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const secretHeader = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("DEPOSIT_WEBHOOK_SECRET");

    if (!expectedSecret) {
      console.error("DEPOSIT_WEBHOOK_SECRET is not set");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (secretHeader !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as DepositWebhookPayload;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase env vars");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // If failed, mark deposit failed and exit
    if (body.status !== "success") {
      const { error: updErr } = await supabase
        .from("deposits")
        .update({ status: "failed", gateway_transaction_id: body.transaction_id })
        .eq("reference", body.reference)
        .eq("status", "pending");

      if (updErr) console.error("Failed to mark deposit failed:", updErr);

      return new Response(JSON.stringify({ success: true, message: "Deposit marked failed" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Complete deposit atomically
    const { data, error } = await supabase.rpc("complete_deposit", {
      p_reference: body.reference,
      p_amount: body.amount,
      p_gateway_tx_id: body.transaction_id,
    });

    if (error) {
      console.error("complete_deposit error:", error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, result: data?.[0] ?? null }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("deposit-webhook error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
