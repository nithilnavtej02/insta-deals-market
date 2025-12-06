import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | null;
  brand: string | null;
  location: string | null;
  images: string[];
  key_features: string[] | null;
  status: 'active' | 'sold' | 'draft' | 'hidden';
  views: number;
  likes: number;
  featured: boolean;
  sold_to: string | null;
  sold_at: string | null;
  sold_price: number | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
    location: string;
    verified: boolean;
  };
  categories?: {
    name: string;
    icon: string;
    color: string;
  };
}

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          images,
          location,
          created_at,
          seller_id,
          category_id,
          profiles:seller_id (
            username
          ),
          categories:category_id (
            name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProducts((data as unknown) as Product[] || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id: string): Promise<Product | null> => {
    if (!id) return null;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          original_price,
          images,
          key_features,
          location,
          condition,
          brand,
          created_at,
          seller_id,
          category_id,
          profiles:seller_id (
            username,
            display_name,
            avatar_url,
            verified
          ),
          categories:category_id (
            name
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown) as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  const createProduct = async (productData: {
    title: string;
    description?: string;
    price: number;
    original_price?: number;
    category_id?: string;
    condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
    brand?: string;
    location?: string;
    images?: string[];
    key_features?: string[];
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
        .from('products')
        .insert({
          ...productData,
          seller_id: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh products list
      fetchProducts();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh products list
      fetchProducts();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh products list
      fetchProducts();
      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
  };
}