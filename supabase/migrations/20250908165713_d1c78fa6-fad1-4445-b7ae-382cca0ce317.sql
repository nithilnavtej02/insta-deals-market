-- Critical Security Fixes: Data Exposure and Privacy Protection

-- 1. Fix follows table - remove public visibility policy
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;

-- Create restrictive policies for follows table
CREATE POLICY "Users can view follows involving them only" 
ON public.follows 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p1 
      WHERE p1.user_id = auth.uid() AND p1.id = follows.follower_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles p2 
      WHERE p2.user_id = auth.uid() AND p2.id = follows.following_id
    )
  )
);

-- 2. Create secure function for user search to prevent data leakage
CREATE OR REPLACE FUNCTION public.search_users_securely(search_query text)
RETURNS TABLE(
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  verified boolean,
  followers_count integer
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.verified,
    p.followers_count
  FROM public.profiles p
  WHERE 
    p.username IS NOT NULL 
    AND p.username ILIKE '%' || search_query || '%'
    AND LENGTH(search_query) >= 2  -- Prevent too broad searches
  ORDER BY 
    CASE WHEN p.username ILIKE search_query || '%' THEN 0 ELSE 1 END,
    p.followers_count DESC
  LIMIT 20;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_users_securely(text) TO authenticated;