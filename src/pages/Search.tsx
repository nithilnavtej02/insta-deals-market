import { useState } from "react";
import { ArrowLeft, Search as SearchIcon, Filter, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  // Dummy search results
  const searchResults = {
    products: [
      {
        id: 1,
        title: "iPhone 14 Pro Max",
        price: "$899",
        seller: "@tech_deals",
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200",
        category: "Electronics",
        location: "Mumbai",
        time: "2h ago"
      },
      {
        id: 2,
        title: "MacBook Air M2",
        price: "$1200",
        seller: "@laptop_store",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200",
        category: "Electronics",
        location: "Delhi",
        time: "5h ago"
      },
      {
        id: 3,
        title: "Gaming Chair",
        price: "$250",
        seller: "@furniture_hub",
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=200",
        category: "Furniture",
        location: "Bangalore",
        time: "1d ago"
      }
    ],
    sellers: [
      {
        username: "@tech_deals",
        name: "Tech Dealer",
        avatar: "/api/placeholder/40/40",
        followers: "1.2K",
        rating: 4.8,
        verified: true,
        posts: 45
      },
      {
        username: "@laptop_store",
        name: "Laptop Store",
        avatar: "/api/placeholder/40/40",
        followers: "856",
        rating: 4.6,
        verified: true,
        posts: 23
      },
      {
        username: "@furniture_hub",
        name: "Furniture Hub",
        avatar: "/api/placeholder/40/40",
        followers: "2.1K",
        rating: 4.9,
        verified: false,
        posts: 78
      }
    ],
    reels: [
      {
        id: 1,
        title: "iPhone Unboxing",
        seller: "@tech_deals",
        thumbnail: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200",
        views: "2.1K",
        likes: "234"
      },
      {
        id: 2,
        title: "Gaming Setup Tour",
        seller: "@pro_gamer",
        thumbnail: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200",
        views: "5.8K",
        likes: "456"
      }
    ]
  };

  const filteredResults = {
    products: searchResults.products.filter(product => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    sellers: searchResults.sellers.filter(seller =>
      seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    reels: searchResults.reels.filter(reel =>
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.seller.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/filters')}
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search Tabs */}
      <div className="px-4 py-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Sellers
            </TabsTrigger>
            <TabsTrigger value="reels">Reels</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4">
            <div className="space-y-3">
              {filteredResults.products.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{product.title}</h3>
                        <p className="text-lg font-bold text-primary mb-1">{product.price}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{product.seller}</p>
                          <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.location} • {product.time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredResults.products.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sellers Tab */}
          <TabsContent value="sellers" className="mt-4">
            <div className="space-y-3">
              {filteredResults.sellers.map((seller) => (
                <Card 
                  key={seller.username}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/profile/${seller.username}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={seller.avatar} />
                        <AvatarFallback>{seller.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{seller.name}</h3>
                          {seller.verified && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Verified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{seller.username}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{seller.followers} followers</span>
                          <span>⭐ {seller.rating}</span>
                          <span>{seller.posts} posts</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredResults.sellers.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No sellers found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reels Tab */}
          <TabsContent value="reels" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {filteredResults.reels.map((reel) => (
                <Card 
                  key={reel.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/reels?id=${reel.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={reel.thumbnail}
                        alt={reel.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-sm font-semibold truncate">{reel.title}</h3>
                        <p className="text-white/80 text-xs">{reel.seller}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{reel.views} views</span>
                        <span>{reel.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredResults.reels.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reels found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;