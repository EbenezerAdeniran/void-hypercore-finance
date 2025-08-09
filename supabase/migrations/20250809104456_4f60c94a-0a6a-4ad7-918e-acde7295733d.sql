-- Create transfers table for money transfers between accounts
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  to_account_number TEXT NOT NULL,
  to_bank_name TEXT,
  recipient_name TEXT,
  description TEXT,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own transfers"
ON public.transfers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transfers"
ON public.transfers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transfers"
ON public.transfers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transfers"
ON public.transfers FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_transfers_updated_at
BEFORE UPDATE ON public.transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();