-- Create reviews table improvements (already exists but needs enhancements)
-- Add trigger to update profile ratings/reviews count

-- Function to update profile ratings after review insert
CREATE OR REPLACE FUNCTION update_profile_ratings_after_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the reviewed user's profile with new rating average and count
  UPDATE profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE reviewed_id = NEW.reviewed_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_id = NEW.reviewed_id
    )
  WHERE id = NEW.reviewed_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for review inserts
DROP TRIGGER IF EXISTS trigger_update_profile_ratings ON reviews;
CREATE TRIGGER trigger_update_profile_ratings
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_ratings_after_review();

-- Add image_url column to messages table if not exists (for image sharing in chat)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS typing_at TIMESTAMP WITH TIME ZONE;

-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view typing status in their conversations
CREATE POLICY "Users can view typing in their conversations"
ON typing_indicators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = typing_indicators.conversation_id
    AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = c.participant_1 AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE id = c.participant_2 AND user_id = auth.uid())
    )
  )
);

-- Policy to allow users to update their own typing status
CREATE POLICY "Users can update their typing status"
ON typing_indicators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = typing_indicators.user_id AND user_id = auth.uid()
  )
);

-- Add realtime publication for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;