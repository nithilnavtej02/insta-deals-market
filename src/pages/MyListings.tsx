import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Eye, Heart, MessageCircle, Plus, Calendar, User, DollarSign, Trash2, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageTransition, staggerContainer, staggerItem } from "@/components/PageTransition";
import { ListingGridSkeleton } from "@/components/skeletons/ListingSkeleton";
import BottomNavigation from "@/components/BottomNavigation";

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
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center backdrop-blur-xl bg-card/50 rounded-3xl p-8 shadow-2xl border border-border/50"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">You need to sign in to view your listings.</p>
            <Button onClick={() => navigate('/auth')} className="rounded-full px-8">
              Sign In
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const handleStatusClick = (listing: any) => {
    setSelectedListing(listing);
    setShowStatusDialog(true);
  };

  const handleDeleteListing = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success('Listing deleted successfully');
      fetchUserProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete listing');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate(-1)}
                  className="rounded-full bg-muted/50 hover:bg-muted"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">My Listings</h1>
                  <p className="text-xs text-muted-foreground">{userProducts.length} items listed</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/sell')}
                className="rounded-full shadow-lg shadow-primary/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && userProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 py-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{userProducts.filter(p => p.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{userProducts.filter(p => p.status === 'sold').length}</p>
                  <p className="text-xs text-muted-foreground">Sold</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{userProducts.reduce((sum, p) => sum + (p.views || 0), 0)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Listings */}
        <div className="px-4 pb-4">
          {loading ? (
            <ListingGridSkeleton />
          ) : userProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-6">Start selling by creating your first listing</p>
              <Button onClick={() => navigate('/sell')} className="rounded-full px-8">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {userProducts.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <Card 
                    className="overflow-hidden backdrop-blur-sm bg-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="relative">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.title}
                            className="w-28 h-28 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                            <Badge 
                              variant={product.status === "sold" ? "secondary" : "default"}
                              className={`cursor-pointer rounded-full ${
                                product.status === "sold" 
                                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                                  : "bg-primary/10 text-primary hover:bg-primary/20"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusClick(product);
                              }}
                            >
                              {product.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary mb-2">₹{product.price.toLocaleString()}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              <span className="text-xs">{product.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" />
                              <span className="text-xs">{product.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span className="text-xs">0</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(product.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 rounded-full text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/sell?edit=${product.id}`);
                                }}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 rounded-full text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={(e) => handleDeleteListing(product.id, e)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Status Details Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge 
                  variant={selectedListing?.status === "sold" ? "secondary" : "default"}
                  className={`rounded-full ${
                    selectedListing?.status === "sold" 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {selectedListing?.status}
                </Badge>
                <span className="line-clamp-1">{selectedListing?.title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedListing?.status === "sold" && selectedListing.soldTo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedListing.soldTo.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedListing.soldTo.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Sold for</span>
                      </div>
                      <p className="font-semibold">{selectedListing.soldPrice}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Date</span>
                      </div>
                      <p className="font-semibold">{selectedListing.soldDate}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">This item is currently active and available for sale.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-xl font-bold">{selectedListing?.views || 0}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-xl font-bold">{selectedListing?.likes || 0}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 text-center">
                      <p className="text-xl font-bold">{selectedListing?.messages || 0}</p>
                      <p className="text-xs text-muted-foreground">Messages</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default MyListings;
