import { useState } from "react";
import { ArrowLeft, Star, MapPin, Calendar, MessageCircle, Phone, Video, Shield, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";

const SellerProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Dummy seller data based on username
  const sellers = {
    "tech_deals": {
      name: "Tech Dealer",
      username: "tech_deals",
      avatar: "/api/placeholder/80/80",
      rating: 4.8,
      reviewCount: 156,
      verified: true,
      joinedDate: "Jan 2023",
      location: "Mumbai, India",
      accountCreated: "January 15, 2023",
      bio: "Professional tech dealer with 5+ years experience. Specializing in latest smartphones, laptops, and accessories.",
      followers: 1234,
      following: 89,
      products: [
        {
          id: "1",
          title: "iPhone 14 Pro Max",
          price: "$899",
          image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300",
          sold: false
        },
        {
          id: "4",
          title: "MacBook Pro M2",
          price: "$1799",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
          sold: true
        }
      ],
      reviews: [
        {
          id: 1,
          reviewer: "John Doe",
          rating: 5,
          comment: "Great seller, product exactly as described!",
          date: "2 days ago"
        }
      ]
    },
    "apple_expert": {
      name: "Apple Expert",
      username: "apple_expert",
      avatar: "/api/placeholder/80/80",
      rating: 4.9,
      reviewCount: 203,
      verified: true,
      joinedDate: "Dec 2022",
      location: "Delhi, India",
      accountCreated: "December 10, 2022",
      bio: "Apple certified expert. Selling genuine Apple products with warranty.",
      followers: 2100,
      following: 45,
      products: [
        {
          id: "2",
          title: "MacBook Pro M2",
          price: "$1799",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
          sold: false
        }
      ],
      reviews: [
        {
          id: 1,
          reviewer: "Sarah Smith",
          rating: 5,
          comment: "Excellent service and genuine products!",
          date: "1 week ago"
        }
      ]
    }
  };

  const seller = sellers[username as keyof typeof sellers] || sellers["tech_deals"];

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
        <h1 className="text-lg font-semibold">{seller.name}</h1>
        <Button
          variant="ghost"
          size="icon"
        >
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={seller.avatar} />
            <AvatarFallback>{seller.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{seller.name}</h2>
              {seller.verified && (
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
                          <span className="text-sm text-muted-foreground">{seller.accountCreated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Location:</span>
                          <span className="text-sm text-muted-foreground">{seller.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Rating:</span>
                          <span className="text-sm text-muted-foreground">{seller.rating}/5.0 ({seller.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <p className="text-muted-foreground text-sm">@{seller.username}</p>
            <div className="flex items-center gap-1 text-sm mt-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{seller.rating} ({seller.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{seller.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {seller.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-muted-foreground">{seller.bio}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold">{seller.products.length}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
          <div>
            <p className="text-xl font-bold">{seller.followers}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold">{seller.following}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant={isFollowing ? "outline" : "default"}
            onClick={() => setIsFollowing(!isFollowing)}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/chat/${seller.username}`)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Video className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {seller.products.map((product) => (
                <Card key={product.id} className="cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <CardContent className="p-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-1">{product.title}</h4>
                      <p className="text-primary font-bold">{product.price}</p>
                      {product.sold && (
                        <Badge variant="secondary" className="mt-1 text-xs">Sold</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            {seller.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{review.reviewer[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{review.reviewer}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerProfile;