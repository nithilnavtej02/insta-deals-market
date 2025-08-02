-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT false,
  items_sold INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.categories(id),
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  brand TEXT,
  location TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft', 'hidden')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  sold_to UUID REFERENCES public.profiles(id),
  sold_at TIMESTAMP WITH TIME ZONE,
  sold_price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reels table (admin managed)
CREATE TABLE public.reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT NOT NULL,
  video_url TEXT,
  product_id UUID REFERENCES public.products(id),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  buy_link TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'product')),
  product_id UUID REFERENCES public.products(id),
  image_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES public.messages(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_id, product_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'like', 'follow', 'sale', 'review', 'system')),
  title TEXT NOT NULL,
  content TEXT,
  action_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
('Electronics', 'Phones, laptops, gadgets', 'Smartphone', '#3b82f6'),
('Fashion', 'Clothing, shoes, accessories', 'Shirt', '#ec4899'),
('Home & Garden', 'Furniture, decor, appliances', 'Home', '#10b981'),
('Sports & Outdoors', 'Equipment, gear, clothing', 'Dumbbell', '#f59e0b'),
('Books & Media', 'Books, movies, music', 'Book', '#8b5cf6'),
('Automotive', 'Cars, parts, accessories', 'Car', '#ef4444'),
('Health & Beauty', 'Cosmetics, health products', 'Heart', '#06b6d4'),
('Toys & Games', 'Kids toys, board games', 'Gamepad2', '#84cc16');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for categories (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Create RLS policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can create their own products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);

-- Create RLS policies for reels (public read, admin write)
CREATE POLICY "Reels are viewable by everyone" ON public.reels FOR SELECT USING (true);

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = receiver_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid())
);

-- Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = participant_1 AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = participant_2 AND user_id = auth.uid())
);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = participant_1 AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = participant_2 AND user_id = auth.uid())
);

-- Create RLS policies for favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their own favorites" ON public.favorites FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid())
);

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = reviewer_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = reviewer_id AND user_id = auth.uid())
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid())
);

-- Create RLS policies for follows
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON public.follows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = follower_id AND user_id = auth.uid())
);

-- Create RLS policies for cart items
CREATE POLICY "Users can view their own cart" ON public.cart_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage their own cart" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid())
);

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = buyer_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = buyer_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = buyer_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = seller_id AND user_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reels_updated_at BEFORE UPDATE ON public.reels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_product_id ON public.favorites(product_id);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);

-- Enable real-time for all tables
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.favorites REPLICA IDENTITY FULL;
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.cart_items REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;