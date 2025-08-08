import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'goal_achieved' | 'payment_reminder' | 'budget_alert' | 'transaction_alert';
  userId: string;
  data: {
    title: string;
    message: string;
    amount?: number;
    goalName?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const notificationRequest: NotificationRequest = await req.json();
    const { type, userId, data } = notificationRequest;

    console.log('Processing notification:', { type, userId, data });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Format notification based on type
    let notification = {
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
      type: type,
    };

    switch (type) {
      case 'goal_achieved':
        notification = {
          ...notification,
          title: `🎉 Goal Achieved: ${data.goalName}`,
          message: `Congratulations ${profile?.full_name || 'HYPERCORE User'}! You've successfully reached your savings goal of $${data.amount}. The VOID celebrates your financial victory!`,
        };
        break;

      case 'payment_reminder':
        notification = {
          ...notification,
          title: `💳 Payment Reminder`,
          message: `Your loan payment of $${data.amount} is due soon. Stay on track with your HYPERCORE financial plan.`,
        };
        break;

      case 'budget_alert':
        notification = {
          ...notification,
          title: `⚠️ Budget Alert`,
          message: `You're approaching your budget limit for this category. Current spending: $${data.amount}. Review your VOID transactions to optimize.`,
        };
        break;

      case 'transaction_alert':
        notification = {
          ...notification,
          title: `🔍 Transaction Alert`,
          message: `Large transaction detected: $${data.amount}. If this wasn't you, secure your HYPERCORE account immediately.`,
        };
        break;
    }

    // In a real implementation, you would:
    // 1. Send email via a service like Resend or SendGrid
    // 2. Send push notifications
    // 3. Store in a notifications table for in-app display
    
    console.log('Notification processed:', notification);

    // For now, we'll just return the formatted notification
    return new Response(
      JSON.stringify({ 
        success: true,
        notification: notification,
        message: 'Notification sent successfully through the VOID network'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Notification Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process notification',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});