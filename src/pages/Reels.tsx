import { useState } from "react";
import { Heart, MessageCircle, Share, Bookmark, Play, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Reels = () => {
  const navigate = useNavigate();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  const reels = [
    {
      id: 1,
      title: "Vintage Watch Collection",
      description: "Check out this amazing vintage watch collection! Each piece tells a story of timeless craftsmanship...",
      seller: "@vintage_collector",
      price: "$150-$500",
      likes: 1234,
      comments: 145,
      isLiked: false,
      isSaved: false,
      buyable: true,
      image: "/lovable-uploads/7ca162be-1e79-409e-bfbf-704e1e3a247a.png"
    },
    {
      id: 2,
      title: "Sneaker Collection",
      description: "Rare and limited edition sneakers in perfect condition. All authentic with original boxes...",
      seller: "@sneaker_head",
      price: "$200-$800",
      likes: 3567,
      comments: 289,
      isLiked: true,
      isSaved: false,
      buyable: true,
      image: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png"
    },
    {
      id: 3,
      title: "Gaming Setup Tour",
      description: "My complete gaming setup for sale! RGB lighting, mechanical keyboard, high-end monitor and more...",
      seller: "@pro_gamer",
      price: "$1200",
      likes: 2600,
      comments: 289,
      isLiked: false,
      isSaved: true,
      buyable: true,
      image: "/lovable-uploads/a86d1bac-83d4-497e-a7d5-021edd3da1c7.png"
    },
    {
      id: 4,
      title: "Designer Handbags",
      description: "Authentic designer handbags in excellent condition. Comes with dust bags and certificates...",
      seller: "@luxury_bags",
      price: "$400-$2000",
      likes: 2234,
      comments: 178,
      isLiked: false,
      isSaved: false,
      buyable: true,
      image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg"
    },
    {
      id: 5,
      title: "iPhone 14 Pro Max",
      description: "Latest iPhone in pristine condition with all original accessories and warranty...",
      seller: "@tech_deals",
      price: "$899",
      likes: 8100,
      comments: 567,
      isLiked: true,
      isSaved: false,
      buyable: true,
      image: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg"
    },
    {
      id: 6,
      title: "Vintage Leather Jacket",
      description: "Classic vintage leather jacket from the 80s. Perfect condition, rare find...",
      seller: "@vintage_style",
      price: "$150",
      likes: 1500,
      comments: 89,
      isLiked: false,
      isSaved: true,
      buyable: true,
      image: "https://images.pexels.com/photos/934841/pexels-photo-934841.jpeg"
    },
    {
      id: 7,
      title: "Art Collection Pieces",
      description: "Beautiful handcrafted art pieces from local artists. Perfect for home decoration...",
      seller: "@art_gallery",
      price: "$200-$800",
      likes: 3400,
      comments: 156,
      isLiked: true,
      isSaved: true,
      buyable: true,
      image: "https://images.pexels.com/photos/1568607/pexels-photo-1568607.jpeg"
    },
    {
      id: 8,
      title: "Professional Camera Gear",
      description: "Complete photography setup with lenses, tripods, and accessories. Perfect for professionals...",
      seller: "@photo_pro",
      price: "$1,800",
      likes: 4200,
      comments: 298,
      isLiked: false,
      isSaved: false,
      buyable: true,
      image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg"
    }
  ];

  const [reelStates, setReelStates] = useState(
    reels.map(reel => ({ 
      isLiked: reel.isLiked, 
      isSaved: reel.isSaved, 
      likes: reel.likes 
    }))
  );

  const toggleLike = (index: number) => {
    const newStates = [...reelStates];
    newStates[index].isLiked = !newStates[index].isLiked;
    newStates[index].likes += newStates[index].isLiked ? 1 : -1;
    setReelStates(newStates);
  };

  const toggleSave = (index: number) => {
    const newStates = [...reelStates];
    newStates[index].isSaved = !newStates[index].isSaved;
    setReelStates(newStates);
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
            {reels.map((reel, index) => (
              <div 
                key={reel.id} 
                className="relative snap-start px-3 py-2"
                style={{ height: '75vh' }}
              >
                <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gray-800">
                  {/* Background Image */}
                  <img
                    src={reel.image}
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
                  {reel.buyable && (
                    <Button
                      className="absolute top-5 right-5 bg-primary/95 hover:bg-primary text-white px-3 py-2 rounded-full flex items-center gap-2 shadow-lg"
                      size="sm"
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
                      <p 
                        className="text-sm font-medium text-primary cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${reel.seller.slice(1)}`)}
                      >
                        {reel.seller}
                      </p>
                      <p className="text-base font-bold text-white">{reel.price}</p>
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
                          reelStates[index]?.isLiked 
                            ? 'bg-red-500/30' 
                            : 'bg-white/20 hover:bg-white/30'
                        )}
                        onClick={() => toggleLike(index)}
                      >
                        <Heart 
                          className={cn(
                            "h-6 w-6",
                            reelStates[index]?.isLiked 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-white'
                          )} 
                        />
                      </Button>
                      <span className="text-white text-xs font-semibold">
                        {formatNumber(reelStates[index]?.likes || 0)}
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
                        {formatNumber(reel.comments)}
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
                      onClick={() => toggleSave(index)}
                    >
                      <Bookmark 
                        className={cn(
                          "h-6 w-6 text-white",
                          reelStates[index]?.isSaved && 'fill-white'
                        )} 
                      />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Reels;