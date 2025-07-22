import { useState } from "react";
import { ArrowLeft, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const ReelComments = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const comments = [
    {
      id: 1,
      user: "@fashionista_23",
      avatar: "/api/placeholder/32/32",
      comment: "This is absolutely gorgeous! 😍",
      likes: 45,
      time: "2h",
      isLiked: false
    },
    {
      id: 2,
      user: "@luxury_collector",
      avatar: "/api/placeholder/32/32",
      comment: "Is this still available? Been looking for this exact model!",
      likes: 12,
      time: "1h",
      isLiked: true
    },
    {
      id: 3,
      user: "@style_guru",
      avatar: "/api/placeholder/32/32",
      comment: "The condition looks amazing! How's the authenticity verified?",
      likes: 8,
      time: "45m",
      isLiked: false
    },
    {
      id: 4,
      user: "@bag_enthusiast",
      avatar: "/api/placeholder/32/32",
      comment: "Price seems fair for the condition 👌",
      likes: 23,
      time: "30m",
      isLiked: false
    },
    {
      id: 5,
      user: "@designer_deals",
      avatar: "/api/placeholder/32/32",
      comment: "Can you share more photos of the interior?",
      likes: 6,
      time: "15m",
      isLiked: false
    }
  ];

  const handleSendComment = () => {
    if (newComment.trim()) {
      // Handle sending comment
      setNewComment("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Comments</h1>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={comment.avatar} />
              <AvatarFallback>{comment.user.slice(1, 3).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="bg-muted rounded-lg p-3">
                <p 
                  className="font-medium text-sm text-primary mb-1 cursor-pointer hover:underline"
                  onClick={() => navigate(`/seller/${comment.user.slice(1)}`)}
                >
                  {comment.user}
                </p>
                <p className="text-sm">{comment.comment}</p>
              </div>
              
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground">{comment.time}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs hover:bg-transparent"
                  onClick={() => {
                    setLikedComments(prev => 
                      prev.includes(comment.id) 
                        ? prev.filter(id => id !== comment.id)
                        : [...prev, comment.id]
                    );
                  }}
                >
                  <Heart className={cn("h-3 w-3 mr-1", 
                    (comment.isLiked || likedComments.includes(comment.id)) && "fill-red-500 text-red-500"
                  )} />
                  {comment.likes + (likedComments.includes(comment.id) ? 1 : 0)}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 text-xs hover:bg-transparent"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  Reply
                </Button>
              </div>
              
              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3 ml-8">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={`Reply to ${comment.user}...`}
                      className="text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setReplyingTo(null);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => setReplyingTo(null)}>
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback>SU</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <Button 
              size="icon" 
              onClick={handleSendComment}
              disabled={!newComment.trim()}
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelComments;