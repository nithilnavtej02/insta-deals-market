-- Create a more secure solution by using a database function to filter sensitive data
-- Drop the existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profile information visible to authenticated users" ON public.profiles;

-- Create a security definer function that returns only public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  verified BOOLEAN,
  items_sold INTEGER,
  rating NUMERIC,
  total_reviews INTEGER,
  followers_count INTEGER,
  following_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    p.bio,
    p.avatar_url,
    p.location,
    p.verified,
    p.items_sold,
    p.rating,
    p.total_reviews,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
$$;

-- Create new policies
-- Policy 1: Users can see all their own profile data (including sensitive fields)
CREATE POLICY "Users can view their complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Prevent access to other users' profiles directly
-- This forces the use of the security definer function for public access
CREATE POLICY "Restrict other profiles access" 
ON public.profiles 
FOR SELECT 
USING (false);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile TO authenticated;