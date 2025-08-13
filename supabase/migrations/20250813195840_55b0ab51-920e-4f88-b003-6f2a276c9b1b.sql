-- Create admin role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to assign default user role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger to assign default role on user creation
DROP TRIGGER IF EXISTS on_auth_user_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add Nigerian bank details to profiles for transfers
ALTER TABLE public.profiles 
ADD COLUMN bank_name TEXT,
ADD COLUMN bank_code TEXT;

-- Create banks reference table for Nigerian banks
CREATE TABLE public.nigerian_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert major Nigerian banks
INSERT INTO public.nigerian_banks (name, code) VALUES
('Access Bank', '044'),
('Citibank Nigeria', '023'),
('Ecobank Nigeria', '050'),
('Fidelity Bank', '070'),
('First Bank of Nigeria', '011'),
('First City Monument Bank', '214'),
('Guaranty Trust Bank', '058'),
('Heritage Bank', '030'),
('Keystone Bank', '082'),
('Polaris Bank', '076'),
('Providus Bank', '101'),
('Stanbic IBTC Bank', '221'),
('Standard Chartered Bank', '068'),
('Sterling Bank', '232'),
('Union Bank of Nigeria', '032'),
('United Bank For Africa', '033'),
('Unity Bank', '215'),
('Wema Bank', '035'),
('Zenith Bank', '057');

-- Enable RLS on banks table
ALTER TABLE public.nigerian_banks ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read banks (needed for dropdowns)
CREATE POLICY "Banks are viewable by everyone"
ON public.nigerian_banks
FOR SELECT
USING (true);