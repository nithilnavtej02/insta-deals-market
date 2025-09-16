-- Create reel_likes table for per-user likes on reels
CREATE TABLE IF NOT EXISTS public.reel_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reel_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, reel_id)
);

-- Enable RLS
ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reel_likes' AND policyname = 'Users can like reels'
  ) THEN
    CREATE POLICY "Users can like reels"
    ON public.reel_likes
    FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reel_likes.user_id AND p.user_id = auth.uid()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reel_likes' AND policyname = 'Users can unlike their reels'
  ) THEN
    CREATE POLICY "Users can unlike their reels"
    ON public.reel_likes
    FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reel_likes.user_id AND p.user_id = auth.uid()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'reel_likes' AND policyname = 'Users can view their own reel likes'
  ) THEN
    CREATE POLICY "Users can view their own reel likes"
    ON public.reel_likes
    FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = reel_likes.user_id AND p.user_id = auth.uid()
    ));
  END IF;
END $$;

-- Trigger functions to maintain reels.likes counter
CREATE OR REPLACE FUNCTION public.reel_likes_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.reels
  SET likes = COALESCE(likes, 0) + 1
  WHERE id = NEW.reel_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.reel_likes_after_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.reels
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = OLD.reel_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_reel_likes_after_insert ON public.reel_likes;
CREATE TRIGGER trg_reel_likes_after_insert
AFTER INSERT ON public.reel_likes
FOR EACH ROW
EXECUTE FUNCTION public.reel_likes_after_insert();

DROP TRIGGER IF EXISTS trg_reel_likes_after_delete ON public.reel_likes;
CREATE TRIGGER trg_reel_likes_after_delete
AFTER DELETE ON public.reel_likes
FOR EACH ROW
EXECUTE FUNCTION public.reel_likes_after_delete();

-- Follow counters via triggers
CREATE OR REPLACE FUNCTION public.follows_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- increment following count for follower
  UPDATE public.profiles
  SET following_count = COALESCE(following_count, 0) + 1
  WHERE id = NEW.follower_id;

  -- increment followers count for followed
  UPDATE public.profiles
  SET followers_count = COALESCE(followers_count, 0) + 1
  WHERE id = NEW.following_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.follows_after_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- decrement following count for follower
  UPDATE public.profiles
  SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
  WHERE id = OLD.follower_id;

  -- decrement followers count for followed
  UPDATE public.profiles
  SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
  WHERE id = OLD.following_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_follows_after_insert ON public.follows;
CREATE TRIGGER trg_follows_after_insert
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.follows_after_insert();

DROP TRIGGER IF EXISTS trg_follows_after_delete ON public.follows;
CREATE TRIGGER trg_follows_after_delete
AFTER DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.follows_after_delete();
