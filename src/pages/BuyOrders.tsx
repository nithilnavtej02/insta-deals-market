import { useState, useEffect } from "react";
import { ArrowLeft, Package, User, Phone, Mail, MapPin, CreditCard, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { getRandomAvatarEmoji } from "@/utils/randomStats";

interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  total_amount: number;
  quantity: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  buyer_mobile: string;
  buyer_email: string;
  notes: string;
  created_at: string;
  products?: {
    title: string;
    price: number;
    images: string[];
  };
  buyer?: {
    id: string;
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const BuyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (title, price, images)
        `)
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch buyer profiles separately
      const ordersWithBuyers = await Promise.all(
        (data || []).map(async (order) => {
          const { data: buyerData } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url')
            .eq('id', order.buyer_id)
            .single();
          
          return { ...order, buyer: buyerData };
        })
      );

      setOrders(ordersWithBuyers);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithBuyer = async (buyerId: string) => {
    if (!profile) return;

    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${profile.id},participant_2.eq.${buyerId}),and(participant_1.eq.${buyerId},participant_2.eq.${profile.id})`)
        .single();

      if (existingConv) {
        navigate(`/chat/${existingConv.id}`);
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            participant_1: profile.id,
            participant_2: buyerId
          })
          .select('id')
          .single();

        if (error) throw error;
        navigate(`/chat/${newConv.id}`);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
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
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Buy Orders</h1>
            <p className="text-sm text-muted-foreground">Orders from buyers</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
            <p className="text-muted-foreground">When buyers purchase your products, their orders will appear here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="h-10 w-10 cursor-pointer"
                      onClick={() => order.buyer?.username && navigate(`/u/${order.buyer.username}`)}
                    >
                      <AvatarImage src={order.buyer?.avatar_url || undefined} />
                      <AvatarFallback>
                        {order.buyer?.avatar_url ? 
                          order.buyer?.username?.slice(0, 2).toUpperCase() : 
                          getRandomAvatarEmoji(order.buyer?.username || 'user')
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p 
                        className="font-semibold cursor-pointer hover:text-primary"
                        onClick={() => order.buyer?.username && navigate(`/u/${order.buyer.username}`)}
                      >
                        @{order.buyer?.username || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">wants to buy this product</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Product Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <img 
                    src={order.products?.images?.[0] || '/placeholder.svg'} 
                    alt={order.products?.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{order.products?.title}</p>
                    <p className="text-primary font-bold">₹{order.total_amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Qty: {order.quantity}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/product/${order.product_id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.buyer_mobile}</span>
                    </div>
                    {order.buyer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{order.buyer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <p className="font-medium text-foreground">{order.shipping_first_name} {order.shipping_last_name}</p>
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                    <p>{order.shipping_country}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span>Method: {order.payment_method}</span>
                    <Badge variant="outline">{order.payment_status}</Badge>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => order.buyer && handleChatWithBuyer(order.buyer.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Buyer
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-right">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BuyOrders;