import { ArrowLeft, Play, Bookmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSavedReels } from "@/hooks/useSavedReels";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/BottomNavigation";

const Saved = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { savedReels, loading } = useSavedReels();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading saved reels...</p>
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
              <p className="text-xs text-muted-foreground">{savedReels.length} saved reels</p>
            </div>
          </div>
          
          {/* Toggle */}
          <div className="px-4 pb-3">
            <div className="flex bg-muted/50 p-1 rounded-full">
              <button 
                className="flex-1 px-4 py-2 text-sm font-medium rounded-full text-muted-foreground"
                onClick={() => navigate('/favorites')}
              >
                Favorites
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium rounded-full bg-background shadow-sm">
                Saved Reels
              </button>
            </div>
          </div>
        </div>

        {/* Saved Reels Grid */}
        <div className="p-4">
          {savedReels.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-full flex items-center justify-center">
                <Bookmark className="h-10 w-10 text-purple-500/50" />
              </div>
              <h3 className="font-bold text-lg mb-2">No saved reels</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                Save reels to watch them later
              </p>
              <Button onClick={() => navigate('/reels')} className="rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Explore Reels
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedReels.map((savedReel) => (
                <Card 
                  key={savedReel.id}
                  className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/reels?id=${savedReel.reel_id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-[9/16]">
                      <img
                        src={savedReel.reels?.thumbnail_url || "/placeholder.svg"}
                        alt={savedReel.reels?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="h-5 w-5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-xs font-semibold line-clamp-2">{savedReel.reels?.title}</h3>
                        <div className="flex justify-between text-[10px] text-white/80 mt-1">
                          <span>{formatNumber(savedReel.reels?.views || 0)} views</span>
                          <span>{formatNumber(savedReel.reels?.likes || 0)} likes</span>
                        </div>
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
              <p className="text-sm text-muted-foreground">{savedReels.length} saved reels</p>
            </div>
          </div>
          
          {/* Toggle */}
          <div className="flex bg-muted/50 p-1 rounded-full">
            <button 
              className="px-6 py-2 text-sm font-medium rounded-full text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate('/favorites')}
            >
              Favorites
            </button>
            <button className="px-6 py-2 text-sm font-medium rounded-full bg-background shadow-sm">
              Saved Reels
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {savedReels.length === 0 ? (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="py-24 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-full flex items-center justify-center">
                <Bookmark className="h-12 w-12 text-purple-500/50" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No saved reels</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Save reels to watch them later
              </p>
              <Button onClick={() => navigate('/reels')} size="lg" className="rounded-full px-10">
                <Sparkles className="h-5 w-5 mr-2" />
                Explore Reels
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {savedReels.map((savedReel) => (
              <Card 
                key={savedReel.id}
                className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                onClick={() => navigate(`/reels?id=${savedReel.reel_id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[9/16]">
                    <img
                      src={savedReel.reels?.thumbnail_url || "/placeholder.svg"}
                      alt={savedReel.reels?.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-7 w-7 text-white fill-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white text-sm font-semibold line-clamp-2">{savedReel.reels?.title}</h3>
                      <div className="flex justify-between text-xs text-white/80 mt-1">
                        <span>{formatNumber(savedReel.reels?.views || 0)} views</span>
                        <span>{formatNumber(savedReel.reels?.likes || 0)} likes</span>
                      </div>
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

export default Saved;