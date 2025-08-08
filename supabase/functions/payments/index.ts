import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  type: 'loan_payment' | 'savings_deposit' | 'bill_payment';
  description: string;
  scheduledDate?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const paymentRequest: PaymentRequest = await req.json();
    const { amount, type, description, scheduledDate } = paymentRequest;

    if (!amount || amount <= 0) {
      throw new Error('Valid payment amount is required');
    }

    console.log('Processing payment request:', { userId: user.id, amount, type, description });

    // In a real implementation, you would integrate with payment processors like:
    // - Stripe for credit card processing
    // - Plaid for bank transfers
    // - PayPal for digital payments
    
    // For now, we'll simulate payment processing and create a transaction record
    const transactionData = {
      user_id: user.id,
      amount: amount,
      type: 'expense', // Default to expense for payments
      category: getPaymentCategory(type),
      description: description,
      date: scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };

    // Insert transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to record transaction: ${transactionError.message}`);
    }

    // Process specific payment types
    if (type === 'savings_deposit') {
      // Update savings goal if applicable
      await processSavingsDeposit(supabase, user.id, amount);
    } else if (type === 'loan_payment') {
      // Update loan balance if applicable
      await processLoanPayment(supabase, user.id, amount);
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const paymentResult = {
      success: true,
      transactionId: transaction.id,
      amount: amount,
      type: type,
      status: 'completed',
      timestamp: new Date().toISOString(),
      message: `Payment of $${amount} processed successfully through HYPERCORE payment matrix`,
    };

    return new Response(
      JSON.stringify(paymentResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Payment processing failed',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function getPaymentCategory(type: string): string {
  switch (type) {
    case 'loan_payment':
      return 'Loan Payment';
    case 'savings_deposit':
      return 'Savings';
    case 'bill_payment':
      return 'Bills';
    default:
      return 'Payment';
  }
}

async function processSavingsDeposit(supabase: any, userId: string, amount: number) {
  try {
    // Get the most recently updated savings goal
    const { data: goals } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (goals && goals.length > 0) {
      const goal = goals[0];
      const newAmount = parseFloat(goal.current_amount) + amount;
      
      await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', goal.id);

      console.log(`Updated savings goal ${goal.id} with deposit of $${amount}`);
    }
  } catch (error) {
    console.error('Error processing savings deposit:', error);
  }
}

async function processLoanPayment(supabase: any, userId: string, amount: number) {
  try {
    // Get active loans
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (loans && loans.length > 0) {
      console.log(`Processed loan payment of $${amount} for loan ${loans[0].id}`);
      // In a real implementation, you would update loan balance here
    }
  } catch (error) {
    console.error('Error processing loan payment:', error);
  }
}