import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag, Star, UserPlus, UserMinus, MessageCircle, Award, Package, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollows } from "@/hooks/useFollows";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import LoadingLogo from "@/components/LoadingLogo";
import { getRandomAvatarEmoji } from "@/utils/randomStats";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (username) {
      fetchSellerData();
    }
  }, [username]);

  const fetchSellerData = async () => {
    try {
      if (!username) return;

      // Resolve profile id from @username without exposing private profile fields
      const { data: sellerProfileId, error: idError } = await supabase.rpc(
        'get_profile_id_by_username',
        { uname: username }
      );

      if (idError || !sellerProfileId) {
        toast.error("Seller not found");
        navigate('/');
        return;
      }

      // Fetch safe public profile fields via RPC
      const { data: sellerRows, error: sellerError } = await supabase.rpc(
        'get_public_profile_by_profile_id',
        { profile_uuid: sellerProfileId }
      );

      const sellerData = sellerRows?.[0] || null;
      if (sellerError || !sellerData) {
        toast.error("Seller not found");
        navigate('/');
        return;
      }

      setSeller(sellerData as unknown as SellerData);

      // Fetch seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerProfileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    } catch {
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
        <LoadingLogo size="md" text="Loading profile..." />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center bg-card p-8 rounded-3xl shadow-xl border">
          <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">This user may not exist or has been removed.</p>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary-dark relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="px-5 pt-12 pb-24 relative">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 text-white rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-white text-center">
              <h1 className="font-bold text-lg">@{seller.username}</h1>
              <p className="text-white/70 text-sm">{products.length} listings</p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Profile Card - Floating */}
      <div className="px-5 -mt-20 relative z-10">
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-16">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-lg">
              <AvatarImage src={seller.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white text-2xl font-bold">
                {seller.avatar_url ? 
                  (seller.display_name?.[0] || seller.username?.[0] || 'U') : 
                  getRandomAvatarEmoji(seller.username || 'user')
                }
              </AvatarFallback>
            </Avatar>

            {/* Name & Username */}
            <h2 className="text-xl font-bold text-foreground mt-4">{seller.display_name || seller.username}</h2>
            <p className="text-primary font-medium">@{seller.username}</p>
            
            {seller.verified && (
              <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                <Award className="h-3 w-3 mr-1" />
                Verified Seller
              </Badge>
            )}

            {seller.bio && (
              <p className="text-center text-muted-foreground mt-3 text-sm max-w-xs">{seller.bio}</p>
            )}

            {seller.location && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{seller.location}</span>
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-around mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
              <p className="text-xs text-muted-foreground">Listings</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{seller.followers_count || 0}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{seller.items_sold || 0}</p>
              <p className="text-xs text-muted-foreground">Sold</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant={isFollowing(seller.id) ? "outline" : "default"}
              className="flex-1 h-12 rounded-xl"
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
              className="flex-1 h-12 rounded-xl"
              onClick={handleChat}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="px-5 mt-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="active" className="flex-1 rounded-lg">Active ({products.length})</TabsTrigger>
            <TabsTrigger value="sold" className="flex-1 rounded-lg">Sold ({seller.items_sold || 0})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground mb-1">No active listings</p>
                <p className="text-sm text-muted-foreground">Check back later for new items</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden border-0 shadow-md rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
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
                      <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{product.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sold" className="mt-4">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">No sold items to display</p>
              <p className="text-sm text-muted-foreground">Completed sales will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerProfile;
