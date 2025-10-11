-- Create secure function to fetch public profile by profile_id (profiles.id)
CREATE OR REPLACE FUNCTION public.get_public_profile_by_profile_id(profile_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  verified boolean,
  items_sold integer,
  rating numeric,
  total_reviews integer,
  followers_count integer,
  following_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
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
  WHERE p.id = profile_uuid;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_by_profile_id(uuid) TO anon, authenticated;

-- Create secure function to resolve profile id by username (supports /u/:username route)
CREATE OR REPLACE FUNCTION public.get_profile_id_by_username(uname text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id FROM public.profiles p WHERE p.username = uname LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_id_by_username(text) TO anon, authenticated;