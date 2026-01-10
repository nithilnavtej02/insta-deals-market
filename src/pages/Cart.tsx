import React from "react";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import BottomNavigation from "@/components/BottomNavigation";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { 
    cartItems, 
    loading, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">You need to sign in to view your cart.</p>
            <Button onClick={() => navigate('/auth')} size="lg" className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-32">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">My Cart</h1>
                <p className="text-xs text-muted-foreground">{getCartItemCount()} items</p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Discover amazing products</p>
              <Button onClick={() => navigate('/home')} className="rounded-full px-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-3 p-3">
                      <img
                        src={item.products?.images?.[0] || "/placeholder.svg"}
                        alt={item.products?.title}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.products?.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          by {item.products?.profiles?.display_name || item.products?.profiles?.username}
                        </p>
                        <p className="text-lg font-bold text-primary">₹{item.products?.price?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between px-3 pb-3">
                      <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Bottom Summary */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-t p-4 z-40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">₹{getCartTotal().toLocaleString()}</span>
            </div>
            <Button className="w-full h-12 rounded-xl text-base font-semibold" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        )}

        <BottomNavigation />
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
              <p className="text-sm text-muted-foreground">{getCartItemCount()} items in your cart</p>
            </div>
          </div>
          {cartItems.length > 0 && (
            <Button variant="outline" onClick={clearCart} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Clear Cart
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Start exploring our collection and add items you love!</p>
            <Button onClick={() => navigate('/home')} size="lg" className="rounded-full px-10">
              <Sparkles className="h-5 w-5 mr-2" />
              Discover Products
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex gap-4 p-4">
                      <img
                        src={item.products?.images?.[0] || "/placeholder.svg"}
                        alt={item.products?.title}
                        className="w-32 h-32 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{item.products?.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Sold by {item.products?.profiles?.display_name || item.products?.profiles?.username}
                        </p>
                        <p className="text-2xl font-bold text-primary mb-4">₹{item.products?.price?.toLocaleString()}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-muted rounded-full p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full hover:bg-background"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full hover:bg-background"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({getCartItemCount()} items)</span>
                      <span>₹{getCartTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-green-500">Free</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">₹{getCartTotal().toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full h-12 text-base font-semibold rounded-xl" asChild>
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Cart;