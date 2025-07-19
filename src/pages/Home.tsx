import { useState } from "react";
import { Search, Bell, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Electronics", icon: "📱", color: "bg-blue-100" },
    { name: "Fashion", icon: "👗", color: "bg-pink-100" },
    { name: "Home", icon: "🏠", color: "bg-green-100" },
    { name: "Sports", icon: "⚽", color: "bg-orange-100" },
    { name: "Books", icon: "📚", color: "bg-red-100" },
    { name: "Cars", icon: "🚗", color: "bg-yellow-100" },
    { name: "Beauty", icon: "💄", color: "bg-purple-100" },
    { name: "Gaming", icon: "🎮", color: "bg-indigo-100" },
  ];

  const products = [
    {
      id: 1,
      title: "iPhone 14 Pro - Excellent Condition",
      price: "$899",
      location: "New York, NY",
      seller: "@techseller_NY",
      time: "2h",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      title: "MacBook Air M2 - Like New",
      price: "$1,200",
      location: "Los Angeles, CA",
      seller: "@apple_reseller",
      time: "4h",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Gaming Setup Complete",
      price: "$2,500",
      location: "Chicago, IL",
      seller: "@gamer_hub",
      time: "6h",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Vintage Leather Jacket",
      price: "$150",
      location: "Miami, FL",
      seller: "@vintage_lover",
      time: "8h",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
    },
    {
      id: 5,
      title: "Designer Handbag Collection",
      price: "$800",
      location: "San Francisco, CA",
      seller: "@luxury_bags",
      time: "12h",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=200&fit=crop"
    },
    {
      id: 6,
      title: "Professional Camera Kit",
      price: "$1,800",
      location: "Seattle, WA",
      seller: "@photographer_pro",
      time: "14h",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=200&fit=crop"
    },
    {
      id: 7,
      title: "Workout Equipment Set",
      price: "$600",
      location: "Boston, MA",
      seller: "@fitness_gear",
      time: "16h",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=200&fit=crop"
    },
    {
      id: 8,
      title: "Art Collection Pieces",
      price: "$1,500",
      location: "Austin, TX",
      seller: "@art_collector",
      time: "18h",
      image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=300&h=200&fit=crop"
    },
    {
      id: 9,
      title: "Musical Instruments Bundle",
      price: "$950",
      location: "Nashville, TN",
      seller: "@music_maker",
      time: "20h",
      image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=300&h=200&fit=crop"
    },
    {
      id: 10,
      title: "Home Furniture Set",
      price: "$2,200",
      location: "Denver, CO",
      seller: "@home_decorator",
      time: "1d",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">New York, NY</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/notifications")}>
            <Bell className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Hi sujatha! 👋</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-full"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Button variant="link" className="text-primary" onClick={() => navigate("/categories")}>See All</Button>
        </div>
        
        <div className="flex gap-4">
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mb-2`}>
                <span className="text-2xl">{category.icon}</span>
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Products */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Latest Products</h2>
          <Button variant="link" className="text-primary">See All</Button>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="aspect-video w-full object-cover rounded-t-lg mb-3"
                />
                <div className="px-4 pb-4">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{product.price}</p>
                  <p className="text-sm text-muted-foreground mb-1">{product.location}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">{product.seller}</p>
                    <p className="text-sm text-muted-foreground">{product.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;