import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag, Star, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "sonner";

interface SellerData {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  verified: boolean;
  items_sold: number;
  rating: number;
  followers_count: number;
  following_count: number;
}

interface ProductData {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: string;
  created_at: string;
  location: string;
}

const SellerProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollows();
  const { sendMessage } = useMessages();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchSellerData();
    }
  }, [username]);

  const fetchSellerData = async () => {
    try {
      // Fetch seller profile by user_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', username)
        .single();

      if (profileError || !profileData) {
        toast.error("Seller not found");
        navigate('/');
        return;
      }

      setSeller(profileData);

      // Fetch seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profileData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error("Failed to load seller profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => {
    if (!seller) return;
    
    if (isFollowing(seller.id)) {
      unfollowUser(seller.id);
      toast.success(`Unfollowed ${seller.display_name || seller.username}`);
    } else {
      followUser(seller.id);
      toast.success(`Following ${seller.display_name || seller.username}`);
    }
  };

  const handleChat = async () => {
    if (!seller) return;
    
    try {
      // Get current user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!userProfile) {
        toast.error("Please sign in to chat");
        return;
      }

      // Check if conversation exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${userProfile.id},participant_2.eq.${seller.id}),and(participant_1.eq.${seller.id},participant_2.eq.${userProfile.id})`)
        .maybeSingle();

      if (existingConvo) {
        navigate(`/chat/${existingConvo.id}`);
      } else {
        // Create new conversation
        const { data: newConvo, error } = await supabase
          .from('conversations')
          .insert({
            participant_1: userProfile.id,
            participant_2: seller.id
          })
          .select()
          .single();

        if (error) throw error;
        
        navigate(`/chat/${newConvo.id}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error("Failed to start chat");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold">@{seller.username}</h1>
          <p className="text-xs text-muted-foreground">{products.length} listings</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={seller.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.username}`} />
            <AvatarFallback>{seller.display_name?.[0] || seller.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{seller.display_name || seller.username}</h2>
              {seller.verified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  ✓ Verified
                </Badge>
              )}
            </div>
            
            {seller.bio && (
              <p className="text-sm text-muted-foreground mb-2">{seller.bio}</p>
            )}
            
            {seller.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{seller.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">Listings</p>
          </div>
          <div>
            <p className="text-lg font-bold">{seller.followers_count || 0}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold">{seller.items_sold || 0}</p>
            <p className="text-xs text-muted-foreground">Sold</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant={isFollowing(seller.id) ? "outline" : "default"}
            className="flex-1"
            onClick={handleFollow}
          >
            {isFollowing(seller.id) ? (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleChat}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>

      {/* Products */}
      <div className="px-4">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">Active ({products.length})</TabsTrigger>
            <TabsTrigger value="sold" className="flex-1">Sold ({seller.items_sold || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            {products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active listings</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                      <p className="text-lg font-bold text-primary">${product.price}</p>
                      <p className="text-xs text-muted-foreground">{product.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sold" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sold items to display</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerProfile;
