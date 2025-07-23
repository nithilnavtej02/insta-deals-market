import { ArrowLeft, Heart, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";

const CategoryProducts = () => {
  const navigate = useNavigate();
  const { category } = useParams();

  const products = {
    electronics: [
      {
        id: 1,
        title: "iPhone 14 Pro Max",
        price: "$999",
        originalPrice: "$1199",
        image: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png",
        seller: "@techdealer",
        rating: 4.8,
        reviews: 234,
        location: "New York",
        condition: "Like New",
        description: "Pristine condition iPhone 14 Pro Max with all original accessories"
      },
      {
        id: 2,
        title: "MacBook Air M2",
        price: "$1099",
        originalPrice: "$1299",
        image: "/lovable-uploads/a86d1bac-83d4-497e-a7d5-021edd3da1c7.png",
        seller: "@applereseller",
        rating: 4.9,
        reviews: 156,
        location: "California",
        condition: "Excellent",
        description: "Barely used MacBook Air M2 with warranty remaining"
      }
    ],
    fashion: [
      {
        id: 3,
        title: "Designer Handbag",
        price: "$450",
        originalPrice: "$800",
        image: "/lovable-uploads/7ca162be-1e79-409e-bfbf-704e1e3a247a.png",
        seller: "@fashionista",
        rating: 4.7,
        reviews: 89,
        location: "Paris",
        condition: "Good",
        description: "Authentic designer handbag in great condition"
      },
      {
        id: 4,
        title: "Vintage Leather Jacket",
        price: "$180",
        originalPrice: "$350",
        image: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png",
        seller: "@vintagestyle",
        rating: 4.6,
        reviews: 67,
        location: "London",
        condition: "Vintage",
        description: "Classic 80s leather jacket in excellent condition"
      }
    ],
    "home-&-garden": [
      {
        id: 5,
        title: "Garden Chair Set",
        price: "$299",
        originalPrice: "$450",
        image: "/lovable-uploads/627bffbc-e89a-448f-b60e-ea64469766cc.png",
        seller: "@homedecor",
        rating: 4.5,
        reviews: 45,
        location: "Seattle",
        condition: "Good",
        description: "Beautiful outdoor furniture set for garden"
      }
    ],
    sports: [
      {
        id: 6,
        title: "Tennis Racket",
        price: "$85",
        originalPrice: "$150",
        image: "/lovable-uploads/a86d1bac-83d4-497e-a7d5-021edd3da1c7.png",
        seller: "@sportsgear",
        rating: 4.4,
        reviews: 32,
        location: "Miami",
        condition: "Good",
        description: "Professional tennis racket in great condition"
      }
    ]
  };

  const categoryProducts = products[category as keyof typeof products] || products.electronics;
  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1) || "Electronics";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{categoryName}</h1>
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {categoryProducts.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-40 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                  {product.condition}
                </Badge>
              </div>
              
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-primary">{product.price}</span>
                  <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{product.seller}</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;