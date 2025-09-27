import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, CreditCard, Truck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, getCartTotal } = useCart();
  const { fetchProductById } = useProducts();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    const productId = searchParams.get('product');
    
    if (productId) {
      // Single product purchase
      const product = await fetchProductById(productId);
      if (product) {
        setOrderItems([{
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          seller: product.profiles?.username || 'Unknown Seller'
        }]);
      }
    } else if (cartItems.length > 0) {
      // Cart checkout
      const items = cartItems.map(item => ({
        id: item.product_id,
        title: item.products?.title || 'Unknown Product',
        price: item.products?.price || 0,
        quantity: item.quantity,
        seller: item.products?.profiles?.username || 'Unknown Seller'
      }));
      setOrderItems(items);
    } else {
      // No items to checkout
      navigate('/cart');
      return;
    }
    
    setLoading(false);
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = () => {
    setIsOrdered(true);
    setTimeout(() => {
      navigate('/home');
    }, 3000);
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
          <p className="text-muted-foreground mb-4">You will receive confirmation details soon.</p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Checkout</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
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
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Sujatha" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Reddy" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" defaultValue="123 Main Street" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" defaultValue="Mumbai" />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code</Label>
                <Input id="postal" defaultValue="400001" />
              </div>
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
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi">UPI</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
            </RadioGroup>

            {paymentMethod === "card" && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="mt-4">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input id="upiId" placeholder="yourname@upi" />
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

        {/* Place Order Button */}
        <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
          Place Order - ${total}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;