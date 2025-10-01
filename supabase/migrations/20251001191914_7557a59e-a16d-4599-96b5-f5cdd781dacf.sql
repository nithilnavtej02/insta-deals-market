-- Create storage bucket for reel videos
INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true);

-- Create storage policies for reel uploads
CREATE POLICY "Anyone can view reel videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reels');

CREATE POLICY "Users can upload their own reels" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own reels" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'reels' AND auth.uid()::text = (storage.foldername(name))[1]);