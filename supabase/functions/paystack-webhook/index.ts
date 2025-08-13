import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") as string;

  if (!paystackSecretKey) {
    return new Response("Paystack configuration missing", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    const body = await req.text();

    if (!signature) {
      console.error("Missing Paystack signature");
      return new Response("Unauthorized", { status: 401 });
    }

    // Create hash of payload using secret
    const hash = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(paystackSecretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const expectedSignature = Array.from(
      new Uint8Array(await crypto.subtle.sign("HMAC", hash, new TextEncoder().encode(body)))
    ).map(b => b.toString(16).padStart(2, "0")).join("");

    if (signature !== expectedSignature) {
      console.error("Invalid Paystack signature");
      return new Response("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    if (event.event === "charge.success") {
      const { reference, amount, currency, status } = event.data;
      const amountInNaira = amount / 100; // Convert from kobo

      console.log(`Processing successful charge: ${reference}, ${amountInNaira} ${currency}`);

      // Complete the deposit using our atomic function
      const { data: result, error: completeError } = await supabase.rpc(
        "complete_deposit",
        {
          p_reference: reference,
          p_amount: amountInNaira,
          p_gateway_tx_id: event.data.id.toString()
        }
      );

      if (completeError) {
        console.error("Complete deposit error:", completeError);
        return new Response("Deposit completion failed", { status: 500 });
      }

      console.log("Deposit completed successfully:", result);
      
      return new Response("OK", { status: 200 });
    }

    if (event.event === "transfer.success") {
      const { reference, amount, currency, status } = event.data;
      console.log(`Transfer completed: ${reference}, ${amount/100} ${currency}`);

      // Update transfer status to completed
      const { error: updateError } = await supabase
        .from("transfers")
        .update({ 
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("reference", reference);

      if (updateError) {
        console.error("Transfer update error:", updateError);
      }

      return new Response("OK", { status: 200 });
    }

    if (event.event === "transfer.failed" || event.event === "transfer.reversed") {
      const { reference } = event.data;
      console.log(`Transfer failed/reversed: ${reference}`);

      // Update transfer status to failed
      const { error: updateError } = await supabase
        .from("transfers")
        .update({ 
          status: "failed",
          updated_at: new Date().toISOString()
        })
        .eq("reference", reference);

      if (updateError) {
        console.error("Transfer update error:", updateError);
      }

      return new Response("OK", { status: 200 });
    }

    // For other events, just acknowledge
    return new Response("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});