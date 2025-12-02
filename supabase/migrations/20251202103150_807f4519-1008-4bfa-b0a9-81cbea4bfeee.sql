-- Fix conversations RLS policies to be more permissive
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversation they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Simplified policies that work correctly
CREATE POLICY "Users can view their conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p1
    WHERE p1.user_id = auth.uid() 
    AND (p1.id = conversations.participant_1 OR p1.id = conversations.participant_2)
  )
);

CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p1
    WHERE p1.user_id = auth.uid() 
    AND (p1.id = conversations.participant_1 OR p1.id = conversations.participant_2)
  )
);

-- Fix messages RLS policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their conversations only" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;

CREATE POLICY "Users can view messages in conversations they participate in"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    INNER JOIN profiles p ON (p.id = c.participant_1 OR p.id = c.participant_2)
    WHERE c.id = messages.conversation_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    INNER JOIN profiles p ON (p.id = c.participant_1 OR p.id = c.participant_2)
    WHERE c.id = messages.conversation_id
    AND p.user_id = auth.uid()
    AND p.id = messages.sender_id
  )
);

CREATE POLICY "Users can update their sent messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.id = messages.sender_id
  )
);