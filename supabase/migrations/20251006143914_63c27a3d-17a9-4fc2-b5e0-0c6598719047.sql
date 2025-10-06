-- Create reel_comments table for persistent comments on reels (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reel_comments') THEN
    CREATE TABLE public.reel_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reel_id UUID NOT NULL,
      user_id UUID NOT NULL,
      content TEXT NOT NULL CHECK (char_length(content) <= 1000),
      parent_id UUID NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Add foreign keys
    ALTER TABLE public.reel_comments
      ADD CONSTRAINT fk_reel_comments_reel
      FOREIGN KEY (reel_id) REFERENCES public.reels(id) ON DELETE CASCADE;

    ALTER TABLE public.reel_comments
      ADD CONSTRAINT fk_reel_comments_user
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- Enable RLS
    ALTER TABLE public.reel_comments ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.reel_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.reel_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.reel_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.reel_comments;

-- Create policies
CREATE POLICY "Comments are viewable by everyone"
ON public.reel_comments
FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.reel_comments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = reel_comments.user_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments"
ON public.reel_comments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = reel_comments.user_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own comments"
ON public.reel_comments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = reel_comments.user_id AND p.user_id = auth.uid()
  )
);

-- Trigger functions to keep reels.comments in sync and notify admin on comment
CREATE OR REPLACE FUNCTION public.reel_comments_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.reels
  SET comments = COALESCE(comments, 0) + 1
  WHERE id = NEW.reel_id;

  -- Notify reel owner
  PERFORM notify_reel_admin(NEW.reel_id, 'reel_comment', NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.reel_comments_after_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.reels
  SET comments = GREATEST(COALESCE(comments, 0) - 1, 0)
  WHERE id = OLD.reel_id;
  RETURN OLD;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS trg_reel_comments_after_insert ON public.reel_comments;
CREATE TRIGGER trg_reel_comments_after_insert
AFTER INSERT ON public.reel_comments
FOR EACH ROW
EXECUTE FUNCTION public.reel_comments_after_insert();

DROP TRIGGER IF EXISTS trg_reel_comments_after_delete ON public.reel_comments;
CREATE TRIGGER trg_reel_comments_after_delete
AFTER DELETE ON public.reel_comments
FOR EACH ROW
EXECUTE FUNCTION public.reel_comments_after_delete();

-- RPC to fetch basic public profile fields for a list of profile ids
CREATE OR REPLACE FUNCTION public.get_profiles_basic_by_ids(ids uuid[])
RETURNS TABLE(id uuid, user_id uuid, username text, display_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.user_id, p.username, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY (ids)
$$;