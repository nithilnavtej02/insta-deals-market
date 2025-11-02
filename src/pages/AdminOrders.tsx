import { ArrowLeft, Package, User, Phone, MapPin, CreditCard, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    checkAdminAndLoadOrders();
  }, [user]);

  const checkAdminAndLoadOrders = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        toast.error('Admin access required');
        navigate('/home');
        return;
      }

      setIsAdmin(true);
      await fetchAllOrders();
    } catch (error) {
      console.error('Error checking admin:', error);
      navigate('/home');
    }
  };

  const fetchAllOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id(username, display_name, avatar_url, email, mobile_number),
          seller:seller_id(username, display_name),
          products(title, price, images)
        `)
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

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Order status updated');
      fetchAllOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Order Management</h1>
            <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Info */}
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
                      Qty: {order.quantity} × ${order.products?.price}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      Total: ${order.total_amount}
                    </p>
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.buyer?.display_name || order.buyer?.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.buyer_mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {order.shipping_city}, {order.shipping_postal_code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{order.payment_method}</span>
                    {order.utr_number && (
                      <span className="text-muted-foreground">• UTR: {order.utr_number}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    >
                      Confirm
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Order ID:</span> {selectedOrder.id}</p>
                  <p><span className="text-muted-foreground">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  <p><span className="text-muted-foreground">Status:</span> <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge></p>
                </div>
              </div>

              {/* Buyer Details */}
              <div>
                <h3 className="font-semibold mb-2">Buyer Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Name:</span> {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                  <p><span className="text-muted-foreground">Username:</span> @{selectedOrder.buyer?.username}</p>
                  <p><span className="text-muted-foreground">Mobile:</span> {selectedOrder.buyer_mobile}</p>
                  {selectedOrder.buyer_email && (
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.buyer_email}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                  <p>{selectedOrder.shipping_postal_code}, {selectedOrder.shipping_country}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Method:</span> <span className="capitalize">{selectedOrder.payment_method}</span></p>
                  <p><span className="text-muted-foreground">Status:</span> {selectedOrder.payment_status}</p>
                  {selectedOrder.utr_number && (
                    <p><span className="text-muted-foreground">UTR Number:</span> {selectedOrder.utr_number}</p>
                  )}
                  {selectedOrder.payment_proof_url && (
                    <div className="mt-2">
                      <p className="text-muted-foreground mb-2">Payment Proof:</p>
                      <img 
                        src={selectedOrder.payment_proof_url} 
                        alt="Payment proof"
                        className="w-full max-w-sm rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <div className="flex gap-3">
                  {selectedOrder.products?.images?.[0] && (
                    <img 
                      src={selectedOrder.products.images[0]} 
                      alt={selectedOrder.products.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedOrder.products?.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quantity: {selectedOrder.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unit Price: ${selectedOrder.products?.price}
                    </p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      Total: ${selectedOrder.total_amount}
                    </p>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Order Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default AdminOrders;
