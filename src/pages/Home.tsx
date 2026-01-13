import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Bell, Search, Eye, Share2, TrendingUp, Sparkles, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatLocation } from "@/utils/locationFormat";
import { toast } from "sonner";
import { generateRandomViews, generateRandomLikes, formatNumber } from "@/utils/randomStats";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!location || location === "New York") {
      getCurrentLocation();
    }
  }, []);

  const categoryEmojis: Record<string, string> = {
    'Automotive': '🏎️',
    'Books & Media': '📚',
    'Electronics': '💻',
    'Fashion': '🛍️',
    'Health & Beauty': '💄',
    'Home & Garden': '🏡',
    'Sports & Outdoors': '🏋️',
    'Toys & Games': '🎮'
  };

  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const toggleLike = async (productId: string) => {
    if (!user) {
      toast.success('Please sign in to like products');
      return;
    }
    
    if (isFavorite(productId)) {
      const result = await removeFromFavorites(productId);
      if (result.error) {
        toast.error('Failed to unlike product');
      } else {
        toast.success('Removed from favorites');
      }
    } else {
      const result = await addToFavorites(productId);
      if (result.error) {
        toast.error('Failed to like product');
      } else {
        toast.success('Added to favorites');
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Premium Header */}
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-5 pt-12 pb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <button 
                className="flex items-center gap-2 text-white/90 text-sm bg-white/10 px-3 py-2 rounded-full"
                onClick={() => navigate('/location')}
              >
                <MapPin className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{location || 'Select location'}</span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-full"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Greeting */}
            <div className="mb-6">
              <p className="text-white/70 text-sm">{getGreeting()}</p>
              <h1 className="text-2xl font-bold text-white">{profile?.display_name || profile?.username || 'Welcome!'}</h1>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-0 rounded-2xl shadow-lg text-base placeholder:text-muted-foreground/60"
                onFocus={() => navigate('/search')}
              />
              <Button 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Categories</h2>
            <Button 
              variant="ghost" 
              className="text-primary text-sm font-semibold h-auto p-0"
              onClick={() => navigate('/categories')}
            >
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                className="flex flex-col items-center gap-2 min-w-[70px]"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10">
                  <span className="text-2xl">{categoryEmojis[category.name] || '📦'}</span>
                </div>
                <span className="text-xs font-medium text-muted-foreground text-center line-clamp-1 w-full">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Section */}
        <div className="px-5 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-5 mt-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Latest Products</h2>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {products.length} items
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {productsLoading ? (
              <div className="col-span-2 py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-2 py-12 text-center">
                <p className="text-muted-foreground">No products available</p>
              </div>
            ) : (
              products.map((product) => {
                const randomViews = generateRandomViews(product.id);
                const randomLikes = generateRandomLikes(product.id);
                
                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm active:scale-[0.98] transition-transform"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm",
                          isFavorite(product.id) && "text-red-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                      >
                        <Heart className={cn("h-4 w-4", isFavorite(product.id) && "fill-red-500")} />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">{product.title}</h3>
                      <p className="text-lg font-bold text-primary mt-1">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{formatLocation(product.location)}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(randomViews)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatNumber(randomLikes)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareDialog({isOpen: true, product});
                          }}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {shareDialog.product && (
          <ShareDialog
            isOpen={shareDialog.isOpen}
            onClose={() => setShareDialog({isOpen: false, product: null})}
            title={shareDialog.product.title}
            url={`${window.location.origin}/product/${shareDialog.product.id}`}
            text={`Check out this ${shareDialog.product.title} for ₹${shareDialog.product.price}`}
          />
        )}

        <BottomNavigation />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Desktop Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 text-white/90 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
                onClick={() => navigate('/location')}
              >
                <MapPin className="h-4 w-4" />
                <span>{location || 'Select location'}</span>
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-white text-primary hover:bg-white/90 rounded-full shadow-md"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-white/70 text-lg">{getGreeting()}</p>
              <h1 className="text-4xl font-bold text-white mt-1">{profile?.display_name || profile?.username || 'Welcome to ReOwn!'}</h1>
              <p className="text-white/80 mt-3 text-lg">Discover amazing pre-owned products at great prices</p>
            </div>
            <div className="relative max-w-xl ml-auto w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-14 h-14 bg-white border-0 rounded-2xl shadow-lg text-base"
                onFocus={() => navigate('/search')}
              />
              <Button 
                size="icon" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-xl"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Categories */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
            <Button 
              variant="ghost" 
              className="text-primary font-semibold"
              onClick={() => navigate('/categories')}
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-8 gap-4">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                className="flex flex-col items-center gap-3 p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <span className="text-2xl">{categoryEmojis[category.name] || '📦'}</span>
                </div>
                <span className="text-sm font-medium text-foreground text-center line-clamp-1">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Latest Products</h2>
                <p className="text-muted-foreground">{products.length} products available</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            {productsLoading ? (
              <div className="col-span-4 py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-4 py-16 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No products available</p>
              </div>
            ) : (
              products.map((product) => {
                const randomViews = generateRandomViews(product.id);
                const randomLikes = generateRandomLikes(product.id);
                
                return (
                  <Card
                    key={product.id}
                    className="border-0 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity",
                          isFavorite(product.id) && "text-red-500 opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(product.id);
                        }}
                      >
                        <Heart className={cn("h-5 w-5", isFavorite(product.id) && "fill-red-500")} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{product.title}</h3>
                      <p className="text-2xl font-bold text-primary mt-2">₹{product.price.toLocaleString()}</p>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground line-clamp-1">{formatLocation(product.location)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {formatNumber(randomViews)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              {formatNumber(randomLikes)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareDialog({isOpen: true, product});
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {shareDialog.product && (
        <ShareDialog
          isOpen={shareDialog.isOpen}
          onClose={() => setShareDialog({isOpen: false, product: null})}
          title={shareDialog.product.title}
          url={`${window.location.origin}/product/${shareDialog.product.id}`}
          text={`Check out this ${shareDialog.product.title} for ₹${shareDialog.product.price}`}
        />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Home;