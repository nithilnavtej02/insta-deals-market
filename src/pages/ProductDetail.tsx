import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Share, MessageCircle, Phone, Video, Star, MapPin, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import CallDialog from "@/components/CallDialog";
import { useProducts } from "@/hooks/useProducts";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchProductById } = useProducts();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video">("voice");

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
    
    const { error } = await addToCart(product.id);
    if (error) {
      toast.error('Failed to add to cart');
    } else {
      toast.success('Added to cart');
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

  const handleCall = (type: "voice" | "video") => {
    setCallType(type);
    setShowCallDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
          >
            <Heart className={`h-5 w-5 ${isProductLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/share')}
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-80 bg-muted">
        <img
          src={product.images?.[0] || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          1 / {product.images?.length || 1}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <Badge variant="secondary">{product.condition}</Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-bold text-primary">${product.price}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.original_price}</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>
          
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Specifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Product Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{product.categories?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span className="font-medium">{product.condition || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-medium">{product.brand || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{product.location || 'N/A'}</span>
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
                  <AvatarFallback>{product.profiles?.display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{product.profiles?.display_name || 'Seller'}</h3>
                    {product.profiles?.verified && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 py-0 text-xs bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-green-600" />
                              Verified Seller
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              This seller is genuine and can be trusted. They have been verified by our team.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{product.profiles?.username}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{product.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/profile/${product.seller_id}`)}
              >
                View Profile
              </Button>
            </div>

            {/* Contact Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate(`/chat/${product.profiles?.username}`)}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleCall("voice")}
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => handleCall("video")}
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{product.views || 0}</p>
            <p className="text-sm text-muted-foreground">Views</p>
          </div>
          <div>
            <p className="text-lg font-bold">{product.likes || 0}</p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </div>
          <div>
            <p className="text-lg font-bold">{new Date(product.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">Posted</p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Button size="lg" onClick={() => navigate('/checkout')}>
            Buy Now
          </Button>
        </div>
      </div>

      {/* Call Dialog */}
      <CallDialog
        isOpen={showCallDialog}
        onClose={() => setShowCallDialog(false)}
        type={callType}
        contact={{
          name: product.profiles?.display_name || 'Seller',
          username: product.profiles?.username || 'seller'
        }}
      />
    </div>
  );
};

export default ProductDetail;