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
      
      // Try secure function by profile_id first (works with /profile/:id)
      const { data: byProfileId, error: byProfileIdError } = await supabase
        .rpc('get_public_profile_by_profile_id', { profile_uuid: profileId });

      if (!byProfileIdError && byProfileId && byProfileId.length > 0) {
        setProfile(byProfileId[0]);
      } else {
        // Fallback: original RPC by user_id
        const { data: byUserId, error: byUserIdError } = await supabase
          .rpc('get_public_profile', { profile_user_id: profileId });

        if (byUserIdError) throw byUserIdError;
        if (!byUserId || byUserId.length === 0) {
          setError('Profile not found');
          setProfile(null);
        } else {
          setProfile(byUserId[0]);
        }
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