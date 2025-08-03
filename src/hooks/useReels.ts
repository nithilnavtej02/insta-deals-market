import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Reel {
  id: string;
  product_id: string | null;
  admin_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  video_url: string | null;
  buy_link: string | null;
  likes: number;
  comments: number;
  views: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (reelId: string) => {
    try {
      // Get current reel to increment views
      const { data: currentReel } = await supabase
        .from('reels')
        .select('views')
        .eq('id', reelId)
        .single();

      if (currentReel) {
        const { error } = await supabase
          .from('reels')
          .update({ views: currentReel.views + 1 })
          .eq('id', reelId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const incrementLikes = async (reelId: string) => {
    try {
      // Get current reel to increment likes
      const { data: currentReel } = await supabase
        .from('reels')
        .select('likes')
        .eq('id', reelId)
        .single();

      if (currentReel) {
        const { error } = await supabase
          .from('reels')
          .update({ likes: currentReel.likes + 1 })
          .eq('id', reelId);

        if (error) throw error;
        
        // Update local state
        setReels(prev => prev.map(reel => 
          reel.id === reelId 
            ? { ...reel, likes: reel.likes + 1 }
            : reel
        ));
      }
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  };

  const decrementLikes = async (reelId: string) => {
    try {
      // Get current reel to decrement likes
      const { data: currentReel } = await supabase
        .from('reels')
        .select('likes')
        .eq('id', reelId)
        .single();

      if (currentReel) {
        const { error } = await supabase
          .from('reels')
          .update({ likes: Math.max(0, currentReel.likes - 1) })
          .eq('id', reelId);

        if (error) throw error;
        
        // Update local state
        setReels(prev => prev.map(reel => 
          reel.id === reelId 
            ? { ...reel, likes: Math.max(0, reel.likes - 1) }
            : reel
        ));
      }
    } catch (error) {
      console.error('Error decrementing likes:', error);
    }
  };

  return {
    reels,
    loading,
    incrementViews,
    incrementLikes,
    decrementLikes,
    refreshReels: fetchReels
  };
}