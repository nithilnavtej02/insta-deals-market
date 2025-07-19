import { useState } from "react";
import { Search, Bell, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/BottomNavigation";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Home", icon: "🏠", color: "bg-blue-100" },
    { name: "Sports", icon: "⚽", color: "bg-green-100" },
    { name: "Books", icon: "📚", color: "bg-red-100" },
    { name: "Cars", icon: "🚗", color: "bg-orange-100" },
  ];

  const products = [
    {
      id: 1,
      title: "iPhone 14 Pro - Excellent Condition",
      price: "$899",
      location: "New York, NY",
      seller: "@techseller_NY",
      time: "2h",
      image: "/api/placeholder/300/200"
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
          <Button variant="ghost" size="icon-sm">
            <Bell className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Hi johndoe! 👋</h1>
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
          <Button variant="link" className="text-primary">See All</Button>
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
                <div className="aspect-video bg-muted rounded-t-lg mb-3"></div>
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