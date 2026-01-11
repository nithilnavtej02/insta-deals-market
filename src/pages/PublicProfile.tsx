import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, MapPin, Calendar, Phone, Video, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, staggerContainer, staggerItem } from "@/components/PageTransition";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import BottomNavigation from "@/components/BottomNavigation";

const PublicProfile = () => {
  const { profileId, username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actualProfileId, setActualProfileId] = useState<string | null>(profileId || null);
  const { profile, loading, error } = usePublicProfile(actualProfileId);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showVerifiedDialog, setShowVerifiedDialog] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const resolveProfile = async () => {
      if (username && !profileId) {
        try {
          const { data: resolvedId, error } = await supabase
            .rpc('get_profile_id_by_username', { uname: username });
          
          if (!error && resolvedId) {
            setActualProfileId(resolvedId as string);
          }
        } catch (error) {
          console.error('Error resolving username to profile ID:', error);
        }
      }
    };
    
    resolveProfile();
  }, [username, profileId]);

  useEffect(() => {
    if (actualProfileId) {
      fetchProducts();
      fetchReviews();
      checkFollowStatus();
      setupConversation();
    }
  }, [actualProfileId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', actualProfileId)
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
        .eq('reviewed_id', actualProfileId);

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
    if (!user || !actualProfileId) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) return;

      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${userProfile.id},participant_2.eq.${actualProfileId}),and(participant_1.eq.${actualProfileId},participant_2.eq.${userProfile.id})`)
        .single();

      if (existingConv) {
        setConversationId(existingConv.id);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant_1: userProfile.id,
            participant_2: actualProfileId
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
          .eq('following_id', actualProfileId);
        setIsFollowing(false);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: userProfile.id,
            following_id: actualProfileId
          });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
          <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <ProfileSkeleton />
        </div>
      </PageTransition>
    );
  }

  if (error || !profile) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center backdrop-blur-xl bg-card/50 rounded-3xl p-8 shadow-2xl border border-border/50"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">😕</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Profile not found</h2>
            <p className="text-muted-foreground mb-6">{error || 'The profile you are looking for does not exist.'}</p>
            <Button onClick={() => navigate(-1)} className="rounded-full px-8">Go Back</Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="px-4 py-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full bg-muted/50 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-8 text-center"
        >
          <div className="relative inline-block mb-4">
            <Avatar className="w-28 h-28 ring-4 ring-primary/20 shadow-xl">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/10">
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
            {profile.verified && (
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                onClick={() => setShowVerifiedDialog(true)}
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-1">{profile.display_name || profile.username}</h1>
          <p className="text-muted-foreground mb-3">@{profile.username}</p>
          
          <div className="flex items-center justify-center flex-wrap gap-3 text-sm text-muted-foreground mb-4">
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-yellow-500/10 text-yellow-600">
              ⭐ {profile.rating}/5.0
            </Badge>
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {profile.bio && (
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm leading-relaxed">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm shadow-lg min-w-[80px]"
            >
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-xs text-muted-foreground">Products</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm shadow-lg min-w-[80px]"
            >
              <div className="text-2xl font-bold">{profile.followers_count}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-2xl bg-card/50 backdrop-blur-sm shadow-lg min-w-[80px]"
            >
              <div className="text-2xl font-bold">{profile.following_count}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          {user && actualProfileId !== profile.user_id && (
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className={`rounded-full px-6 ${!isFollowing && 'shadow-lg shadow-primary/25'}`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
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
                size="icon" 
                className="rounded-full"
                onClick={async () => {
                  if (conversationId) {
                    navigate(`/chat/${conversationId}`);
                  } else {
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
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="px-4">
          <Tabs defaultValue="products">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="mt-4">
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <p>No products listed yet</p>
                </div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 gap-4"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={staggerItem}>
                      <Card 
                        className="cursor-pointer overflow-hidden backdrop-blur-sm bg-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <CardContent className="p-0">
                          <div className="relative">
                            <img 
                              src={product.images?.[0] || "/placeholder.svg"} 
                              alt={product.title}
                              className="w-full h-36 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title}</h3>
                            <p className="text-primary font-bold">₹{product.price.toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <p>No reviews yet</p>
                </div>
              ) : (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {reviews.map((review) => (
                    <motion.div key={review.id} variants={staggerItem}>
                      <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                              <AvatarImage src={review.profiles?.avatar_url} />
                              <AvatarFallback className="bg-primary/10">
                                {review.profiles?.username?.slice(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{review.profiles?.display_name || review.profiles?.username}</span>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-muted'}`}>
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Verified Badge Dialog */}
        <Dialog open={showVerifiedDialog} onOpenChange={setShowVerifiedDialog}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
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
    </PageTransition>
  );
};

export default PublicProfile;
