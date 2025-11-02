import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share, Bookmark, Play, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReels } from "@/hooks/useReels";
import { useSavedReels } from "@/hooks/useSavedReels";
import { useReelsLikes } from "@/hooks/useReelsLikes";
import { supabase } from "@/integrations/supabase/client";

const Reels = () => {
  const navigate = useNavigate();
  const { reels: backendReels, loading, incrementViews } = useReels();
  const { saveReel, unsaveReel, isSaved } = useSavedReels();
  const { isLiked, toggleLike } = useReelsLikes();
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [shareSheet, setShareSheet] = useState<{isOpen: boolean, reel: any}>({isOpen: false, reel: null});
  const [reelUploaders, setReelUploaders] = useState<{[key: string]: any}>({});
  
  // Fetch uploader profiles for reels
  useEffect(() => {
    const fetchUploaders = async () => {
      if (backendReels.length === 0) return;
      
      const adminIds = [...new Set(backendReels.map(r => r.admin_id))];
      const { data } = await supabase
        .rpc('get_profiles_basic_by_ids', { ids: adminIds });
      
      if (data) {
        const uploaderMap: {[key: string]: any} = {};
        data.forEach((profile: any) => {
          uploaderMap[profile.id] = profile;
        });
        setReelUploaders(uploaderMap);
      }
    };
    
    fetchUploaders();
  }, [backendReels]);

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

  const togglePlay = async (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    if (playingReelId === reelId) {
      video.pause();
      setPlayingReelId(null);
    } else {
      // Pause all other videos
      Object.entries(videoRefs.current).forEach(([id, v]) => {
        if (v && id !== reelId) {
          v.pause();
        }
      });
      
      await video.play();
      setPlayingReelId(reelId);
      incrementViews(reelId);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-black">
      <div className="lg:flex lg:justify-center lg:items-center lg:min-h-screen lg:bg-black">
        <div className="w-full lg:max-w-[400px] lg:aspect-[9/16] mx-auto h-screen lg:h-auto">{/* Portrait aspect ratio with max width */}
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
                  {/* Video Player */}
                  {reel.video_url ? (
                    <>
                      <video
                        ref={(el) => (videoRefs.current[reel.id] = el)}
                        src={reel.video_url}
                        poster={reel.thumbnail_url}
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        onClick={() => togglePlay(reel.id)}
                      />
                      
                      {/* Play/Pause Button Overlay */}
                      {playingReelId !== reel.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-16 h-16 rounded-full bg-black/60 hover:bg-black/80"
                            onClick={() => togglePlay(reel.id)}
                          >
                            <Play className="h-8 w-8 text-white fill-white" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Fallback to thumbnail if no video */}
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-16 h-16 rounded-full bg-black/60 hover:bg-black/80"
                          disabled
                        >
                          <Play className="h-8 w-8 text-white fill-white" />
                        </Button>
                      </div>
                    </>
                  )}

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
                    {reelUploaders[reel.admin_id] && (
                      <p 
                        className="text-sm font-medium text-white cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${reelUploaders[reel.admin_id].user_id}`);
                        }}
                      >
                        @{reelUploaders[reel.admin_id].username || 'Unknown'}
                      </p>
                    )}
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
                      onClick={() => setShareSheet({isOpen: true, reel})}
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

      {/* Share Sheet */}
      {shareSheet.isOpen && shareSheet.reel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-background dark:bg-card rounded-t-3xl w-full max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Share to</h2>
              <Button variant="ghost" size="icon" onClick={() => setShareSheet({isOpen: false, reel: null})}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: "WhatsApp", icon: "💬", color: "bg-green-500", action: () => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this reel: ${shareSheet.reel.title} - ${window.location.origin}/reels?id=${shareSheet.reel.id}`)}`, '_blank');
                  }},
                  { name: "Instagram", icon: "📷", color: "bg-gradient-to-r from-purple-500 to-pink-500", action: () => {
                    window.open(`https://www.instagram.com/?url=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "TikTok", icon: "🎵", color: "bg-black", action: () => {
                    window.open(`https://www.tiktok.com/share?url=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "X (Twitter)", icon: "🐦", color: "bg-black", action: () => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this reel: ${shareSheet.reel.title}`)}`, '_blank');
                  }},
                  { name: "LinkedIn", icon: "💼", color: "bg-blue-600", action: () => {
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "Snapchat", icon: "👻", color: "bg-yellow-400", action: () => {
                    window.open(`https://www.snapchat.com/share?url=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "Facebook", icon: "👥", color: "bg-blue-500", action: () => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "Copy Link", icon: "🔗", color: "bg-gray-500", action: () => {
                    navigator.clipboard.writeText(`${window.location.origin}/reels?id=${shareSheet.reel.id}`);
                    alert("Link copied to clipboard!");
                  }},
                ].map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className="flex flex-col items-center gap-2 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center text-white text-xl`}>
                      {option.icon}
                    </div>
                    <span className="text-xs font-medium text-center text-foreground">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Reels;