import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles?: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={review.profiles?.avatar_url} />
            <AvatarFallback>
              {review.profiles?.display_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm">
                {review.profiles?.display_name || 'User'}
              </h4>
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
