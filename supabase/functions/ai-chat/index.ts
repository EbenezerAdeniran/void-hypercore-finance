import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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

    const { message, history } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing AI chat request for user:', user.id);

    // For now, provide a mock AI response for financial queries
    // In a real implementation, you would call OpenAI API here
    const aiResponse = generateFinancialAIResponse(message, history);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateFinancialAIResponse(message: string, history: ChatMessage[]): string {
  const lowerMessage = message.toLowerCase();
  
  // Financial advice based on keywords
  if (lowerMessage.includes('budget') || lowerMessage.includes('budgeting')) {
    return "🚀 HYPERCORE ANALYSIS: For optimal budget management, follow the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings and debt. Track your expenses through the VOID interface and set up automated transfers to your savings goals.";
  }
  
  if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
    return "💎 VOID WISDOM: Start with an emergency fund of 3-6 months expenses. Then focus on high-yield savings accounts and consider index funds for long-term growth. Use our savings goals tracker to automate your journey to financial freedom.";
  }
  
  if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
    return "⚡ HYPERCORE INSIGHT: Begin with low-cost index funds and ETFs. Diversify across markets and maintain a long-term perspective. Dollar-cost averaging can help reduce volatility impact. Remember: time in the market beats timing the market.";
  }
  
  if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
    return "🔥 DEBT DESTROYER: Prioritize high-interest debt first (avalanche method) or start with smallest balances (snowball method). Consider debt consolidation if it lowers your overall interest rate. Our loan tracker can help you visualize your payoff journey.";
  }
  
  if (lowerMessage.includes('retirement') || lowerMessage.includes('retire')) {
    return "🌟 FUTURE VISION: Maximize employer 401(k) matching first, then consider Roth IRA for tax-free growth. Aim to save 10-15% of income for retirement. The compound interest in the VOID will work its magic over time.";
  }
  
  if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
    return "🛡️ PROTECTION PROTOCOL: Build your emergency fund gradually - start with $1000, then work toward 3-6 months of expenses. Keep it in a high-yield savings account for easy access. This is your financial force field against unexpected expenses.";
  }
  
  // Default response
  return "🚀 HYPERCORE AI ACTIVATED: I'm here to help with your financial journey through the VOID. Ask me about budgeting, saving, investing, debt management, or retirement planning. Together we'll optimize your financial matrix for maximum growth potential.";
}