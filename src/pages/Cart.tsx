import { useEffect } from "react";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart();

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    const { error } = await updateQuantity(cartItemId, newQuantity);
    if (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    const { error } = await removeFromCart(cartItemId);
    if (error) {
      toast.error('Failed to remove item');
    } else {
      toast.success('Item removed from cart');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.products?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading cart...</p>
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
          <h1 className="text-xl font-semibold">Shopping Cart</h1>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center p-6">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to get started</p>
          <Button onClick={() => navigate('/home')}>Continue Shopping</Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="p-4 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.products?.images?.[0] || '/placeholder.svg'}
                        alt={item.products?.title || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.products?.title}</h3>
                        <p className="text-sm text-muted-foreground">by @{item.products?.profiles?.username}</p>
                        <p className="text-lg font-bold text-primary">${item.products?.price}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="sticky bottom-0 bg-background border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total: ${total}</span>
              <span className="text-sm text-muted-foreground">{cartItems.length} items</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate('/home')}>
                Continue Shopping
              </Button>
              <Button onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;