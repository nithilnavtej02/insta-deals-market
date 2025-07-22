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
      title: "Vintage Watch Collection",
      description: "Check out this amazing vintage watch collection! Each piece tells a story of timeless craftsmanship...",
      seller: "@vintage_collector",
      price: "$150-$500",
      likes: "1.2K",
      comments: "145",
      isLiked: false,
      isSaved: false,
      gradient: "from-amber-900 to-orange-900",
      image: "/lovable-uploads/7ca162be-1e79-409e-bfbf-704e1e3a247a.png"
    },
    {
      id: 2,
      title: "Sneaker Collection",
      description: "Rare and limited edition sneakers in perfect condition. All authentic with original boxes...",
      seller: "@sneaker_head",
      price: "$200-$800",
      likes: "3.5K",
      comments: "289",
      isLiked: true,
      isSaved: false,
      gradient: "from-blue-900 to-cyan-900",
      image: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png"
    },
    {
      id: 3,
      title: "Gaming Setup Tour",
      description: "My complete gaming setup for sale! RGB lighting, mechanical keyboard, high-end monitor and more...",
      seller: "@pro_gamer",
      price: "$1200",
      likes: "2.6K",
      comments: "289",
      isLiked: false,
      isSaved: true,
      gradient: "from-purple-900 to-pink-900",
      image: "/lovable-uploads/a86d1bac-83d4-497e-a7d5-021edd3da1c7.png"
    },
    {
      id: 4,
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
      id: 5,
      title: "iPhone 14 Pro Max",
      description: "Latest iPhone in pristine condition with all original accessories and warranty...",
      seller: "@tech_deals",
      price: "$899",
      likes: "8.1K",
      comments: "567",
      isLiked: true,
      isSaved: false,
      gradient: "from-blue-900 to-purple-900"
    },
    {
      id: 6,
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
      id: 7,
      title: "Art Collection Pieces",
      description: "Beautiful handcrafted art pieces from local artists. Perfect for home decoration...",
      seller: "@art_gallery",
      price: "$200-$800",
      likes: "3.4K",
      comments: "156",
      isLiked: true,
      isSaved: true,
      gradient: "from-orange-900 to-red-900"
    },
    {
      id: 8,
      title: "Professional Camera Gear",
      description: "Complete photography setup with lenses, tripods, and accessories. Perfect for professionals...",
      seller: "@photo_pro",
      price: "$1,800",
      likes: "4.2K",
      comments: "298",
      isLiked: false,
      isSaved: false,
      gradient: "from-gray-900 to-slate-900"
    },
    {
      id: 9,
      title: "Mountain Bike Collection",
      description: "High-end mountain bikes for all terrains. Lightweight carbon frame with premium components...",
      seller: "@bike_enthusiast",
      price: "$800-$3000",
      likes: "1.8K",
      comments: "134",
      isLiked: true,
      isSaved: false,
      gradient: "from-emerald-900 to-teal-900"
    },
    {
      id: 10,
      title: "Home Studio Equipment",
      description: "Professional music production equipment. High-quality mics, audio interface, and monitors...",
      seller: "@music_producer",
      price: "$1,200",
      likes: "2.9K",
      comments: "187",
      isLiked: false,
      isSaved: true,
      gradient: "from-violet-900 to-purple-900"
    }
  ];

  const [reelStates, setReelStates] = useState(
    reels.map(reel => ({ isLiked: reel.isLiked, isSaved: reel.isSaved, likes: reel.likes }))
  );

  const reel = reels[currentReel];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black px-5 py-4">
        <h1 className="text-white text-2xl font-bold">Product Reels</h1>
        <p className="text-white/70 text-base mt-1">Discover amazing products</p>
      </div>

      {/* Reels Container - Scrollable */}
      <div 
        className="relative overflow-y-auto lg:flex lg:justify-center snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="lg:w-96 lg:mx-auto">
          {reels.map((reel, index) => (
            <div
              key={reel.id}
              className="relative w-full h-[75vh] mx-3 my-2 rounded-[20px] overflow-hidden bg-gray-800 snap-start"
              style={{ scrollSnapAlign: 'start' }}
            >
            {/* Background Image */}
            {reel.image ? (
              <img
                src={reel.image}
                alt={reel.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${reel.gradient}`} />
            )}
            
            {/* Overlay for better text readability - removed dark overlay */}
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/60 hover:bg-black/80 text-white rounded-full w-16 h-16 border-0"
              >
                <Play className="h-8 w-8 fill-white" />
              </Button>
            </div>

            {/* Buy Button */}
            <Button
              className="absolute top-5 right-5 bg-blue-600/95 backdrop-blur-sm hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-[20px] flex items-center gap-1.5 shadow-lg border-0"
              onClick={() => {
                // Redirect to external link for buying
                window.open('https://example.com/buy', '_blank');
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Buy
            </Button>

            {/* Content - Bottom Left with subtle background */}
            <div className="absolute bottom-5 left-5 right-24 bg-black/20 backdrop-blur-md rounded-lg p-3 border border-white/10">
              <h3 className="text-white text-lg font-bold mb-1.5">{reel.title}</h3>
              <p className="text-white/90 text-sm mb-2.5 line-clamp-2 leading-5">{reel.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-blue-400 text-sm font-medium">{reel.seller}</span>
                <span className="text-white font-bold text-base">{reel.price}</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="absolute right-5 bottom-32 flex flex-col items-center space-y-4">
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-11 h-11 rounded-full border-0 backdrop-blur-sm ${
                    reelStates[index]?.isLiked 
                      ? 'bg-red-500/40 hover:bg-red-500/50' 
                      : 'bg-white/30 hover:bg-white/40'
                  }`}
                  onClick={() => {
                    const newStates = [...reelStates];
                    newStates[index].isLiked = !newStates[index].isLiked;
                    const currentLikes = parseInt(newStates[index].likes.replace('K', '000').replace('.', ''));
                    newStates[index].likes = newStates[index].isLiked 
                      ? `${((currentLikes + 1) / 1000).toFixed(1)}K`
                      : `${((currentLikes - 1) / 1000).toFixed(1)}K`;
                    setReelStates(newStates);
                  }}
                >
                  <Heart className={`h-6 w-6 ${reelStates[index]?.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </Button>
                <span className="text-white text-xs font-semibold mt-1.5">{reelStates[index]?.likes || reel.likes}</span>
              </div>

              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-full bg-white/30 hover:bg-white/40 border-0 backdrop-blur-sm"
                  onClick={() => navigate(`/reel/${reel.id}/comments`)}
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </Button>
                <span className="text-white text-xs font-semibold mt-1.5">{reel.comments}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="w-11 h-11 rounded-full bg-white/30 hover:bg-white/40 border-0 backdrop-blur-sm"
                onClick={() => navigate('/share')}
              >
                <Share className="h-6 w-6 text-white" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-11 h-11 rounded-full bg-white/30 hover:bg-white/40 border-0 backdrop-blur-sm"
                onClick={() => {
                  const newStates = [...reelStates];
                  newStates[index].isSaved = !newStates[index].isSaved;
                  setReelStates(newStates);
                }}
              >
                <Bookmark className={`h-6 w-6 text-white ${reelStates[index]?.isSaved ? 'fill-white' : ''}`} />
              </Button>
            </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Reels;