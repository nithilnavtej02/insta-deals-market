import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ReelComment {
  id: string;
  reel_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function useReelComments(reelId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reelId) {
      fetchComments();
    }
  }, [reelId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('reel_comments')
        .select('*')
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all commenters
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .rpc('get_profiles_basic_by_ids', { ids: userIds });

        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profile: profiles?.find((p: any) => p.id === comment.user_id)
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Please login to comment');
      return { error: new Error('Not authenticated') };
    }

    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('reel_comments')
        .insert({
          reel_id: reelId,
          user_id: profile.id,
          content: content.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;

      toast.success('Comment added');
      fetchComments();
      return { error: null };
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return { error };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('reel_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment deleted');
      fetchComments();
      return { error: null };
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      return { error };
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refreshComments: fetchComments
  };
}
