import { ArrowLeft, Send, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, type Message } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { UserPresence } from "@/components/UserPresence";


const Chat = () => {
  const navigate = useNavigate();
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const { sendMessage } = useMessages();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversationData();
      fetchMessages();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversationData = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userProfile) {
        setUserProfileId(userProfile.id);
      }

      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conversation && userProfile) {
        const otherParticipantId = conversation.participant_1 === userProfile.id 
          ? conversation.participant_2 
          : conversation.participant_1;

        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', otherParticipantId)
          .single();

        setOtherUser(otherProfile);
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !otherUser || !user) return;

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', otherUser.username)
        .single();

      if (userProfile && otherProfile) {
        const result = await sendMessage(otherProfile.id, message.trim());
        
        if (result.error) {
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
        } else {
          setMessage("");
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/u/${otherUser.username}`)}>
              <UserPresence userId={otherUser.user_id}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={otherUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.username}`} />
                  <AvatarFallback>{otherUser.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </UserPresence>
              <div>
                <h2 className="font-semibold text-sm">{otherUser.display_name || otherUser.username}</h2>
                <p className="text-xs text-primary">@{otherUser.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMyMessage = userProfileId && msg.sender_id === userProfileId;
          return (
            <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                isMyMessage ? "bg-primary text-white" : "bg-muted"
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white border-t p-4">
        <div className="flex items-center gap-2">
          <Input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={handleKeyPress}
            placeholder="Type a message..." 
            className="flex-1" 
          />
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default Chat;