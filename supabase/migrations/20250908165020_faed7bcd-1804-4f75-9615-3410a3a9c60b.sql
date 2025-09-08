-- Fix the overly restrictive RLS policy to allow security definer function access
DROP POLICY IF EXISTS "Restrict other profiles access" ON public.profiles;

-- Create a policy that allows access through security definer functions
-- but still protects direct table access
CREATE POLICY "Allow profile access for own data and security definer functions" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = user_id
  OR 
  -- Allow access through security definer functions (indicated by current setting)
  current_setting('role', true) = 'authenticator'
);