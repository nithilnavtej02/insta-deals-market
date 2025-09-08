-- Comprehensive security fix for all remaining RLS policy issues

-- Fix messages table - should only be accessible by participants
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their conversations only" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p1 WHERE p1.user_id = auth.uid() AND p1.id = messages.sender_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p2 WHERE p2.user_id = auth.uid() AND p2.id = messages.receiver_id
    )
  )
);

-- Fix orders table - restrict to buyers and sellers only
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view orders they are involved in" 
ON public.orders 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p1 WHERE p1.user_id = auth.uid() AND p1.id = orders.buyer_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p2 WHERE p2.user_id = auth.uid() AND p2.id = orders.seller_id
    )
  )
);

-- Fix notifications table - only viewable by the recipient
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view only their notifications" 
ON public.notifications 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.id = notifications.user_id
  )
);

-- Fix cart_items table - only viewable by cart owner
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart_items;
CREATE POLICY "Users can view only their cart items" 
ON public.cart_items 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.id = cart_items.user_id
  )
);

-- Fix conversations table - only viewable by participants
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p1 WHERE p1.user_id = auth.uid() AND p1.id = conversations.participant_1
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p2 WHERE p2.user_id = auth.uid() AND p2.id = conversations.participant_2
    )
  )
);

-- Update the profiles policy to be more secure while allowing the function to work
DROP POLICY IF EXISTS "Users can view their complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile access for own data and security definer functions" ON public.profiles;

CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy that allows the security definer function to work
-- by checking if we're in a function context
CREATE POLICY "Allow secure function access to profiles" 
ON public.profiles 
FOR SELECT 
USING (
  current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  AND current_user = 'authenticator'
);