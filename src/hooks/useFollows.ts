import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useFollows() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowing();
    } else {
      setFollowing([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFollowing = async () => {
    if (!user) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userProfile) {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userProfile.id);

        if (error) throw error;
        setFollowing(data?.map(f => f.following_id) || []);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (profileId: string) => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userProfile) {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: userProfile.id,
            following_id: profileId
          });

        if (error) throw error;
        
        setFollowing(prev => [...prev, profileId]);
        toast.success('User followed successfully');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

  const unfollowUser = async (profileId: string) => {
    if (!user) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userProfile) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userProfile.id)
          .eq('following_id', profileId);

        if (error) throw error;
        
        setFollowing(prev => prev.filter(id => id !== profileId));
        toast.success('User unfollowed successfully');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  const isFollowing = (profileId: string) => {
    return following.includes(profileId);
  };

  return {
    following,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    refreshFollowing: fetchFollowing
  };
}