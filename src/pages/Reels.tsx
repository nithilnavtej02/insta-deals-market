import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share, Bookmark, Play, ShoppingBag, X, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReels } from "@/hooks/useReels";
import { useSavedReels } from "@/hooks/useSavedReels";
import { useReelsLikes } from "@/hooks/useReelsLikes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const Reels = () => {
  const navigate = useNavigate();
  const { reels: backendReels, loading, incrementViews } = useReels();
  const { saveReel, unsaveReel, isSaved } = useSavedReels();
  const { isLiked, toggleLike } = useReelsLikes();
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);
  const [mutedReels, setMutedReels] = useState<Set<string>>(new Set());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [shareSheet, setShareSheet] = useState<{isOpen: boolean, reel: any}>({isOpen: false, reel: null});
  const [reelUploaders, setReelUploaders] = useState<{[key: string]: any}>({});
  const isMobile = useIsMobile();
  
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
    try {
      if (isSaved(reelId)) {
        await unsaveReel(reelId);
        toast.success("Removed from saved");
      } else {
        await saveReel(reelId);
        toast.success("Saved!");
      }
    } catch (error) {
      toast.error("Failed to save reel");
    }
  };

  const toggleMute = (reelId: string) => {
    const video = videoRefs.current[reelId];
    if (!video) return;

    const newMutedReels = new Set(mutedReels);
    if (mutedReels.has(reelId)) {
      newMutedReels.delete(reelId);
      video.muted = false;
    } else {
      newMutedReels.add(reelId);
      video.muted = true;
    }
    setMutedReels(newMutedReels);
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

  // Mobile View - Fullscreen TikTok style
  if (isMobile) {
    return (
      <div className="h-screen overflow-hidden bg-black">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-5 pt-12 pb-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white" />
              <h1 className="text-xl font-bold text-white">Reels</h1>
            </div>
          </div>
        </div>

        {/* Reels Container */}
        <div 
          className="overflow-y-scroll snap-y snap-mandatory h-full"
          style={{ scrollBehavior: 'smooth' }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin mx-auto mb-4" />
                <p className="text-white/80">Loading reels...</p>
              </div>
            </div>
          ) : backendReels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center px-8">
                <Sparkles className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">No reels available</p>
                <p className="text-white/60">Check back later for new content!</p>
              </div>
            </div>
          ) : (
            backendReels.map((reel) => (
              <div 
                key={reel.id} 
                className="relative snap-start h-screen w-full"
              >
                {/* Video/Image */}
                <div className="absolute inset-0 bg-black">
                  {reel.video_url ? (
                    <video
                      ref={(el) => (videoRefs.current[reel.id] = el)}
                      src={reel.video_url}
                      poster={reel.thumbnail_url}
                      className="w-full h-full object-contain"
                      loop
                      playsInline
                      muted={mutedReels.has(reel.id)}
                      onClick={() => togglePlay(reel.id)}
                    />
                  ) : (
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Play/Pause Overlay */}
                {playingReelId !== reel.id && reel.video_url && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center z-10"
                    onClick={() => togglePlay(reel.id)}
                  >
                    <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-10 w-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                {reel.buy_link && (
                  <Button
                    className="absolute top-24 right-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl z-20"
                    onClick={() => window.open(reel.buy_link!, '_blank')}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-sm font-semibold">Buy Now</span>
                  </Button>
                )}

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Content Info */}
                <div className="absolute bottom-28 left-4 right-20 z-10">
                  {/* Creator */}
                  {reelUploaders[reel.admin_id] && (
                    <div 
                      className="flex items-center gap-3 mb-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${reelUploaders[reel.admin_id].user_id}`);
                      }}
                    >
                      <Avatar className="w-10 h-10 ring-2 ring-white/50">
                        <AvatarImage src={reelUploaders[reel.admin_id].avatar_url} />
                        <AvatarFallback className="bg-primary text-white">
                          {reelUploaders[reel.admin_id].username?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-semibold text-sm">@{reelUploaders[reel.admin_id].username || 'Unknown'}</p>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-bold text-white mb-2">{reel.title}</h3>
                  <p className="text-sm text-white/80 line-clamp-2">{reel.description}</p>
                </div>

                {/* Action Buttons - Right Side */}
                <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-20">
                  {/* Like */}
                  <button
                    className="flex flex-col items-center gap-1"
                    onClick={() => toggleLike(reel.id)}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md",
                      isLiked(reel.id) ? "bg-red-500/30" : "bg-white/20"
                    )}>
                      <Heart className={cn(
                        "h-6 w-6",
                        isLiked(reel.id) ? "fill-red-500 text-red-500" : "text-white"
                      )} />
                    </div>
                    <span className="text-white text-xs font-semibold">{formatNumber(reel.likes || 0)}</span>
                  </button>

                  {/* Comment */}
                  <button
                    className="flex flex-col items-center gap-1"
                    onClick={() => navigate(`/reel/${reel.id}/comments`)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold">{formatNumber(reel.comments || 0)}</span>
                  </button>

                  {/* Share */}
                  <button
                    className="flex flex-col items-center gap-1"
                    onClick={() => setShareSheet({isOpen: true, reel})}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Share className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-xs font-semibold">Share</span>
                  </button>

                  {/* Save */}
                  <button
                    className="flex flex-col items-center gap-1"
                    onClick={() => toggleSave(reel.id)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Bookmark className={cn(
                        "h-6 w-6 text-white",
                        isSaved(reel.id) && "fill-white"
                      )} />
                    </div>
                    <span className="text-white text-xs font-semibold">Save</span>
                  </button>

                  {/* Mute/Unmute */}
                  {reel.video_url && (
                    <button
                      className="flex flex-col items-center gap-1"
                      onClick={() => toggleMute(reel.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        {mutedReels.has(reel.id) ? (
                          <VolumeX className="h-6 w-6 text-white" />
                        ) : (
                          <Volume2 className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Share Sheet */}
        {shareSheet.isOpen && shareSheet.reel && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShareSheet({isOpen: false, reel: null})}>
            <div 
              className="bg-card rounded-t-3xl w-full max-h-[70vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">Share to</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShareSheet({isOpen: false, reel: null})}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { name: "WhatsApp", icon: "💬", color: "bg-green-500", action: () => {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this reel: ${shareSheet.reel.title} - ${window.location.origin}/reels?id=${shareSheet.reel.id}`)}`, '_blank');
                    }},
                    { name: "Instagram", icon: "📷", color: "bg-gradient-to-br from-purple-500 to-pink-500", action: () => {
                      navigator.clipboard.writeText(`${window.location.origin}/reels?id=${shareSheet.reel.id}`);
                      toast.success("Link copied!");
                    }},
                    { name: "Twitter", icon: "🐦", color: "bg-black", action: () => {
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareSheet.reel.title)}&url=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                    }},
                    { name: "Copy Link", icon: "🔗", color: "bg-gray-500", action: () => {
                      navigator.clipboard.writeText(`${window.location.origin}/reels?id=${shareSheet.reel.id}`);
                      toast.success("Link copied!");
                    }},
                  ].map((option) => (
                    <button
                      key={option.name}
                      onClick={option.action}
                      className="flex flex-col items-center gap-2 p-3"
                    >
                      <div className={`w-14 h-14 rounded-full ${option.color} flex items-center justify-center text-2xl shadow-lg`}>
                        {option.icon}
                      </div>
                      <span className="text-xs font-medium text-foreground">{option.name}</span>
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
  }

  // Desktop View - Instagram-like scrollable fullscreen
  const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);

  // When a reel is selected, show fullscreen scrollable view
  if (selectedReelIndex !== null) {
    return (
      <div className="h-screen bg-black overflow-hidden">
        {/* Close button */}
        <button
          className="fixed top-6 left-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
          onClick={() => {
            // Pause current video
            Object.values(videoRefs.current).forEach(v => v?.pause());
            setPlayingReelId(null);
            setSelectedReelIndex(null);
          }}
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Scrollable reels container */}
        <div className="overflow-y-scroll snap-y snap-mandatory h-full" style={{ scrollBehavior: 'smooth' }}>
          {backendReels.map((reel, index) => (
            <div 
              key={reel.id} 
              className="relative snap-start h-screen w-full flex items-center justify-center"
            >
              <div className="relative h-full w-full max-w-[500px] mx-auto">
                {/* Video/Image */}
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  {reel.video_url ? (
                    <video
                      ref={(el) => (videoRefs.current[reel.id] = el)}
                      src={reel.video_url}
                      poster={reel.thumbnail_url}
                      className="w-full h-full object-contain"
                      loop
                      playsInline
                      muted={mutedReels.has(reel.id)}
                      onClick={() => togglePlay(reel.id)}
                      autoPlay={index === selectedReelIndex}
                    />
                  ) : (
                    <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-contain" />
                  )}
                </div>

                {/* Play/Pause Overlay */}
                {playingReelId !== reel.id && reel.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={() => togglePlay(reel.id)}>
                    <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-10 w-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                {reel.buy_link && (
                  <Button
                    className="absolute top-6 right-6 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-xl z-20"
                    onClick={() => window.open(reel.buy_link!, '_blank')}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    <span className="font-semibold">Buy Now</span>
                  </Button>
                )}

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* Content Info */}
                <div className="absolute bottom-8 left-6 right-24 z-10">
                  {reelUploaders[reel.admin_id] && (
                    <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${reelUploaders[reel.admin_id].user_id}`); }}>
                      <Avatar className="w-12 h-12 ring-2 ring-white/50">
                        <AvatarImage src={reelUploaders[reel.admin_id].avatar_url} />
                        <AvatarFallback className="bg-primary text-white">{reelUploaders[reel.admin_id].username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <p className="text-white font-semibold">@{reelUploaders[reel.admin_id].username || 'Unknown'}</p>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{reel.title}</h3>
                  <p className="text-white/80 line-clamp-2">{reel.description}</p>
                </div>

                {/* Action Buttons - Right Side */}
                <div className="absolute right-6 bottom-32 flex flex-col items-center gap-5 z-20">
                  <button className="flex flex-col items-center gap-1" onClick={() => toggleLike(reel.id)}>
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md", isLiked(reel.id) ? "bg-red-500/30" : "bg-white/20")}>
                      <Heart className={cn("h-7 w-7", isLiked(reel.id) ? "fill-red-500 text-red-500" : "text-white")} />
                    </div>
                    <span className="text-white text-sm font-semibold">{formatNumber(reel.likes || 0)}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1" onClick={() => navigate(`/reel/${reel.id}/comments`)}>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <MessageCircle className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-white text-sm font-semibold">{formatNumber(reel.comments || 0)}</span>
                  </button>
                  <button className="flex flex-col items-center gap-1" onClick={() => toggleSave(reel.id)}>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Bookmark className={cn("h-7 w-7 text-white", isSaved(reel.id) && "fill-white")} />
                    </div>
                  </button>
                  {reel.video_url && (
                    <button className="flex flex-col items-center gap-1" onClick={() => toggleMute(reel.id)}>
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        {mutedReels.has(reel.id) ? <VolumeX className="h-7 w-7 text-white" /> : <Volume2 className="h-7 w-7 text-white" />}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop Grid View
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <div className="bg-gradient-to-r from-primary via-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Product Reels</h1>
              <p className="text-white/80">Discover amazing products through short videos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading reels...</p>
            </div>
          </div>
        ) : backendReels.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Sparkles className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-xl font-semibold text-foreground mb-2">No reels available</p>
              <p className="text-muted-foreground">Check back later for new content!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
            {backendReels.map((reel, index) => (
              <div 
                key={reel.id}
                className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer"
                style={{ aspectRatio: '9/16' }}
                onClick={() => setSelectedReelIndex(index)}
                {/* Thumbnail/Video */}
                <div className="absolute inset-0 bg-black">
                  {reel.video_url ? (
                    <video
                      ref={(el) => (videoRefs.current[reel.id] = el)}
                      src={reel.video_url}
                      poster={reel.thumbnail_url}
                      className="w-full h-full object-cover"
                      loop
                      playsInline
                      muted={mutedReels.has(reel.id)}
                    />
                  ) : (
                    <img
                      src={reel.thumbnail_url}
                      alt={reel.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {playingReelId === reel.id ? (
                      <Pause className="h-8 w-8 text-white" />
                    ) : (
                      <Play className="h-8 w-8 text-white fill-white ml-1" />
                    )}
                  </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                  {reelUploaders[reel.admin_id] && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8 ring-2 ring-white/50">
                        <AvatarImage src={reelUploaders[reel.admin_id].avatar_url} />
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {reelUploaders[reel.admin_id].username?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white/90 text-sm font-medium">@{reelUploaders[reel.admin_id].username}</span>
                    </div>
                  )}
                  <h3 className="text-white font-semibold line-clamp-2 text-sm">{reel.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {formatNumber(reel.likes || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {formatNumber(reel.comments || 0)}
                    </span>
                  </div>
                </div>

                {/* Mute/Unmute button */}
                {reel.video_url && playingReelId === reel.id && (
                  <button
                    className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute(reel.id);
                    }}
                  >
                    {mutedReels.has(reel.id) ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                )}

                {/* Buy button */}
                {reel.buy_link && (
                  <Button
                    className="absolute top-3 right-3 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-full text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(reel.buy_link!, '_blank');
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    Buy
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Sheet */}
      {shareSheet.isOpen && shareSheet.reel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShareSheet({isOpen: false, reel: null})}>
          <div 
            className="bg-card rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Share Reel</h2>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShareSheet({isOpen: false, reel: null})}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: "WhatsApp", icon: "💬", color: "bg-green-500", action: () => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this reel: ${shareSheet.reel.title} - ${window.location.origin}/reels?id=${shareSheet.reel.id}`)}`, '_blank');
                  }},
                  { name: "Twitter", icon: "🐦", color: "bg-black", action: () => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareSheet.reel.title)}&url=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "Facebook", icon: "👥", color: "bg-blue-600", action: () => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/reels?id=' + shareSheet.reel.id)}`, '_blank');
                  }},
                  { name: "Copy", icon: "🔗", color: "bg-gray-500", action: () => {
                    navigator.clipboard.writeText(`${window.location.origin}/reels?id=${shareSheet.reel.id}`);
                    toast.success("Link copied!");
                  }},
                ].map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className={`w-14 h-14 rounded-full ${option.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {option.icon}
                    </div>
                    <span className="text-xs font-medium text-foreground">{option.name}</span>
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