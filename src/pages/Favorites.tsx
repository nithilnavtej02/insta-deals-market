import { ArrowLeft, Heart, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/BottomNavigation";

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { favorites, loading, removeFromFavorites } = useFavorites();

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">My Collection</h1>
              <p className="text-xs text-muted-foreground">{favorites.length} saved items</p>
            </div>
          </div>
          
          {/* Toggle */}
          <div className="px-4 pb-3">
            <div className="flex bg-muted/50 p-1 rounded-full">
              <button className="flex-1 px-4 py-2 text-sm font-medium rounded-full bg-background shadow-sm">
                Favorites
              </button>
              <button 
                className="flex-1 px-4 py-2 text-sm font-medium rounded-full text-muted-foreground"
                onClick={() => navigate('/saved')}
              >
                Saved Reels
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="p-4">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-red-500/50" />
              </div>
              <h3 className="font-bold text-lg mb-2">No favorites yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Start exploring and save products you love
              </p>
              <Button onClick={() => navigate('/home')} className="rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Explore Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((item) => (
                <Card 
                  key={item.id} 
                  className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${item.product_id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={item.products?.images?.[0] || "/placeholder.svg"}
                        alt={item.products?.title}
                        className="w-full aspect-square object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 shadow-lg hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromFavorites(item.product_id);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{item.products?.title}</h3>
                      <p className="text-lg font-bold text-primary mb-2">₹{item.products?.price?.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{item.products?.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Collection</h1>
              <p className="text-sm text-muted-foreground">{favorites.length} saved items</p>
            </div>
          </div>
          
          {/* Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-full">
            <button className="px-6 py-2 text-sm font-medium rounded-full bg-background shadow-sm">
              Favorites
            </button>
            <button 
              className="px-6 py-2 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/saved')}
            >
              Saved Reels
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {favorites.length === 0 ? (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="py-24 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full flex items-center justify-center">
                <Heart className="h-12 w-12 text-red-500/50" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No favorites yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Start exploring our collection and save products you love
              </p>
              <Button onClick={() => navigate('/home')} size="lg" className="rounded-full px-10">
                <Sparkles className="h-5 w-5 mr-2" />
                Explore Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((item) => (
              <Card 
                key={item.id} 
                className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                onClick={() => navigate(`/product/${item.product_id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={item.products?.images?.[0] || "/placeholder.svg"}
                      alt={item.products?.title}
                      className="w-full aspect-square object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/90 shadow-lg hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromFavorites(item.product_id);
                      }}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{item.products?.title}</h3>
                    <p className="text-xl font-bold text-primary mb-2">₹{item.products?.price?.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{item.products?.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Favorites;