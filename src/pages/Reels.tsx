import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, Bookmark, Play, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReels } from "@/hooks/useReels";
import { useSavedReels } from "@/hooks/useSavedReels";
import { useReelsLikes } from "@/hooks/useReelsLikes";

const Reels = () => {
  const navigate = useNavigate();
  const { reels: backendReels, loading, incrementViews } = useReels();
  const { saveReel, unsaveReel, isSaved } = useSavedReels();
  const { isLiked, toggleLike } = useReelsLikes();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };



  const toggleSave = async (reelId: string) => {
    if (isSaved(reelId)) {
      await unsaveReel(reelId);
    } else {
      await saveReel(reelId);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-black">
      <div className="lg:flex lg:justify-center lg:items-center lg:min-h-screen">
        <div className="lg:w-96 lg:h-screen h-screen">
          {/* Header */}
          <div className="px-5 py-4 bg-black">
            <h1 className="text-2xl font-bold text-white">Product Reels</h1>
            <p className="text-gray-300 text-base mt-1">Discover amazing products</p>
          </div>

          {/* Reels Container */}
          <div 
            className="overflow-y-scroll snap-y snap-mandatory"
            style={{ 
              height: 'calc(100vh - 88px)',
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth'
            }}
          >
            {backendReels.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <p className="text-lg mb-2">No reels available</p>
                  <p className="text-gray-400">Check back later for new content!</p>
                </div>
              </div>
            ) : (
              backendReels.map((reel, index) => (
              <div 
                key={reel.id} 
                className="relative snap-start px-3 py-2"
                style={{ height: '75vh' }}
              >
                <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gray-800">
                  {/* Background Image */}
                  <img
                    src={reel.thumbnail_url}
                    alt={reel.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-16 h-16 rounded-full bg-black/60 hover:bg-black/80"
                    >
                      <Play className="h-8 w-8 text-white fill-white" />
                    </Button>
                  </div>

                  {/* Buy Button - Top Right */}
                  {reel.buy_link && (
                    <Button
                      className="absolute top-5 right-5 bg-primary/95 hover:bg-primary text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-lg"
                      size="sm"
                      onClick={() => {
                        if (reel.buy_link) {
                          window.open(reel.buy_link, '_blank');
                        }
                      }}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">Buy</span>
                    </Button>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Content Info */}
                  <div className="absolute bottom-5 left-5 right-24">
                    <h3 className="text-lg font-bold text-white mb-1.5">{reel.title}</h3>
                    <p className="text-sm text-gray-300 mb-2.5 line-clamp-2 leading-5">
                      {reel.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary">
                        Admin Reel
                      </p>
                    </div>
                  </div>

                  {/* Action Bar - Right Side */}
                  <div className="absolute right-5 bottom-24 flex flex-col items-center gap-4">
                    {/* Like Button */}
                    <div className="flex flex-col items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-11 h-11 rounded-full backdrop-blur-sm border-0",
                          isLiked(reel.id)
                            ? 'bg-red-500/30' 
                            : 'bg-white/20 hover:bg-white/30'
                        )}
                        onClick={() => toggleLike(reel.id)}
                      >
                        <Heart 
                          className={cn(
                            "h-6 w-6",
                            isLiked(reel.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-white'
                          )} 
                        />
                      </Button>
                      <span className="text-white text-xs font-semibold">
                        {formatNumber(reel.likes || 0)}
                      </span>
                    </div>

                    {/* Comment Button */}
                    <div className="flex flex-col items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
                        onClick={() => navigate(`/reel/${reel.id}/comments`)}
                      >
                        <MessageCircle className="h-6 w-6 text-white" />
                      </Button>
                      <span className="text-white text-xs font-semibold">
                        {formatNumber(reel.comments || 0)}
                      </span>
                    </div>

                    {/* Share Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
                      onClick={() => navigate('/share')}
                    >
                      <Share className="h-6 w-6 text-white" />
                    </Button>

                    {/* Save Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
                      onClick={() => toggleSave(reel.id)}
                    >
                      <Bookmark 
                        className={cn(
                          "h-6 w-6 text-white",
                          isSaved(reel.id) && 'fill-white'
                        )} 
                      />
                    </Button>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Reels;