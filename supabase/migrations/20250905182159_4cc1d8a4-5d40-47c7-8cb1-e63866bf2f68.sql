-- Create saved_reels table
CREATE TABLE public.saved_reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reel_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_reels ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_reels
CREATE POLICY "Users can view their own saved reels" 
ON public.saved_reels 
FOR SELECT 
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.id = saved_reels.user_id AND profiles.user_id = auth.uid()
));

CREATE POLICY "Users can save reels" 
ON public.saved_reels 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.id = saved_reels.user_id AND profiles.user_id = auth.uid()
));

CREATE POLICY "Users can unsave reels" 
ON public.saved_reels 
FOR DELETE 
USING (EXISTS (
  SELECT 1
  FROM profiles
  WHERE profiles.id = saved_reels.user_id AND profiles.user_id = auth.uid()
));

-- Create unique constraint to prevent duplicate saves
ALTER TABLE public.saved_reels 
ADD CONSTRAINT unique_user_reel UNIQUE (user_id, reel_id);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_reels_updated_at
BEFORE UPDATE ON public.saved_reels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();