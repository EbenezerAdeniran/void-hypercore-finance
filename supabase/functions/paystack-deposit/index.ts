import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackDepositRequest {
  amount: number;
  email?: string;
  channels?: string[];
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

    const body: PaystackDepositRequest = await req.json();

    if (!body.amount || body.amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid amount is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single();

    const reference = `dep_${Date.now()}_${user.id.slice(0, 8)}`;

    // Create deposit record
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        amount: body.amount,
        method: "paystack",
        reference: reference,
        status: "pending"
      })
      .select()
      .single();

    if (depositError) {
      console.error("Deposit creation error:", depositError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create deposit record" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email || user.email,
        amount: Math.round(body.amount * 100), // Convert to kobo
        currency: "NGN",
        reference: reference,
        channels: body.channels || ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        metadata: {
          user_id: user.id,
          deposit_id: deposit.id,
          customer_name: profile?.full_name || "Customer"
        },
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paystack-webhook`
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return new Response(
        JSON.stringify({ success: false, error: paystackData.message || "Payment initialization failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: reference,
          deposit_id: deposit.id
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Paystack deposit error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});