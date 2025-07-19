import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark, Play, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { cn } from "@/lib/utils";

const Reels = () => {
  const [currentReel, setCurrentReel] = useState(0);

  const reels = [
    {
      id: 1,
      title: "Designer Handbags",
      description: "Authentic designer handbags in excellent condition. Comes with du...",
      seller: "@luxury_bags",
      price: "$400-$2000",
      likes: "2.2K",
      comments: "178",
      isLiked: false,
      isSaved: false
    }
  ];

  const reel = reels[currentReel];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 pt-12">
          <h1 className="text-white text-lg font-semibold">Product Reels</h1>
          <p className="text-white/80 text-sm">Discover amazing products</p>
        </div>
      </div>

      {/* Video/Reel Container */}
      <div className="relative h-screen w-full bg-gradient-to-br from-purple-900 to-pink-900">
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon-lg"
            className="bg-black/30 text-white rounded-full backdrop-blur-sm"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>

        {/* Buy Button */}
        <div className="absolute top-20 right-4 z-30">
          <Button
            variant="accent-blue"
            size="sm"
            className="rounded-full shadow-lg"
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Buy
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/20 text-white rounded-full backdrop-blur-sm mb-1"
            >
              <Heart className={cn("h-6 w-6", reel.isLiked && "fill-red-500 text-red-500")} />
            </Button>
            <span className="text-white text-sm font-medium">{reel.likes}</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/20 text-white rounded-full backdrop-blur-sm mb-1"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <span className="text-white text-sm font-medium">{reel.comments}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 text-white rounded-full backdrop-blur-sm"
          >
            <Share className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 text-white rounded-full backdrop-blur-sm"
          >
            <Bookmark className={cn("h-6 w-6", reel.isSaved && "fill-yellow-500 text-yellow-500")} />
          </Button>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-32 left-4 right-20 z-20">
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">{reel.title}</h2>
            <p className="text-white/90 mb-3 leading-relaxed">{reel.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-primary-light font-semibold text-lg">{reel.seller}</p>
              <p className="text-white font-bold text-xl">{reel.price}</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Reels;