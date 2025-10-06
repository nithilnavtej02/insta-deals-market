import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useReelComments } from "@/hooks/useReelComments";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const ReelComments = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { comments, loading, addComment } = useReelComments(id || '');
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSendComment = async () => {
    if (newComment.trim()) {
      await addComment(newComment, replyingTo || undefined);
      setNewComment("");
      setReplyingTo(null);
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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={comment.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.profile?.username?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded-lg p-3">
                  <p 
                    className="font-medium text-sm text-primary mb-1 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${comment.profile?.id}`)}
                  >
                    @{comment.profile?.username || 'Unknown'}
                  </p>
                  <p className="text-sm">{comment.content}</p>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
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
                        placeholder={`Reply to @${comment.profile?.username}...`}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendComment();
                          }
                        }}
                      />
                      <Button size="sm" onClick={handleSendComment}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      {user && (
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Input
                placeholder={replyingTo ? "Reply to comment..." : "Add a comment..."}
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
      )}
    </div>
  );
};

export default ReelComments;
