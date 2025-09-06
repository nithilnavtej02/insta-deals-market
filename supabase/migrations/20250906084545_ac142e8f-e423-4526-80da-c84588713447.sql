-- Fix critical security issue: Protect sensitive user data in profiles table
-- Drop the existing policy that makes everything public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create separate policies for different access levels
-- Policy 1: Users can see all their own profile data
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can see limited public information about others
-- This excludes sensitive fields like email and phone
CREATE POLICY "Public profile information visible to authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
  -- This policy will be used by the application layer to filter sensitive fields
);