import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, Shield, UserPlus, UserMinus, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useFollows } from "@/hooks/useFollows";
import { useReviews } from "@/hooks/useReviews";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ShareDialog from "@/components/ShareDialog";
import { formatLocation } from "@/utils/locationFormat";

import { ReviewCard } from "@/components/ReviewCard";
import { generateRandomViews, generateRandomLikes, formatNumber, getRandomAvatarEmoji } from "@/utils/randomStats";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchProductById } = useProducts();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { isFollowing, followUser, unfollowUser } = useFollows();
  const { reviews: sellerReviews } = useReviews();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const productData = await fetchProductById(id);
        setProduct(productData);
      }
      setLoading(false);
    };
    loadProduct();
  }, [id, fetchProductById]);

  const isProductLiked = product ? isFavorite(product.id) : false;

  // Generate random stats for display
  const randomViews = product ? generateRandomViews(product.id) : 0;
  const randomLikes = product ? generateRandomLikes(product.id) : 0;

  const handleToggleFavorite = async () => {
    if (!product) return;
    
    if (isProductLiked) {
      const { error } = await removeFromFavorites(product.id);
      if (error) {
        toast.error('Failed to remove from favorites');
      } else {
        toast.success('Removed from favorites');
      }
    } else {
      const { error } = await addToFavorites(product.id);
      if (error) {
        toast.error('Failed to add to favorites');
      } else {
        toast.success('Added to favorites');
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, 1);
      toast.success('✓ Item added to your cart!', {
        description: 'Go to cart to complete your purchase',
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart')
        }
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleChat = async () => {
    if (!product?.seller_id) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to chat');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        toast.error('Profile not found');
        return;
      }

      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${userProfile.id},participant_2.eq.${product.seller_id}),and(participant_1.eq.${product.seller_id},participant_2.eq.${userProfile.id})`)
        .single();

      if (existingConv) {
        navigate(`/chat/${existingConv.id}`);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant_1: userProfile.id,
            participant_2: product.seller_id
          })
          .select('id')
          .single();

        if (error) throw error;
        navigate(`/chat/${newConv.id}`);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleFollow = () => {
    if (!product?.seller_id) return;
    
    if (isFollowing(product.seller_id)) {
      unfollowUser(product.seller_id);
    } else {
      followUser(product.seller_id);
    }
  };

  // Parse key features if available
  const keyFeatures = product.key_features || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">Back to Products</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
            <Heart className={`h-5 w-5 ${isProductLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="lg:max-w-6xl lg:mx-auto lg:grid lg:grid-cols-[1fr,1fr] lg:gap-12 lg:p-8">
        {/* Image Section - Left side on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Main Image */}
          <div className="border rounded-lg overflow-hidden bg-muted/20 aspect-square lg:aspect-[4/3]">
            <img
              src={product.images?.[currentImageIndex] || '/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Thumbnails below main image */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details - Right side on desktop */}
        <div className="p-4 space-y-5 lg:p-0">
          {/* Category Badge */}
          <div className="text-sm font-semibold text-primary uppercase tracking-wider">
            {product.categories?.name || 'PRODUCT'}
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-4xl font-bold leading-tight">{product.title}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl lg:text-3xl font-bold text-primary">₹{product.price?.toLocaleString()}</span>
            {product.original_price && (
              <span className="text-lg text-muted-foreground line-through">₹{product.original_price?.toLocaleString()}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Key Features */}
          {keyFeatures.length > 0 && (
            <Card className="border">
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {keyFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 py-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatNumber(randomViews)} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatNumber(randomLikes)} likes</span>
            </div>
          </div>

          {/* Product Details */}
          <Card className="border">
            <CardContent className="p-5">
              <h3 className="font-bold text-lg mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.categories?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">{product.condition || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium">{product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{formatLocation(product.location)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.profiles?.avatar_url} />
                    <AvatarFallback>
                      {product.profiles?.avatar_url ? 
                        (product.profiles?.display_name?.[0] || 'U') : 
                        getRandomAvatarEmoji(product.profiles?.username || 'user')
                      }
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{product.profiles?.display_name || 'Seller'}</h3>
                      {product.profiles?.verified && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{product.profiles?.username || 'user'}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{formatLocation(product.location)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (product?.profiles?.username) {
                        navigate(`/u/${product.profiles.username}`);
                      } else if (product?.seller_id) {
                        navigate(`/profile/${product.seller_id}`);
                      }
                    }}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant={isFollowing(product.seller_id) ? "secondary" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={handleFollow}
                  >
                    {isFollowing(product.seller_id) ? (
                      <><UserMinus className="h-4 w-4 mr-2" />Unfollow</>
                    ) : (
                      <><UserPlus className="h-4 w-4 mr-2" />Follow</>
                    )}
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleChat}>
                <MessageCircle className="h-4 w-4" />
                Chat with Seller
              </Button>
            </CardContent>
          </Card>

          {/* Reviews */}
          {sellerReviews.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Seller Reviews</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sellerReviews.slice(0, 5).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-background border-t p-4 lg:max-w-7xl lg:mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button size="lg" onClick={() => navigate(`/checkout?product=${product.id}`)}>
            Buy Now
          </Button>
        </div>
      </div>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        title={product.title}
        url={window.location.href}
        text={`Check out this ${product.title} for ₹${product.price}`}
      />
    </div>
  );
};

export default ProductDetail;
