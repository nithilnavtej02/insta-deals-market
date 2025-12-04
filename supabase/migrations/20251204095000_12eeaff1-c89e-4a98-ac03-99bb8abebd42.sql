-- Add key_features column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS key_features text[] DEFAULT '{}'::text[];