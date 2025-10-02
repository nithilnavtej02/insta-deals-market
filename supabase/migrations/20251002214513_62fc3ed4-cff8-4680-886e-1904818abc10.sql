-- Allow users to insert reels
CREATE POLICY "Users can create reels"
ON public.reels
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = reels.admin_id
    AND profiles.user_id = auth.uid()
  )
);

-- Allow users to update their own reels
CREATE POLICY "Users can update their own reels"
ON public.reels
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = reels.admin_id
    AND profiles.user_id = auth.uid()
  )
);