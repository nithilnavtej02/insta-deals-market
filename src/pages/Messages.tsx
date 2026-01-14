import { useState } from "react";
import { Search, MessageSquare, Users, Settings, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { UserPresence } from "@/components/UserPresence";
import { getRandomAvatarEmoji } from "@/utils/randomStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, isToday, isYesterday } from "date-fns";

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const filteredConversations = conversations.filter(conv => {
    const name = conv.profiles?.display_name || conv.profiles?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  // Mobile View - Professional Redesign
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Premium Header with Gradient */}
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                End-to-end encrypted
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white border-0 rounded-2xl shadow-sm placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-5 -mt-3">
          <div className="bg-card rounded-2xl shadow-md border border-border/50 p-4 flex items-center justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{conversations.length}</p>
              <p className="text-xs text-muted-foreground">Chats</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{conversations.filter(c => c.messages).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-center">
              <div className="w-6 h-6 rounded-full bg-green-500 mx-auto flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Online</p>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="px-5 mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Conversations</h2>
          
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No conversations yet</h3>
                <p className="text-sm text-muted-foreground">Start chatting with sellers!</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-card rounded-2xl border border-border/50 p-4 active:scale-[0.98] transition-all duration-200 shadow-sm"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <UserPresence userId={conversation.profiles?.user_id}>
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                        <AvatarImage src={conversation.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white text-lg font-semibold">
                          {conversation.profiles?.avatar_url ? 
                            conversation.profiles?.username?.slice(0, 2).toUpperCase() : 
                            getRandomAvatarEmoji(conversation.profiles?.username || 'user')
                          }
                        </AvatarFallback>
                      </Avatar>
                    </UserPresence>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {conversation.profiles?.display_name || conversation.profiles?.username || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatMessageDate(conversation.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-primary font-medium mb-1">@{conversation.profiles?.username || 'unknown'}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.messages?.content || 'Tap to start chatting'}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop View - Professional Panel Layout
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">Secure & anonymous communication with buyers and sellers</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Stats */}
          <div className="col-span-3 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{conversations.length}</p>
                    <p className="text-xs text-muted-foreground">Total Conversations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{conversations.length}</p>
                    <p className="text-xs text-muted-foreground">Active Chats</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button 
                  onClick={() => navigate('/search')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm font-medium">Find New Sellers</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm font-medium">Message Settings</span>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Main Conversations Panel */}
          <div className="col-span-9">
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-card">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">All Conversations</CardTitle>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50 border-0"
                    />
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-280px)]">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground text-sm">Start browsing products to connect with sellers</p>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map((conversation, index) => (
                      <div key={conversation.id}>
                        <div
                          className="p-5 hover:bg-muted/50 cursor-pointer transition-all duration-200 group"
                          onClick={() => navigate(`/chat/${conversation.id}`)}
                        >
                          <div className="flex items-center gap-4">
                            <UserPresence userId={conversation.profiles?.user_id}>
                              <Avatar className="w-14 h-14 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                <AvatarImage src={conversation.profiles?.avatar_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white text-lg">
                                  {conversation.profiles?.avatar_url ? 
                                    conversation.profiles?.username?.slice(0, 2).toUpperCase() : 
                                    getRandomAvatarEmoji(conversation.profiles?.username || 'user')
                                  }
                                </AvatarFallback>
                              </Avatar>
                            </UserPresence>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {conversation.profiles?.display_name || conversation.profiles?.username || 'Unknown User'}
                                  </h3>
                                  <span className="text-sm text-primary font-medium">
                                    @{conversation.profiles?.username || 'unknown'}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatMessageDate(conversation.updated_at)}
                                </span>
                              </div>
                              <p className="text-muted-foreground truncate pr-8">
                                {conversation.messages?.content || 'No messages yet'}
                              </p>
                            </div>

                            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        {index < filteredConversations.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
