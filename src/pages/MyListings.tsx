import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Eye, Heart, MessageCircle, Plus, Calendar, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchUserProducts();
    }
  }, [user, profile]);

  const fetchUserProducts = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (name)
        `)
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserProducts(data || []);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading your listings...</div>
      </div>
    );
  }

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
      postedDate: "2 days ago",
      soldTo: null,
      soldDate: null
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
      postedDate: "1 week ago",
      soldTo: {
        name: "John Doe",
        username: "@johndoe",
        phone: "+91 98765 43210",
        email: "john@example.com"
      },
      soldDate: "3 days ago",
      soldPrice: "$1,200"
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
      postedDate: "3 days ago",
      soldTo: null,
      soldDate: null
    }
  ];

  const handleStatusClick = (listing: any) => {
    setSelectedListing(listing);
    setShowStatusDialog(true);
  };

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
        {userProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't listed any products yet</p>
            <Button onClick={() => navigate('/sell')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </div>
        ) : (
          userProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden cursor-pointer">
              <CardContent className="p-0">
                <div className="flex" onClick={() => navigate(`/product/${product.id}`)}>
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{product.title}</h3>
                      <Badge 
                        variant={product.status === "sold" ? "secondary" : "default"}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusClick(product);
                        }}
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-primary mb-2">${product.price}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {product.views || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {product.likes || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        0
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sell?edit=${product.id}`);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Status Details Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant={selectedListing?.status === "sold" ? "secondary" : "default"}>
                {selectedListing?.status}
              </Badge>
              {selectedListing?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedListing?.status === "sold" && selectedListing.soldTo ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedListing.soldTo.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedListing.soldTo.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sold for {selectedListing.soldPrice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sold on {selectedListing.soldDate}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Buyer Contact:</p>
                    <p className="text-sm text-muted-foreground">Phone: {selectedListing.soldTo.phone}</p>
                    <p className="text-sm text-muted-foreground">Email: {selectedListing.soldTo.email}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">This item is currently active and available for sale.</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{selectedListing?.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Likes:</span>
                    <span>{selectedListing?.likes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages:</span>
                    <span>{selectedListing?.messages}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyListings;