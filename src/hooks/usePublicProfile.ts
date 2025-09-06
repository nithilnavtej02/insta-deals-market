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
      
      // Use the secure function to get only public profile data
      const { data, error } = await supabase
        .rpc('get_public_profile', { profile_user_id: profileId });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setError('Profile not found');
        setProfile(null);
      } else {
        setProfile(data[0]); // RPC returns an array, get the first item
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