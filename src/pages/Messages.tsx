import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { UserPresence } from "@/components/UserPresence";
import { getRandomAvatarEmoji } from "@/utils/randomStats";

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-semibold mb-2">Messages</h1>
        <p className="text-muted-foreground text-sm mb-4">Secure & anonymous communication</p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No conversations yet</div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/chat/${conversation.id}`)}
            >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div className="w-8 h-8 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark"></div>
                </div>

                {/* Avatar */}
                <UserPresence userId={conversation.profiles?.user_id}>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conversation.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {conversation.profiles?.avatar_url ? 
                        conversation.profiles?.username?.slice(0, 2).toUpperCase() : 
                        getRandomAvatarEmoji(conversation.profiles?.username || 'user')
                      }
                    </AvatarFallback>
                  </Avatar>
                </UserPresence>

               {/* Content */}
               <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between mb-1">
                   <div>
                     <h3 className="font-medium text-sm truncate">
                       {conversation.profiles?.display_name || conversation.profiles?.username || 'User'}
                     </h3>
                     <p className="text-xs text-primary">@{conversation.profiles?.username || 'unknown'}</p>
                   </div>
                   <div className="flex items-center gap-2 flex-shrink-0">
                     <span className="text-xs text-muted-foreground">{new Date(conversation.updated_at).toLocaleDateString()}</span>
                   </div>
                 </div>
                 <p className="text-sm text-muted-foreground truncate">
                   {conversation.messages?.content || 'No messages yet'}
                 </p>
               </div>
             </div>
           </div>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;