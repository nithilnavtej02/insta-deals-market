import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SavedReel {
  id: string;
  user_id: string;
  reel_id: string;
  created_at: string;
  reels?: {
    title: string;
    thumbnail_url: string;
    likes: number;
    comments: number;
    views: number;
  };
}

export function useSavedReels() {
  const { user } = useAuth();
  const [savedReels, setSavedReels] = useState<SavedReel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSavedReels();
  }, [user]);

  const fetchSavedReels = async () => {
    if (!user) return;

    try {
      // Get user's profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // For now, return empty array since saved_reels table doesn't exist yet
      // This can be implemented when the table is created
      setSavedReels([]);
    } catch (error) {
      console.error('Error fetching saved reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReel = async (reelId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Implementation when saved_reels table exists
      return { error: null };
    } catch (error) {
      console.error('Error saving reel:', error);
      return { error };
    }
  };

  const unsaveReel = async (reelId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Implementation when saved_reels table exists
      return { error: null };
    } catch (error) {
      console.error('Error unsaving reel:', error);
      return { error };
    }
  };

  return {
    savedReels,
    loading,
    saveReel,
    unsaveReel,
    refreshSavedReels: fetchSavedReels
  };
}