// ThriftPay Deposit Initialization Edge Function
// Handles deposit creation and returns payment instructions or checkout URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DepositInitRequest {
  amount: number;
  method: "bank_transfer" | "card" | "mobile_money";
}

function generateReference() {
  const rand = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, "0");
  return `DEP-${rand}`;
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

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("Missing Supabase env vars");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create client bound to the incoming auth header (JWT)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as DepositInitRequest;
    const amount = Number(body?.amount);
    const method = body?.method;

    // Basic validation
    const supported = new Set(["bank_transfer", "card", "mobile_money"]);
    if (!amount || isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "Amount must be greater than 0" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!supported.has(method as string)) {
      return new Response(JSON.stringify({ error: "Unsupported payment method" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const reference = generateReference();

    // Create pending deposit row
    const { data: deposit, error: depErr } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        amount,
        method,
        status: "pending",
        reference,
        metadata: {},
      })
      .select("id, reference, method, status")
      .single();

    if (depErr) {
      console.error("Error creating deposit:", depErr);
      return new Response(JSON.stringify({ error: "Failed to create deposit" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Return payment handling instructions
    let payload: Record<string, unknown> = { deposit_id: deposit.id, reference: deposit.reference };

    if (method === "bank_transfer") {
      // In a real integration, you'd request a VA from your PSP here
      payload = {
        ...payload,
        bank_transfer: {
          bank_name: "ThriftPay Partner Bank",
          account_number: "0001234567",
          account_name: user.user_metadata?.full_name || "ThriftPay User",
          amount,
          reference,
          memo: `REF ${reference}`,
        },
        message: "Send the exact amount to the provided bank details. The deposit will be confirmed automatically.",
      };
    } else if (method === "card") {
      // Typically you'd call your PSP to create a checkout session and return the URL
      payload = {
        ...payload,
        checkout_url: `https://pay.example.com/checkout/${reference}`,
        message: "Complete your card payment using the checkout link.",
      };
    } else if (method === "mobile_money") {
      payload = {
        ...payload,
        instructions: "Follow the prompt sent to your device to approve the Mobile Money payment.",
        message: "A payment prompt has been sent to your device (simulated).",
      };
    }

    return new Response(
      JSON.stringify({ success: true, ...payload }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    console.error("deposit-init error:", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
