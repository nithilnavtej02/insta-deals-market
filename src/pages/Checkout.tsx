import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, CreditCard, Truck, Check, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import paymentQR from "@/assets/payment-qr.jpeg";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { fetchProductById } = useProducts();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    mobile: '',
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    utrNumber: '',
  });
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    const productId = searchParams.get('product');
    
    if (productId) {
      const product = await fetchProductById(productId);
      if (product) {
        setOrderItems([{
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          seller_id: product.seller_id
        }]);
      }
    } else if (cartItems.length > 0) {
      const items = cartItems.map(item => ({
        id: item.product_id,
        title: item.products?.title || 'Unknown Product',
        price: item.products?.price || 0,
        quantity: item.quantity,
        seller_id: item.products?.seller_id
      }));
      setOrderItems(items);
    } else {
      navigate('/cart');
      return;
    }
    
    setLoading(false);
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place order');
      return;
    }

    if (!formData.mobile || !formData.firstName || !formData.lastName || 
        !formData.address || !formData.city || !formData.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }

    if (paymentMethod === 'upi' && (!formData.utrNumber || !paymentProof)) {
      toast.error('Please provide UTR number and payment proof');
      return;
    }

    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      let paymentProofUrl = '';
      
      if (paymentProof && paymentMethod === 'upi') {
        const fileExt = paymentProof.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, paymentProof);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
        
        paymentProofUrl = publicUrl;
      }

      for (const item of orderItems) {
        const { data: order } = await supabase.from('orders').insert({
          buyer_id: profile.id,
          seller_id: item.seller_id,
          product_id: item.id,
          total_amount: item.price * item.quantity,
          buyer_mobile: formData.mobile,
          buyer_email: formData.email,
          shipping_first_name: formData.firstName,
          shipping_last_name: formData.lastName,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.postalCode,
          shipping_state: formData.state,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'upi' ? 'pending' : 'pending',
          utr_number: formData.utrNumber,
          payment_proof_url: paymentProofUrl,
          quantity: item.quantity
        }).select().single();

        // Create notification for seller
        if (order && item.seller_id) {
          await supabase.from('notifications').insert({
            user_id: item.seller_id,
            type: 'new_order',
            title: `@${profile.username || 'Buyer'} wants to buy this product`,
            content: `Order for ${item.title} - ₹${(item.price * item.quantity).toLocaleString()}`,
            action_url: '/buy-orders'
          });
        }
      }

      if (cartItems.length > 0) {
        await clearCart();
      }

      setIsOrdered(true);
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-muted-foreground mb-4">Your order will be reviewed and confirmed soon.</p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Checkout</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input 
                id="mobile" 
                type="tel" 
                placeholder="+91 9876543210"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code *</Label>
                <Input 
                  id="postal" 
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="state">State (Optional)</Label>
              <Input 
                id="state" 
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
            </RadioGroup>

            {paymentMethod === "upi" && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <img 
                    src={paymentQR} 
                    alt="UPI Payment QR Code" 
                    className="mx-auto w-64 h-64 object-contain border rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Scan this QR code to make payment
                  </p>
                </div>

                <div>
                  <Label htmlFor="utr">UTR Number *</Label>
                  <Input 
                    id="utr" 
                    placeholder="Enter 12-digit UTR number"
                    value={formData.utrNumber}
                    onChange={(e) => setFormData({...formData, utrNumber: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Upload Payment Screenshot *</Label>
                  <div className="mt-2">
                    {paymentProofPreview ? (
                      <div className="relative">
                        <img 
                          src={paymentProofPreview} 
                          alt="Payment proof" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setPaymentProof(null);
                            setPaymentProofPreview('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload payment proof</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handlePaymentProofChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">${item.price * item.quantity}</p>
              </div>
            ))}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          size="lg" 
          className="w-full" 
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Place Order - $${total}`}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
