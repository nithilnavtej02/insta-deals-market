import { ArrowLeft, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UserOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(title, price, images),
          seller:seller_id(username, display_name)
        `)
        .eq('buyer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view orders</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">My Orders</h1>
            <p className="text-sm text-muted-foreground">{orders.length} orders</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No orders yet</p>
            <Button onClick={() => navigate('/home')}>Start Shopping</Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  {order.products?.images?.[0] && (
                    <img 
                      src={order.products.images[0]} 
                      alt={order.products.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{order.products?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Seller: @{order.seller?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {order.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total_amount}</p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{order.shipping_first_name} {order.shipping_last_name}</p>
                      <p className="text-muted-foreground">{order.shipping_address}</p>
                      <p className="text-muted-foreground">
                        {order.shipping_city}, {order.shipping_postal_code}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Payment: <span className="capitalize">{order.payment_method}</span></span>
                  {order.payment_status === 'paid' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">Paid</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default UserOrders;
