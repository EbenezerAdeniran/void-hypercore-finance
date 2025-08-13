-- Ensure the generate_account_number trigger exists and is working
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_number text;
  counter integer := 0;
BEGIN
  -- Only generate if account_number is null
  IF NEW.account_number IS NULL THEN
    LOOP
      -- Generate a random 10-digit number starting with 9 (like Nigerian bank accounts)
      new_number := '9' || lpad(floor(random() * 1000000000)::text, 9, '0');
      
      -- Check if this number already exists
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE account_number = new_number) THEN
        NEW.account_number := new_number;
        EXIT;
      END IF;
      
      -- Safety counter to prevent infinite loop
      counter := counter + 1;
      IF counter > 100 THEN
        RAISE EXCEPTION 'Unable to generate unique account number after 100 attempts';
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for account number generation on insert
DROP TRIGGER IF EXISTS generate_account_number_trigger ON public.profiles;
CREATE TRIGGER generate_account_number_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_account_number();

-- Update existing users without account numbers
UPDATE public.profiles 
SET account_number = '9' || lpad(floor(random() * 1000000000)::text, 9, '0')
WHERE account_number IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_number ON public.profiles(account_number);
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_date ON public.transactions(user_id, date);

-- Add a function to find user by account number (for internal transfers)
CREATE OR REPLACE FUNCTION public.find_user_by_account_number(p_account_number text)
RETURNS TABLE(user_id uuid, full_name text, account_number text)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.user_id, p.full_name, p.account_number
  FROM public.profiles p
  WHERE p.account_number = p_account_number
  LIMIT 1;
$$;