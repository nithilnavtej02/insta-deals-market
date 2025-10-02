import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Bell, Search, Users, Car, Home as HomeIcon, Gamepad2, Shirt, Laptop, Music, Camera, Baby, MoreHorizontal, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNavigation from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useLocation } from "@/hooks/useLocation";
import { useShareProduct } from "@/hooks/useShareProduct";
import { useFavorites } from "@/hooks/useFavorites";
import ShareDialog from "@/components/ShareDialog";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();
  const { location, updateLocation, getCurrentLocation } = useLocation();
  const { shareProduct } = useShareProduct();
  const [searchQuery, setSearchQuery] = useState("");
  const [shareDialog, setShareDialog] = useState<{isOpen: boolean, product: any}>({isOpen: false, product: null});

  // Get user's location on mount
  useEffect(() => {
    if (!location || location === "New York") {
      getCurrentLocation();
    }
  }, []);

  // Category icons mapping
  const categoryIcons = {
    Electronics: Laptop,
    Fashion: Shirt,
    Vehicles: Car,
    "Home & Garden": HomeIcon,
    Sports: Users,
    Gaming: Gamepad2,
    Music: Music,
    Photography: Camera,
    "Baby & Kids": Baby,
    More: MoreHorizontal,
  };

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const toggleLike = async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer"
              onClick={() => navigate('/location')}
            >
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return "Good morning!";
                  if (hour < 17) return "Good afternoon!";
                  return "Good evening!";
                })()}
              </h2>
              <p className="text-sm text-muted-foreground">{profile?.username || user?.email?.split('@')[0] || 'User'}</p>
            </div>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
              onFocus={() => navigate('/search')}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Categories</h3>
          <Button 
            variant="ghost" 
            className="text-primary text-sm"
            onClick={() => navigate('/categories')}
          >
            See All
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {categories.slice(0, 4).map((category, index) => {
            const emojis = ['📱', '👔', '🚗', '🏠', '⚽', '🎮', '🎵', '📷', '🍼'];
            const emoji = emojis[index] || '📦';
            return (
              <div
                key={category.id}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", category.color || "bg-primary")}>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <span className="text-xs text-center text-muted-foreground">{category.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Products */}
      <div className="px-4 pb-20">
        <h3 className="text-lg font-semibold mb-4">Latest Products</h3>
        <div className="space-y-4 p-4">
          {productsLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No products available</div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative">
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={cn(
                      "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm",
                      isFavorite(product.id) && "text-red-500 hover:text-red-600"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(product.id);
                    }}
                  >
                    <Heart className={cn("h-4 w-4", isFavorite(product.id) && "fill-red-500")} />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.title}</h3>
                  <p className="text-xl font-bold text-primary">${product.price}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{product.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.seller_id} • ⭐ {4.5}
                      </p>
                    </div>
                     <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareDialog({isOpen: true, product});
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">{product.likes} likes</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {shareDialog.product && (
        <ShareDialog
          isOpen={shareDialog.isOpen}
          onClose={() => setShareDialog({isOpen: false, product: null})}
          title={shareDialog.product.title}
          url={`${window.location.origin}/product/${shareDialog.product.id}`}
          text={`Check out this ${shareDialog.product.title} for $${shareDialog.product.price}`}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Home;