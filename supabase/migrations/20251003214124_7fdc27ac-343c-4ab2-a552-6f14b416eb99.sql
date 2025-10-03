-- Create function to notify admin when their reel gets interaction
CREATE OR REPLACE FUNCTION notify_reel_admin(
  reel_uuid UUID,
  interaction_type TEXT,
  user_profile_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_profile_id UUID;
  user_name TEXT;
  reel_title TEXT;
BEGIN
  -- Get the admin profile id and reel title
  SELECT admin_id, title INTO admin_profile_id, reel_title
  FROM reels
  WHERE id = reel_uuid;
  
  -- Get the username of the user who performed the action
  SELECT COALESCE(username, display_name, email) INTO user_name
  FROM profiles
  WHERE id = user_profile_id;
  
  -- Don't notify if admin is interacting with their own reel
  IF admin_profile_id = user_profile_id THEN
    RETURN;
  END IF;
  
  -- Insert notification for the admin
  INSERT INTO notifications (user_id, type, title, content, action_url)
  VALUES (
    admin_profile_id,
    interaction_type,
    CASE interaction_type
      WHEN 'reel_like' THEN 'New Like on Your Reel'
      WHEN 'reel_save' THEN 'Reel Saved'
      WHEN 'reel_comment' THEN 'New Comment'
      ELSE 'New Interaction'
    END,
    CASE interaction_type
      WHEN 'reel_like' THEN user_name || ' liked your reel "' || reel_title || '"'
      WHEN 'reel_save' THEN user_name || ' saved your reel "' || reel_title || '"'
      WHEN 'reel_comment' THEN user_name || ' commented on your reel "' || reel_title || '"'
      ELSE user_name || ' interacted with your reel "' || reel_title || '"'
    END,
    '/reels'
  );
END;
$$;

-- Trigger for reel likes
CREATE OR REPLACE FUNCTION notify_on_reel_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM notify_reel_admin(NEW.reel_id, 'reel_like', NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER reel_like_notification
AFTER INSERT ON reel_likes
FOR EACH ROW
EXECUTE FUNCTION notify_on_reel_like();

-- Trigger for reel saves
CREATE OR REPLACE FUNCTION notify_on_reel_save()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM notify_reel_admin(NEW.reel_id, 'reel_save', NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER reel_save_notification
AFTER INSERT ON saved_reels
FOR EACH ROW
EXECUTE FUNCTION notify_on_reel_save();