import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    title: string;
    price: number;
    images: string[];
    location: string;
    seller_id: string;
    profiles?: {
      username: string;
      display_name: string;
    };
  };
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
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
        .from('favorites')
        .select(`
          *,
          products:product_id (
            title,
            price,
            images,
            location,
            seller_id,
            profiles:seller_id (
              username,
              display_name
            )
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites((data as unknown) as Favorite[] || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Check if already favorited
      const { data: existingFavorite } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', profile.id)
        .eq('product_id', productId)
        .single();

      if (existingFavorite) {
        return { error: new Error('Already favorited') };
      }

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: profile.id,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh favorites
      fetchFavorites();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { data: null, error };
    }
  };

  const removeFromFavorites = async (productId: string) => {
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
        .from('favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      // Refresh favorites
      fetchFavorites();
      return { error: null };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { error };
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(fav => fav.product_id === productId);
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites: fetchFavorites
  };
}