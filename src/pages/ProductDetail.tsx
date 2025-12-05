import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, MessageCircle, MapPin, Shield, UserPlus, UserMinus, Eye, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useFollows } from "@/hooks/useFollows";
import { useReviews } from "@/hooks/useReviews";
import { useUsdRate } from "@/hooks/useUsdRate";
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
  const { convertToUsd } = useUsdRate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(false);
      const productData = await fetchProductById(id);
      if (productData) {
        setProduct(productData);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, fetchProductById]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const isProductLiked = product ? isFavorite(product.id) : false;
  const randomViews = product ? generateRandomViews(product.id) : 0;
  const randomLikes = product ? generateRandomLikes(product.id) : 0;
  const images = product?.images || [];
  const minSwipeDistance = 50;

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

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
      toast.success('Item added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">This product may have been removed or doesn't exist.</p>
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

  const keyFeatures = product.key_features || [];
  const priceInUsd = product.price ? convertToUsd(product.price) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Products</span>
        </button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
            <Heart className={`h-5 w-5 ${isProductLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
        {/* Left Column - Images */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Main Image with Navigation */}
          <div 
            className="relative border rounded-xl overflow-hidden bg-muted/10 aspect-square"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[currentImageIndex] || '/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-contain"
            />
            
            {/* Desktop Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg transition-all opacity-0 lg:opacity-100 hover:scale-110"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg transition-all opacity-0 lg:opacity-100 hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-xs font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-muted-foreground/50'
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

        {/* Right Column - Product Details */}
        <div className="p-4 lg:p-0 space-y-6">
          {/* Category */}
          <div className="text-sm font-bold text-primary uppercase tracking-wider">
            {product.categories?.name || 'PRODUCT'}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {product.title}
          </h1>

          {/* Price with USD */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl lg:text-4xl font-bold text-primary">
              ₹{product.price?.toLocaleString()}
            </span>
            <span className="text-xl lg:text-2xl font-semibold text-blue-600">
              (${priceInUsd.toLocaleString()})
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground text-base leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Key Features Card */}
          {keyFeatures.length > 0 && (
            <Card className="border rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {keyFeatures.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Stats & Stock */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{formatNumber(randomViews)} views</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{formatNumber(randomLikes)} likes</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">1 in stock</span>
          </div>

          {/* Product Details Card */}
          <Card className="border rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Product Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.categories?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium capitalize">{product.condition?.replace('_', ' ') || 'N/A'}</span>
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

          {/* Seller Info Card */}
          <Card className="border rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.profiles?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {product.profiles?.avatar_url ? 
                        (product.profiles?.display_name?.[0] || 'U') : 
                        getRandomAvatarEmoji(product.profiles?.username || 'user')
                      }
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{product.profiles?.display_name || 'Seller'}</h3>
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

                <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleChat}>
                  <MessageCircle className="h-4 w-4" />
                  Chat with Seller
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          {sellerReviews.length > 0 && (
            <Card className="border rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Seller Reviews</h3>
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

      {/* Bottom Actions - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={handleAddToCart} className="h-12">
            Add to Cart
          </Button>
          <Button size="lg" onClick={() => navigate(`/checkout?product=${product.id}`)} className="h-12">
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