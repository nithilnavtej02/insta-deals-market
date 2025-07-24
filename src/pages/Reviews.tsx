import { ArrowLeft, Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const Reviews = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      id: 1,
      reviewer: "@techbuyer_23",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      comment: "Excellent seller! iPhone was exactly as described and shipped super fast. Highly recommend!",
      product: "iPhone 14 Pro Max",
      date: "2 days ago",
      helpful: 12
    },
    {
      id: 2,
      reviewer: "@gadgetlover",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      comment: "Amazing condition MacBook. Great communication throughout the process. Very trustworthy seller.",
      product: "MacBook Air M2",
      date: "1 week ago",
      helpful: 8
    },
    {
      id: 3,
      reviewer: "@student_buyer",
      avatar: "/api/placeholder/40/40",
      rating: 4,
      comment: "Good deal on the gaming setup. Everything works perfectly. Fast shipping!",
      product: "Gaming Setup",
      date: "2 weeks ago",
      helpful: 5
    },
    {
      id: 4,
      reviewer: "@music_producer",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      comment: "Professional seller with high-quality items. The audio equipment was pristine. Will buy again!",
      product: "Audio Equipment",
      date: "3 weeks ago",
      helpful: 15
    }
  ];

  const averageRating = 4.8;
  const totalReviews = 156;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Reviews</h1>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white p-4 border-b">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold">{averageRating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground">Based on {totalReviews} reviews</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="p-4 space-y-4">
        {reviews.map((review) => (
          <Card 
            key={review.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/product/${review.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback>{review.reviewer.slice(1, 3).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{review.reviewer}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">• {review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-2">{review.comment}</p>
                  <p 
                    className="text-xs text-primary mb-3 cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${review.id}`);
                    }}
                  >
                    Product: {review.product}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reviews;