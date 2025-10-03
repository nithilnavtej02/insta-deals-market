-- Storage policies for 'reels' bucket
DO $$
BEGIN
  CREATE POLICY "Users can upload to reels bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reels');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update reels bucket objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'reels')
  WITH CHECK (bucket_id = 'reels');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Public can read reels bucket"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'reels');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;