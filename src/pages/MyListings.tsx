import { ArrowLeft, Edit, Eye, Heart, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const MyListings = () => {
  const navigate = useNavigate();

  const listings = [
    {
      id: 1,
      title: "iPhone 14 Pro Max",
      price: "$899",
      status: "active",
      views: 145,
      likes: 23,
      messages: 8,
      image: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png",
      postedDate: "2 days ago"
    },
    {
      id: 2,
      title: "MacBook Air M2",
      price: "$1,200",
      status: "sold",
      views: 89,
      likes: 15,
      messages: 12,
      image: "/lovable-uploads/7ca162be-1e79-409e-bfbf-704e1e3a247a.png",
      postedDate: "1 week ago"
    },
    {
      id: 3,
      title: "Gaming Setup",
      price: "$800",
      status: "active",
      views: 67,
      likes: 9,
      messages: 3,
      image: "/lovable-uploads/a86d1bac-83d4-497e-a7d5-021edd3da1c7.png",
      postedDate: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">My Listings</h1>
          </div>
          <Button onClick={() => navigate('/sell')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Listings */}
      <div className="p-4 space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-24 h-24 object-cover"
                />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{listing.title}</h3>
                    <Badge 
                      variant={listing.status === "sold" ? "secondary" : "default"}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-primary mb-2">{listing.price}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {listing.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {listing.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {listing.messages}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{listing.postedDate}</span>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyListings;