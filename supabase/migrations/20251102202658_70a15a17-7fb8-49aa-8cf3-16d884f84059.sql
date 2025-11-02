-- Add mobile_number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Drop orders table if exists to recreate
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create orders table with comprehensive tracking
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC NOT NULL,
  
  -- Contact Information
  buyer_mobile TEXT NOT NULL,
  buyer_email TEXT,
  
  -- Shipping Address
  shipping_first_name TEXT NOT NULL,
  shipping_last_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_state TEXT,
  shipping_country TEXT DEFAULT 'India',
  
  -- Payment Information
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'cod')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  utr_number TEXT,
  payment_proof_url TEXT,
  
  -- Order Details
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view their own orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = orders.buyer_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view their orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = orders.seller_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = orders.buyer_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Buyers can update their own orders (for payment proof)
CREATE POLICY "Buyers can update their orders"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = orders.buyer_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Sellers can update order status
CREATE POLICY "Sellers can update order status"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = orders.seller_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create user_roles table and enum for admin functionality
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON public.orders
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create payment proofs storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Payment proofs storage policies
CREATE POLICY "Users can upload payment proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their payment proofs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all payment proofs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND public.has_role(auth.uid(), 'admin')
  );