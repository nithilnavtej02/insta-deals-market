import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, MapPin, Calendar, Phone, Video, MessageCircle, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";

const PublicProfile = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error } = usePublicProfile(profileId);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showVerifiedDialog, setShowVerifiedDialog] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (profileId) {
      fetchProducts();
      fetchReviews();
      checkFollowStatus();
      setupConversation();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    // This is now handled by the usePublicProfile hook
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profileId)
        .eq('status', 'active');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles:reviewer_id(*)')
        .eq('reviewed_id', profileId);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;
    
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', userProfile.id)
        .eq('following_id', profile?.id)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const setupConversation = async () => {
    if (!user || !profileId) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${userProfile.id},participant_2.eq.${profileId}),and(participant_1.eq.${profileId},participant_2.eq.${userProfile.id})`)
        .single();

      if (existingConv) {
        setConversationId(existingConv.id);
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant_1: userProfile.id,
            participant_2: profileId
          })
          .select('id')
          .single();

        if (!error && newConv) {
          setConversationId(newConv.id);
        }
      }
    } catch (error) {
      console.error('Error setting up conversation:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userProfile.id)
          .eq('following_id', profileId);
        setIsFollowing(false);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: userProfile.id,
            following_id: profileId
          });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The profile you are looking for does not exist.'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-6 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>
            {profile.avatar_url ? 
              (profile.display_name?.slice(0, 2) || profile.username?.slice(0, 2) || 'U') : 
              (() => {
                const emojis = ['😊', '🎯', '🌟', '🎨', '🚀', '💎', '🔥', '⚡', '🌈', '🎪'];
                const index = profile.username ? profile.username.length % emojis.length : 0;
                return emojis[index];
              })()
            }
          </AvatarFallback>
        </Avatar>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          {profile.verified && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={() => setShowVerifiedDialog(true)}
            >
              <Shield className="h-5 w-5 text-blue-500" />
            </Button>
          )}
        </div>
        
        <p className="text-muted-foreground mb-1">@{profile.username}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
          <span>⭐ {profile.rating}/5.0</span>
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {profile.bio && (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold">{products.length}</div>
            <div className="text-sm text-muted-foreground">Products</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{profile.followers_count}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{profile.following_count}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
        </div>

        {/* Action Buttons */}
        {user && profileId !== profile.user_id && (
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleFollow}
              variant={isFollowing ? "outline" : "default"}
              className="flex-1 max-w-[120px]"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button variant="outline" size="icon" onClick={async () => {
              if (conversationId) {
                navigate(`/chat/${conversationId}`);
              } else {
                // Create conversation and navigate
                try {
                  const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                  if (userProfile && profile) {
                    const { data: newConv, error } = await supabase
                      .from('conversations')
                      .insert({
                        participant_1: userProfile.id,
                        participant_2: profile.id
                      })
                      .select('id')
                      .single();

                    if (!error && newConv) {
                      navigate(`/chat/${newConv.id}`);
                    }
                  }
                } catch (error) {
                  console.error('Error creating conversation:', error);
                }
              }
            }}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="px-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-4">
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products listed yet
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <CardContent className="p-0">
                    <img 
                      src={product.images?.[0] || "/placeholder.svg"} 
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h3>
                      <p className="text-primary font-bold">${product.price}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.profiles?.username}`} />
                        <AvatarFallback>{review.profiles?.username?.slice(0, 2) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{review.profiles?.display_name || review.profiles?.username}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Verified Badge Dialog */}
      <Dialog open={showVerifiedDialog} onOpenChange={setShowVerifiedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Verified User
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This user has been verified by our team. Verified users have confirmed their identity and meet our trust standards.
          </p>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default PublicProfile;