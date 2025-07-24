import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Saved = () => {
  const navigate = useNavigate();

  const savedReels = [
    {
      id: 1,
      title: "Vintage Watch Collection",
      thumbnail: "/lovable-uploads/7ca162be-1e79-409e-bfbf-704e1e3a247a.png",
      seller: "@vintage_collector",
      price: "$150-$500",
      views: "1.2K",
      likes: "145"
    },
    {
      id: 2,
      title: "Gaming Setup Tour",
      thumbnail: "/lovable-uploads/a86d1bac-83d4-497e-a7d5-021edd3da1c7.png",
      seller: "@pro_gamer", 
      price: "$1200",
      views: "5.8K",
      likes: "456"
    },
    {
      id: 3,
      title: "Designer Handbags",
      thumbnail: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png",
      seller: "@luxury_bags",
      price: "$400-$2000",
      views: "2.2K",
      likes: "178"
    },
    {
      id: 4,
      title: "Art Collection Pieces", 
      thumbnail: "/lovable-uploads/7ca162be-1e79-409e-bfbf-704e1e3a247a.png",
      seller: "@art_gallery",
      price: "$200-$800",
      views: "3.4K",
      likes: "156"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Saved</h1>
        </div>
        
        {/* Toggle between Favorites and Saved */}
        <div className="flex bg-muted p-1 rounded-lg">
          <button 
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground"
            onClick={() => navigate('/favorites')}
          >
            Favorites
          </button>
          <button 
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md bg-background text-foreground"
            onClick={() => {}}
          >
            Saved
          </button>
        </div>
      </div>

      {/* Saved Reels Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {savedReels.map((reel) => (
            <Card 
              key={reel.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/reels?id=${reel.id}`)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={reel.thumbnail}
                    alt={reel.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  >
                    <Play className="h-6 w-6 fill-white" />
                  </Button>
                  <div className="absolute bottom-2 left-2 right-2">
                    <h3 className="text-white text-sm font-semibold truncate">{reel.title}</h3>
                    <p className="text-white/80 text-xs">{reel.seller}</p>
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{reel.views} views</span>
                    <span>{reel.likes} likes</span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{reel.price}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {savedReels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved reels yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;