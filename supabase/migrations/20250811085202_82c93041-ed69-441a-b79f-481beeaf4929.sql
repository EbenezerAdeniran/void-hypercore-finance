-- 1) Ensure profiles has a balance column for debits/credits
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 0;

-- 2) Ensure fast lookup by account number
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON public.profiles(account_number);

-- 3) Trigger to auto-generate account numbers on new profiles if missing
--    Uses existing public.generate_account_number() function
DROP TRIGGER IF EXISTS set_account_number_before_insert ON public.profiles;
CREATE TRIGGER set_account_number_before_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.account_number IS NULL)
EXECUTE FUNCTION public.generate_account_number();

-- 4) Atomic transfer function
-- Performs validation, debits sender, credits recipient, inserts transfer + transaction rows
CREATE OR REPLACE FUNCTION public.perform_transfer(
  p_sender_id uuid,
  p_recipient_account_number text,
  p_amount numeric,
  p_note text
)
RETURNS TABLE(transaction_id uuid, transfer_id uuid) AS $$
DECLARE
  v_sender_profile public.profiles%ROWTYPE;
  v_recipient_profile public.profiles%ROWTYPE;
  v_transfer_id uuid;
  v_sender_tx_id uuid;
  v_recipient_tx_id uuid;
  v_note text := coalesce(p_note, '');
BEGIN
  -- Basic validations
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than 0' USING ERRCODE = '22023';
  END IF;

  -- Lock rows to avoid race conditions
  SELECT * INTO v_sender_profile FROM public.profiles WHERE user_id = p_sender_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sender not found' USING ERRCODE = '23503';
  END IF;

  SELECT * INTO v_recipient_profile FROM public.profiles WHERE account_number = p_recipient_account_number FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient not found' USING ERRCODE = '23503';
  END IF;

  -- Balance check
  IF v_sender_profile.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds' USING ERRCODE = 'P0001';
  END IF;

  -- Debit sender
  UPDATE public.profiles
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE user_id = p_sender_id;

  -- Credit recipient
  UPDATE public.profiles
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE account_number = p_recipient_account_number;

  -- Record transfer
  INSERT INTO public.transfers (user_id, to_account_number, amount, description, status)
  VALUES (p_sender_id, p_recipient_account_number, p_amount, NULLIF(v_note, ''), 'completed')
  RETURNING id INTO v_transfer_id;

  -- Record transactions entries (debit for sender, credit for recipient)
  INSERT INTO public.transactions (user_id, amount, type, category, description, date)
  VALUES (
    p_sender_id,
    p_amount,
    'debit',
    'transfer',
    CONCAT('Transfer to ', coalesce(v_recipient_profile.full_name, 'recipient'),
           ' (', p_recipient_account_number, ')',
           CASE WHEN v_note <> '' THEN ': ' || v_note ELSE '' END),
    CURRENT_DATE
  ) RETURNING id INTO v_sender_tx_id;

  INSERT INTO public.transactions (user_id, amount, type, category, description, date)
  VALUES (
    v_recipient_profile.user_id,
    p_amount,
    'credit',
    'transfer',
    CONCAT('Transfer from ', coalesce(v_sender_profile.full_name, 'sender'),
           ' (', coalesce(v_sender_profile.account_number, ''), ')',
           CASE WHEN v_note <> '' THEN ': ' || v_note ELSE '' END),
    CURRENT_DATE
  ) RETURNING id INTO v_recipient_tx_id;

  -- Return the sender transaction id and transfer id
  RETURN QUERY SELECT v_sender_tx_id::uuid, v_transfer_id::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;