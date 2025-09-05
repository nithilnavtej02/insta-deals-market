import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

      const { data, error } = await supabase
        .from('saved_reels')
        .select(`
          *,
          reels:reel_id (
            title,
            thumbnail_url,
            likes,
            comments,
            views
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedReels((data as unknown) as SavedReel[] || []);
    } catch (error) {
      console.error('Error fetching saved reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReel = async (reelId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Check if already saved
      const { data: existingSave } = await supabase
        .from('saved_reels')
        .select('*')
        .eq('user_id', profile.id)
        .eq('reel_id', reelId)
        .single();

      if (existingSave) {
        return { error: new Error('Already saved') };
      }

      const { data, error } = await supabase
        .from('saved_reels')
        .insert({
          user_id: profile.id,
          reel_id: reelId
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh saved reels
      fetchSavedReels();
      toast.success('Reel saved');
      return { data, error: null };
    } catch (error) {
      console.error('Error saving reel:', error);
      toast.error('Failed to save reel');
      return { error };
    }
  };

  const unsaveReel = async (reelId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('saved_reels')
        .delete()
        .eq('user_id', profile.id)
        .eq('reel_id', reelId);

      if (error) throw error;
      
      // Refresh saved reels
      fetchSavedReels();
      toast.success('Reel unsaved');
      return { error: null };
    } catch (error) {
      console.error('Error unsaving reel:', error);
      toast.error('Failed to unsave reel');
      return { error };
    }
  };

  const isSaved = (reelId: string) => {
    return savedReels.some(save => save.reel_id === reelId);
  };

  return {
    savedReels,
    loading,
    saveReel,
    unsaveReel,
    isSaved,
    refreshSavedReels: fetchSavedReels
  };
}