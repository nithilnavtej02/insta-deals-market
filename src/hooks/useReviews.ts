import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  product_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function useReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
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
        .from('reviews')
        .select(`
          *,
          profiles:reviewer_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('reviewed_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as unknown) as Review[] || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: {
    reviewed_id: string;
    product_id?: string;
    rating: number;
    comment?: string;
  }) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          reviewer_id: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh reviews list
      fetchReviews();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating review:', error);
      return { data: null, error };
    }
  };

  return {
    reviews,
    loading,
    createReview,
    refreshReviews: fetchReviews
  };
}