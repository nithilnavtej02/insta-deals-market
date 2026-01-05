-- Security hardening + OTP support (no PII stored)

-- 1) Fix function search_path mutability (linter warning)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) PROFILES: stop exposing email/phone to the public
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles: owner can select"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Profiles: owner can insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profiles: owner can update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Optional: allow admins to view all profiles (for admin tooling)
CREATE POLICY "Profiles: admin can select all"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::public.app_role));

-- 3) FAVORITES: fix broken policy logic + restrict to authenticated users
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can add to favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove from favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;

CREATE POLICY "Favorites: owner can select"
ON public.favorites
FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT p.user_id
    FROM public.profiles p
    WHERE p.id = favorites.user_id
  )
);

CREATE POLICY "Favorites: owner can insert"
ON public.favorites
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = (
    SELECT p.user_id
    FROM public.profiles p
    WHERE p.id = favorites.user_id
  )
);

CREATE POLICY "Favorites: owner can delete"
ON public.favorites
FOR DELETE
TO authenticated
USING (
  auth.uid() = (
    SELECT p.user_id
    FROM public.profiles p
    WHERE p.id = favorites.user_id
  )
);

-- 4) NOTIFICATIONS: fix update policy + restrict to authenticated users
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view only their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Notifications: owner can select"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  auth.uid() = (
    SELECT p.user_id
    FROM public.profiles p
    WHERE p.id = notifications.user_id
  )
);

CREATE POLICY "Notifications: owner can update"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = (
    SELECT p.user_id
    FROM public.profiles p
    WHERE p.id = notifications.user_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT p.user_id
    FROM public.profiles p
    WHERE p.id = notifications.user_id
  )
);

-- 5) Safe public RPCs for signup validation (avoids public reads on profiles)
CREATE OR REPLACE FUNCTION public.is_username_available(uname text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE lower(p.username) = lower(trim(uname))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_email_available(email_input text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE lower(p.email) = lower(trim(email_input))
  );
$$;

-- 6) OTP storage (hashed only; no raw email/phone stored)
CREATE TABLE IF NOT EXISTS public.signup_email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL,
  code_hash text NOT NULL,
  purpose text NOT NULL DEFAULT 'signup',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  consumed_at timestamptz NULL,
  attempts integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_signup_email_otps_email_hash ON public.signup_email_otps (email_hash);
CREATE INDEX IF NOT EXISTS idx_signup_email_otps_expires_at ON public.signup_email_otps (expires_at);

ALTER TABLE public.signup_email_otps ENABLE ROW LEVEL SECURITY;
