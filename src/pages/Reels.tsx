import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark, Play, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Reels = () => {
  const navigate = useNavigate();
  const [currentReel, setCurrentReel] = useState(0);
  
  const reels = [
    {
      id: 1,
      title: "Designer Handbags",
      description: "Authentic designer handbags in excellent condition. Comes with dust bags and certificates...",
      seller: "@luxury_bags",
      price: "$400-$2000",
      likes: "2.2K",
      comments: "178",
      isLiked: false,
      isSaved: false,
      gradient: "from-purple-900 to-pink-900"
    },
    {
      id: 2,
      title: "Gaming Setup Complete",
      description: "Ultimate gaming setup with RGB lighting, mechanical keyboard, and high-end monitor...",
      seller: "@gamer_pro",
      price: "$2,500",
      likes: "5.8K",
      comments: "324",
      isLiked: true,
      isSaved: false,
      gradient: "from-blue-900 to-purple-900"
    },
    {
      id: 3,
      title: "Vintage Leather Jacket",
      description: "Classic vintage leather jacket from the 80s. Perfect condition, rare find...",
      seller: "@vintage_style",
      price: "$150",
      likes: "1.5K",
      comments: "89",
      isLiked: false,
      isSaved: true,
      gradient: "from-green-900 to-blue-900"
    },
    {
      id: 4,
      title: "iPhone 14 Pro Max",
      description: "Latest iPhone in pristine condition with all original accessories and warranty...",
      seller: "@tech_deals",
      price: "$899",
      likes: "8.1K",
      comments: "567",
      isLiked: false,
      isSaved: false,
      gradient: "from-red-900 to-purple-900"
    },
    {
      id: 5,
      title: "Art Collection Pieces",
      description: "Beautiful handcrafted art pieces from local artists. Perfect for home decoration...",
      seller: "@art_gallery",
      price: "$200-$800",
      likes: "3.4K",
      comments: "156",
      isLiked: true,
      isSaved: true,
      gradient: "from-orange-900 to-red-900"
    }
  ];

  const [reelStates, setReelStates] = useState(
    reels.map(reel => ({ isLiked: reel.isLiked, isSaved: reel.isSaved, likes: reel.likes }))
  );

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
      <div className={`relative h-screen w-full bg-gradient-to-br ${reel.gradient}`}>
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
              onClick={() => {
                const newStates = [...reelStates];
                newStates[currentReel].isLiked = !newStates[currentReel].isLiked;
                const currentLikes = parseInt(newStates[currentReel].likes.replace('K', '000').replace('.', ''));
                newStates[currentReel].likes = newStates[currentReel].isLiked 
                  ? `${((currentLikes + 1) / 1000).toFixed(1)}K`
                  : `${((currentLikes - 1) / 1000).toFixed(1)}K`;
                setReelStates(newStates);
              }}
            >
              <Heart className={cn("h-6 w-6", reelStates[currentReel]?.isLiked && "fill-red-500 text-red-500")} />
            </Button>
            <span className="text-white text-sm font-medium">{reelStates[currentReel]?.likes || reel.likes}</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/20 text-white rounded-full backdrop-blur-sm mb-1"
              onClick={() => navigate(`/reel/${reel.id}/comments`)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <span className="text-white text-sm font-medium">{reel.comments}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 text-white rounded-full backdrop-blur-sm"
            onClick={() => navigate('/share')}
          >
            <Share className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 text-white rounded-full backdrop-blur-sm"
            onClick={() => {
              const newStates = [...reelStates];
              newStates[currentReel].isSaved = !newStates[currentReel].isSaved;
              setReelStates(newStates);
            }}
          >
            <Bookmark className={cn("h-6 w-6", reelStates[currentReel]?.isSaved && "fill-yellow-500 text-yellow-500")} />
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