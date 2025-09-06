import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PublicUserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  verified: boolean;
  items_sold: number;
  rating: number;
  total_reviews: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
  // Note: email and phone are intentionally excluded for security
}

export function usePublicProfile(profileId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [profileId, user]);

  const fetchProfile = async () => {
    if (!profileId) return;

    try {
      setError(null);
      
      // Select only non-sensitive fields for public viewing
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          bio,
          avatar_url,
          location,
          verified,
          items_sold,
          rating,
          total_reviews,
          followers_count,
          following_count,
          created_at,
          updated_at
        `)
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        setError('Profile not found');
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching public profile:', error);
      setError('Failed to load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile
  };
}