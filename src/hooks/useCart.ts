import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: {
    title: string;
    price: number;
    images: string[];
    seller_id: string;
    profiles?: {
      username: string;
    };
  };
}

export function useCart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
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
        .from('cart_items')
        .select(`
          *,
          products:product_id (
            title,
            price,
            images,
            seller_id,
            profiles:seller_id (
              username
            )
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCartItems((data as unknown) as CartItem[] || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', profile.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity if item already exists
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
      } else {
        // Insert new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: profile.id,
            product_id: productId,
            quantity
          })
          .select()
          .single();

        if (error) throw error;
      }
      
      // Refresh cart
      fetchCartItems();
      return { error: null };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { error };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity === 0) {
      return removeFromCart(cartItemId);
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      
      // Refresh cart
      fetchCartItems();
      return { error: null };
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return { error };
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      
      // Refresh cart
      fetchCartItems();
      return { error: null };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { error };
    }
  };

  const clearCart = async () => {
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
        .from('cart_items')
        .delete()
        .eq('user_id', profile.id);

      if (error) throw error;
      
      // Refresh cart
      fetchCartItems();
      return { error: null };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { error };
    }
  };

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartItems
  };
}