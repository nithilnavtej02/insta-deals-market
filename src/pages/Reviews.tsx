import { motion } from "framer-motion";
import { ArrowLeft, Star, ThumbsUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageTransition, staggerContainer, staggerItem } from "@/components/PageTransition";

const Reviews = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="flex items-center gap-3 p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full bg-muted/50 hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Reviews</h1>
              <p className="text-xs text-muted-foreground">{totalReviews} total reviews</p>
            </div>
          </div>
        </div>

        {/* Rating Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">{averageRating}</span>
                    <span className="text-xl text-white/70">/5</span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(averageRating)
                            ? "text-yellow-300 fill-yellow-300"
                            : "text-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm">Based on {totalReviews} reviews</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews List */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="p-4 space-y-4"
        >
          {reviews.map((review) => (
            <motion.div key={review.id} variants={staggerItem}>
              <Card 
                className="border-0 shadow-lg bg-card/80 backdrop-blur-sm rounded-2xl cursor-pointer hover:shadow-xl transition-all overflow-hidden"
                onClick={() => navigate(`/product/${review.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold">
                        {review.reviewer.slice(1, 3).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-semibold text-sm">{review.reviewer}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">• {review.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>
                      
                      <div 
                        className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${review.id}`);
                        }}
                      >
                        {review.product}
                      </div>
                      
                      <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-3 rounded-full hover:bg-primary/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">Helpful ({review.helpful})</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Reviews;
