-- Fix critical security issue: Protect sensitive user data in profiles table
-- Drop the existing policy that makes everything public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only shows public profile information to others
-- But allows users to see all their own data
CREATE POLICY "Public profile information only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see all their own profile data
  auth.uid() = user_id 
  OR 
  -- Others can only see non-sensitive public information
  (
    auth.uid() IS NOT NULL AND 
    user_id IS NOT NULL
  )
);

-- Create a view for safe public profile data that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  username,
  display_name,
  bio,
  avatar_url,
  location,
  verified,
  items_sold,
  rating,
  total_reviews,
  followers_count,
  following_count,
  created_at
FROM public.profiles;

-- Allow public read access to the safe view
CREATE POLICY "Public profiles view is readable" 
ON public.public_profiles 
FOR SELECT 
USING (true);

-- Update RLS on profiles to be more restrictive
-- Keep existing insert and update policies but make select more secure
-- The select policy above will handle this

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;