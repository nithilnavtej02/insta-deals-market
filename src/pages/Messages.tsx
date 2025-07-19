import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();

  const conversations = [
    {
      id: 1,
      name: "iPhone 14 Pro",
      username: "@techseller_NY",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Is the iPhone still available?",
      time: "2h",
      unread: 2,
      isOnline: true,
      productImage: "/api/placeholder/30/30"
    },
    {
      id: 2,
      name: "Vintage Leather Jacket",
      username: "@vintage_lover",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thanks for the quick response!",
      time: "15m",
      unread: 0,
      isOnline: false,
      productImage: "/api/placeholder/30/30"
    },
    {
      id: 3,
      name: "MacBook Air M2",
      username: "@apple_reseller",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Can we schedule a call?",
      time: "1h",
      unread: 1,
      isOnline: true,
      productImage: "/api/placeholder/30/30"
    },
    {
      id: 4,
      name: "Gaming Chair",
      username: "@gamer_hub",
      avatar: "/api/placeholder/40/40",
      lastMessage: "The chair is in excellent condition",
      time: "3h",
      unread: 0,
      isOnline: false,
      productImage: "/api/placeholder/30/30"
    }
  ];

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
        {conversations.map((conversation) => (
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
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback>{conversation.username.slice(1, 3).toUpperCase()}</AvatarFallback>
                </Avatar>
                {conversation.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                    <p className="text-xs text-primary">{conversation.username}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 text-xs px-1">
                        {conversation.unread}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;