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
    <div className="h-screen overflow-hidden bg-black">
      <div className="lg:flex lg:justify-center lg:items-center lg:min-h-screen">
        <div className="lg:w-96 lg:h-screen h-screen snap-y snap-mandatory overflow-y-scroll lg:border-x lg:border-gray-800">
          {reels.map((reel, index) => (
            <div key={reel.id} className="h-screen w-full snap-start relative flex items-center justify-center">
              {/* Background Video/Image */}
              <div className="absolute inset-0">
                <img
                  src={reel.image}
                  alt="Reel"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              {/* Content Info */}
              <div className="absolute bottom-4 left-4 right-20 z-10">
                <div className="text-white">
                  <p 
                    className="font-semibold mb-1 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${reel.seller.slice(1)}`)}
                  >
                    {reel.seller}
                  </p>
                  <p className="text-sm opacity-90 mb-2">{reel.description}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span>🏷️ {reel.price}</span>
                  </div>
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-10">
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 rounded-full ${
                      reelStates[index]?.isLiked 
                        ? 'bg-red-500/20' 
                        : 'bg-black/20 hover:bg-black/40'
                    }`}
                    onClick={() => {
                      const newStates = [...reelStates];
                      newStates[index].isLiked = !newStates[index].isLiked;
                      setReelStates(newStates);
                    }}
                  >
                    <Heart className={`h-6 w-6 ${reelStates[index]?.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </Button>
                  <span className="text-white text-xs mt-1">{reel.likes}</span>
                </div>

                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40"
                    onClick={() => navigate(`/reel/${reel.id}/comments`)}
                  >
                    <MessageCircle className="h-6 w-6 text-white" />
                  </Button>
                  <span className="text-white text-xs mt-1">{reel.comments}</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40"
                  onClick={() => navigate('/share')}
                >
                  <Share className="h-6 w-6 text-white" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40"
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