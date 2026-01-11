import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, CreditCard, Truck, Check, Upload, X, ShoppingBag, Shield } from "lucide-react";
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
import { PageTransition, staggerContainer, staggerItem } from "@/components/PageTransition";
import { CheckoutSkeleton } from "@/components/skeletons/CheckoutSkeleton";
import paymentQR from "@/assets/payment-qr.jpeg";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, clearCart } = useCart();
  const { fetchProductById } = useProducts();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
          seller_id: product.seller_id,
          image: product.images?.[0]
        }]);
      }
    } else if (cartItems.length > 0) {
      const items = cartItems.map(item => ({
        id: item.product_id,
        title: item.products?.title || 'Unknown Product',
        price: item.products?.price || 0,
        quantity: item.quantity,
        seller_id: item.products?.seller_id,
        image: item.products?.images?.[0]
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

    setSubmitting(true);

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
      setSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-green-500/5 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center backdrop-blur-xl bg-card/50 rounded-3xl p-8 shadow-2xl border border-border/50 max-w-sm w-full"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
            >
              <Check className="h-12 w-12 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-4">Your order will be reviewed and confirmed soon.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Redirecting to home...
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-8">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="px-4 py-4">
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
                <h1 className="text-xl font-bold">Checkout</h1>
                <p className="text-xs text-muted-foreground">{orderItems.length} item(s)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {loading ? (
            <CheckoutSkeleton />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* Contact Information */}
              <motion.div variants={staggerItem}>
                <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number *</Label>
                      <Input 
                        id="mobile" 
                        type="tel" 
                        placeholder="+91 9876543210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email (Optional)</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Delivery Address */}
              <motion.div variants={staggerItem}>
                <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-500" />
                      </div>
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                      <Input 
                        id="address" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                        <Input 
                          id="city" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal" className="text-sm font-medium">Postal Code *</Label>
                        <Input 
                          id="postal" 
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-sm font-medium">State (Optional)</Label>
                      <Input 
                        id="state" 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Method */}
              <motion.div variants={staggerItem}>
                <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-green-500" />
                      </div>
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${paymentMethod === 'upi' ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-muted/50'}`}>
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex-1 cursor-pointer font-medium">UPI Payment</Label>
                      </div>
                      <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${paymentMethod === 'cod' ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-muted/50'}`}>
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">Cash on Delivery</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "upi" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 space-y-4"
                      >
                        <div className="text-center p-4 bg-muted/30 rounded-2xl">
                          <img 
                            src={paymentQR} 
                            alt="UPI Payment QR Code" 
                            className="mx-auto w-48 h-48 object-contain rounded-xl shadow-lg"
                          />
                          <p className="text-sm text-muted-foreground mt-3">
                            Scan this QR code to make payment
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="utr" className="text-sm font-medium">UTR Number *</Label>
                          <Input 
                            id="utr" 
                            placeholder="Enter 12-digit UTR number"
                            value={formData.utrNumber}
                            onChange={(e) => setFormData({...formData, utrNumber: e.target.value})}
                            className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Upload Payment Screenshot *</Label>
                          <div className="mt-2">
                            {paymentProofPreview ? (
                              <div className="relative">
                                <img 
                                  src={paymentProofPreview} 
                                  alt="Payment proof" 
                                  className="w-full h-48 object-cover rounded-xl"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 rounded-full"
                                  onClick={() => {
                                    setPaymentProof(null);
                                    setPaymentProofPreview('');
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors">
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
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Order Summary */}
              <motion.div variants={staggerItem}>
                <Card className="backdrop-blur-sm bg-card/50 border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-purple-500" />
                      </div>
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-xl">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{item.title}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="border-t border-border/50 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>₹{tax}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t border-border/50 pt-3 mt-3">
                        <span>Total</span>
                        <span className="text-primary">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Secure Badge */}
              <motion.div variants={staggerItem} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Checkout</span>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25" 
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Place Order - ₹${total.toLocaleString()}`
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
