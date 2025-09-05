import { ArrowLeft, Heart, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, loading, removeFromFavorites } = useFavorites();

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading favorites...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Favorites</h1>
        </div>
        
        {/* Toggle between Favorites and Saved */}
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-background text-foreground"
            onClick={() => {}}
          >
            Favorites
          </button>
          <button 
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground"
            onClick={() => navigate('/saved')}
          >
            Saved
          </button>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="p-4">
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No favorites yet. Start exploring products!
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((item) => (
            <Card key={item.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/product/${item.product_id}`)}>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={item.products?.images?.[0] || "/placeholder.svg"}
                    alt={item.products?.title}
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(item.product_id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.products?.title}</h3>
                  <p className="text-lg font-bold text-primary mb-2">${item.products?.price}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    {item.products?.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-primary">@{item.products?.profiles?.username || 'Unknown'}</p>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;