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
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
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
        .select('*, profiles:user_id(id, user_id, username, display_name, avatar_url)')
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setComments((data as any[]).map(comment => ({
        ...comment,
        profile: comment.profiles
      })) || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return { error: new Error('Not authenticated') };
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('reel_comments')
        .insert({
          reel_id: reelId,
          user_id: profile.id,
          content,
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Comment added');
      fetchComments();
      return { data, error: null };
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
