-- Fix cart_items RLS policy
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view only their cart items" ON public.cart_items;

-- Create correct RLS policies for cart_items
CREATE POLICY "Users can view their own cart items"
ON public.cart_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = cart_items.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own cart items"
ON public.cart_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = cart_items.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own cart items"
ON public.cart_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = cart_items.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own cart items"
ON public.cart_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = cart_items.user_id
    AND profiles.user_id = auth.uid()
  )
);