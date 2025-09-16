import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useReelsLikes() {
  const { user } = useAuth();
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchUserLikes();
    }
  }, [user]);

  const fetchUserLikes = async () => {
    if (!user) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      const { data, error } = await supabase
        .from('reel_likes')
        .select('reel_id')
        .eq('user_id', userProfile.id);

      if (error) throw error;
      
      setUserLikes(new Set(data.map(like => like.reel_id)));
    } catch (error) {
      console.error('Error fetching user likes:', error);
    }
  };

  const toggleLike = async (reelId: string) => {
    if (!user) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      const isCurrentlyLiked = userLikes.has(reelId);
      
      if (isCurrentlyLiked) {
        // Unlike
        const { error } = await supabase
          .from('reel_likes')
          .delete()
          .eq('user_id', userProfile.id)
          .eq('reel_id', reelId);

        if (!error) {
          setUserLikes(prev => {
            const newSet = new Set(prev);
            newSet.delete(reelId);
            return newSet;
          });
        }
      } else {
        // Like
        const { error } = await supabase
          .from('reel_likes')
          .insert({
            user_id: userProfile.id,
            reel_id: reelId
          });

        if (!error) {
          setUserLikes(prev => new Set([...prev, reelId]));
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const isLiked = (reelId: string) => userLikes.has(reelId);

  return {
    isLiked,
    toggleLike,
    refreshLikes: fetchUserLikes
  };
}