import { ArrowLeft, Send, Image as ImageIcon, Video, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPresence } from "@/components/UserPresence";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { TypingIndicator } from "@/components/TypingIndicator";
import { getRandomAvatarEmoji } from "@/utils/randomStats";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'video' | 'product';
  image_url: string | null;
  read_at: string | null;
  created_at: string;
}

interface OtherUser {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Chat = () => {
  const navigate = useNavigate();
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOnline: otherUserOnline, lastSeen: otherUserLastSeen } = useUserPresence(otherUser?.user_id || '');
  const { isOtherUserTyping, setTyping } = useTypingIndicator(conversationId || '');

  useEffect(() => {
    if (!conversationId || !user) {
      setLoading(false);
      return;
    }

    loadConversation();
    const cleanup = setupRealtimeSubscription();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async () => {
    if (!conversationId || !user) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        toast({
          title: "Error",
          description: "Unable to load your profile",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setUserProfileId(profile.id);

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        console.error('Conversation error:', convError);
        toast({
          title: "Conversation not found",
          description: "This conversation doesn't exist or you don't have access to it",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const otherParticipantId = conversation.participant_1 === profile.id
        ? conversation.participant_2
        : conversation.participant_1;

      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('id, user_id, username, display_name, avatar_url')
        .eq('id', otherParticipantId)
        .single();

      if (otherProfile) {
        setOtherUser(otherProfile);
      }

      await loadMessages(profile.id);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadMessages = async (profileId: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages = (data || []).map(msg => ({
        ...msg,
        message_type: (msg.message_type || 'text') as 'text' | 'image' | 'product'
      })) as Message[];

      setMessages(typedMessages);

      // Mark unread messages as read
      const unreadMessages = typedMessages.filter(
        msg => !msg.read_at && msg.sender_id !== profileId
      );

      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(msg => msg.id));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            const typedMsg: Message = {
              ...newMsg,
              message_type: (newMsg.message_type || 'text') as 'text' | 'image' | 'product'
            };
            
            setMessages(prev => {
              // Check if message already exists to avoid duplicates
              if (prev.some(m => m.id === typedMsg.id)) return prev;
              return [...prev, typedMsg];
            });
            
            // Mark as read if from other user
            if (userProfileId && typedMsg.sender_id !== userProfileId) {
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', typedMsg.id)
                .then();
            }
          } else if (payload.eventType === 'UPDATE') {
            // Handle read receipt updates
            const updatedMsg = payload.new as any;
            setMessages(prev => 
              prev.map(m => m.id === updatedMsg.id ? { ...m, read_at: updatedMsg.read_at } : m)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !imageFile) || !otherUser || !user || !userProfileId || sending) return;

    setSending(true);
    const messageText = message.trim();
    
    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: conversationId!,
      sender_id: userProfileId,
      receiver_id: otherUser.id,
      content: messageText || null,
      message_type: imageFile ? 'image' : 'text',
      image_url: imagePreview,
      read_at: null,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setMessage("");
    
    try {
      let messageContent = messageText;
      let messageType: 'text' | 'image' | 'video' = 'text';
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const isVideo = imageFile.type.startsWith('video/');
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        messageContent = publicUrl;
        messageType = isVideo ? 'video' : 'image';
      }

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userProfileId,
          receiver_id: otherUser.id,
          content: messageContent,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(m => m.id === tempId ? { ...newMessage, message_type: messageType } as Message : m)
      );

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      setImageFile(null);
      setImagePreview(null);
      setTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessage(messageText); // Restore message
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      setTyping(true);
      setTimeout(() => setTyping(false), 3000);
    } else {
      setTyping(false);
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
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
        <p className="text-muted-foreground mb-4 text-center">
          This conversation doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => navigate('/messages')}>Go to Messages</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/u/${otherUser.username}`)}>
              <UserPresence userId={otherUser.user_id}>
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={otherUser.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {otherUser.avatar_url ? 
                      otherUser.username?.slice(0, 2).toUpperCase() : 
                      getRandomAvatarEmoji(otherUser.username || 'user')
                    }
                  </AvatarFallback>
                </Avatar>
              </UserPresence>
              <div>
                <h2 className="font-semibold text-sm">{otherUser.display_name || otherUser.username || 'User'}</h2>
                <p className="text-xs text-muted-foreground">
                  {isOtherUserTyping ? (
                    <span className="text-primary">typing...</span>
                  ) : otherUserOnline ? (
                    <span className="text-green-500">● Online</span>
                  ) : otherUserLastSeen ? (
                    `Last seen ${new Date(otherUserLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  ) : (
                    `@${otherUser.username || 'unknown'}`
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMyMessage = userProfileId && msg.sender_id === userProfileId;
          return (
            <div key={msg.id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                isMyMessage 
                  ? "bg-primary text-primary-foreground rounded-br-sm" 
                  : "bg-card rounded-bl-sm"
              }`}>
                {msg.message_type === 'image' ? (
                  <img 
                    src={msg.content || ''} 
                    alt="Shared image" 
                    className="rounded-lg max-w-full h-auto max-h-64"
                  />
                ) : msg.message_type === 'video' ? (
                  <video 
                    src={msg.content || ''} 
                    controls
                    className="rounded-lg max-w-full h-auto max-h-64"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                <div className={`flex items-center gap-1 text-[10px] mt-1 ${
                  isMyMessage ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground'
                }`}>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMyMessage && (
                    <span className="ml-1">
                      {msg.read_at ? (
                        <CheckCheck className="h-3 w-3 text-blue-400" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isOtherUserTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t p-4">
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border" />
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              ×
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input 
            value={message} 
            onChange={handleInputChange} 
            onKeyPress={handleKeyPress}
            placeholder="Type a message..." 
            className="flex-1 rounded-full"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={(!message.trim() && !imageFile) || sending}
            size="icon"
            className="flex-shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
