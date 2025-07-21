import { useState } from "react";
import { ArrowLeft, Heart, Share, MessageCircle, Phone, Video, Star, MapPin, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);

  // Dummy product data - different products based on id
  const products = {
    "1": {
      id: "1",
      title: "iPhone 14 Pro Max",
      price: "$899",
      originalPrice: "$1099",
      description: "Latest iPhone in pristine condition with all original accessories and warranty. No scratches, works perfectly. Includes original box, charger, and earphones.",
      seller: {
        name: "Tech Dealer",
        username: "tech_deals",
        avatar: "/api/placeholder/40/40",
        rating: 4.8,
        reviewCount: 156,
        verified: true,
        joinedDate: "Jan 2023",
        location: "Mumbai, India",
        accountCreated: "January 15, 2023"
      },
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400",
        "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400"
      ],
      category: "Electronics",
      condition: "Like New",
      postedDate: "2 hours ago",
      views: 234,
      likes: 45,
      specifications: [
        { label: "Storage", value: "256GB" },
        { label: "Color", value: "Deep Purple" },
        { label: "Battery Health", value: "100%" },
        { label: "Network", value: "Unlocked" }
      ]
    },
    "2": {
      id: "2",
      title: "MacBook Pro M2",
      price: "$1799",
      originalPrice: "$2199",
      description: "Powerful MacBook Pro with M2 chip, perfect for professional work. Excellent condition with minimal usage. Includes original charger and documentation.",
      seller: {
        name: "Apple Expert",
        username: "apple_expert",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
        reviewCount: 203,
        verified: true,
        joinedDate: "Dec 2022",
        location: "Delhi, India",
        accountCreated: "December 10, 2022"
      },
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
      ],
      category: "Electronics",
      condition: "Excellent",
      postedDate: "5 hours ago",
      views: 189,
      likes: 67,
      specifications: [
        { label: "Processor", value: "Apple M2" },
        { label: "RAM", value: "16GB" },
        { label: "Storage", value: "512GB SSD" },
        { label: "Screen", value: "13.3 inch Retina" }
      ]
    },
    "3": {
      id: "3",
      title: "Gaming Chair",
      price: "$299",
      originalPrice: "$399",
      description: "Ergonomic gaming chair with RGB lighting. Very comfortable for long gaming sessions. Like new condition, barely used.",
      seller: {
        name: "Gamer Pro",
        username: "gamer_pro",
        avatar: "/api/placeholder/40/40",
        rating: 4.6,
        reviewCount: 89,
        verified: false,
        joinedDate: "Mar 2023",
        location: "Bangalore, India",
        accountCreated: "March 5, 2023"
      },
      images: [
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
      ],
      category: "Furniture",
      condition: "Like New",
      postedDate: "1 day ago",
      views: 156,
      likes: 32,
      specifications: [
        { label: "Material", value: "Leather" },
        { label: "Color", value: "Black/Red" },
        { label: "Features", value: "RGB, Adjustable" },
        { label: "Weight Capacity", value: "120kg" }
      ]
    }
  };

  const product = products[id as keyof typeof products] || products["1"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/share')}
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-80 bg-muted">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          1 / {product.images.length}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <Badge variant="secondary">{product.condition}</Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-bold text-primary">{product.price}</span>
            <span className="text-lg text-muted-foreground line-through">{product.originalPrice}</span>
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">18% OFF</Badge>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Specifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Specifications</h3>
            <div className="space-y-2">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-muted-foreground">{spec.label}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seller Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={product.seller.avatar} />
                  <AvatarFallback>{product.seller.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{product.seller.name}</h3>
                    {product.seller.verified && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 py-0 text-xs bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-green-600" />
                              Verified Seller
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              This seller is genuine and can be trusted. They have been verified by our team.
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Account Created:</span>
                                <span className="text-sm text-muted-foreground">{product.seller.accountCreated}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Location:</span>
                                <span className="text-sm text-muted-foreground">{product.seller.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Rating:</span>
                                <span className="text-sm text-muted-foreground">{product.seller.rating}/5.0 ({product.seller.reviewCount} reviews)</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{product.seller.username}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{product.seller.rating} ({product.seller.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{product.seller.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {product.seller.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/profile/${product.seller.username}`)}
              >
                View Profile
              </Button>
            </div>

            {/* Contact Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate(`/chat/${product.seller.username}`)}
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold">{product.views}</p>
            <p className="text-sm text-muted-foreground">Views</p>
          </div>
          <div>
            <p className="text-lg font-bold">{product.likes}</p>
            <p className="text-sm text-muted-foreground">Likes</p>
          </div>
          <div>
            <p className="text-lg font-bold">{product.postedDate}</p>
            <p className="text-sm text-muted-foreground">Posted</p>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg">
            Add to Cart
          </Button>
          <Button size="lg">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;