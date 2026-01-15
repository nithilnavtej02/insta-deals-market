import { motion } from "framer-motion";
import { ArrowLeft, Send, Image as ImageIcon, Check, CheckCheck, MoreVertical, Phone, Video } from "lucide-react";
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
import { PageTransition } from "@/components/PageTransition";
import { ChatSkeleton } from "@/components/skeletons/ChatSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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
              if (prev.some(m => m.id === typedMsg.id)) return prev;
              return [...prev, typedMsg];
            });
            
            if (userProfileId && typedMsg.sender_id !== userProfileId) {
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', typedMsg.id)
                .then();
            }
          } else if (payload.eventType === 'UPDATE') {
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
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setMessage(messageText);
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

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].created_at).toDateString();
    const prevDate = new Date(messages[index - 1].created_at).toDateString();
    return currentDate !== prevDate;
  };

  if (loading) {
    return <ChatSkeleton />;
  }

  if (!otherUser) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-br from-background via-background to-primary/5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center backdrop-blur-xl bg-card/50 rounded-3xl p-8 shadow-2xl border border-border/50"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">Conversation not found</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              This conversation doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/messages')} className="rounded-full px-8 shadow-lg shadow-primary/25">
              Go to Messages
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="h-screen">
      <div className={`flex flex-col h-full ${isMobile ? 'bg-background' : 'bg-gradient-to-br from-background via-background to-primary/5'}`}>
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`backdrop-blur-xl border-b border-border/50 shadow-sm ${
            isMobile 
              ? 'bg-background/95 px-3 py-2.5' 
              : 'bg-card/80 px-6 py-4'
          }`}
        >
          <div className={`flex items-center justify-between ${!isMobile && 'max-w-4xl mx-auto'}`}>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className={`rounded-full ${isMobile ? 'h-9 w-9' : 'h-10 w-10 bg-muted/50 hover:bg-muted'}`}
              >
                <ArrowLeft className={isMobile ? "h-5 w-5" : "h-5 w-5"} />
              </Button>
              <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={() => navigate(`/u/${otherUser.username}`)}
              >
                <UserPresence userId={otherUser.user_id}>
                  <Avatar className={`ring-2 ring-primary/20 shadow-md transition-transform group-hover:scale-105 ${
                    isMobile ? 'w-10 h-10' : 'w-12 h-12'
                  }`}>
                    <AvatarImage src={otherUser.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-semibold">
                      {otherUser.avatar_url ? 
                        otherUser.username?.slice(0, 2).toUpperCase() : 
                        getRandomAvatarEmoji(otherUser.username || 'user')
                      }
                    </AvatarFallback>
                  </Avatar>
                </UserPresence>
                <div className="flex-1 min-w-0">
                  <h2 className={`font-semibold truncate group-hover:text-primary transition-colors ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>
                    {otherUser.display_name || otherUser.username || 'Unknown User'}
                  </h2>
                  <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {isOtherUserTyping ? (
                      <span className="text-primary font-medium animate-pulse">typing...</span>
                    ) : otherUserOnline ? (
                      <span className="text-green-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Active now
                      </span>
                    ) : otherUserLastSeen ? (
                      `Active ${new Date(otherUserLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    ) : (
                      `@${otherUser.username || 'unknown'}`
                    )}
                  </p>
                </div>
              </div>
            </div>
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-muted">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className={!isMobile ? 'max-w-4xl mx-auto space-y-4' : 'space-y-3'}>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className={`rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6 ${
                  isMobile ? 'w-20 h-20' : 'w-24 h-24'
                }`}>
                  <span className={isMobile ? 'text-3xl' : 'text-4xl'}>👋</span>
                </div>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                  No messages yet. Start the conversation!
                </p>
              </motion.div>
            )}
            
            {messages.map((msg, index) => {
              const isMyMessage = userProfileId && msg.sender_id === userProfileId;
              const showDateSeparator = shouldShowDateSeparator(index);
              
              return (
                <div key={msg.id}>
                  {showDateSeparator && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center my-6"
                    >
                      <div className={`px-4 py-1.5 rounded-full bg-muted/50 backdrop-blur-sm ${
                        isMobile ? 'text-xs' : 'text-sm'
                      } text-muted-foreground font-medium`}>
                        {formatDateSeparator(msg.created_at)}
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] ${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'}`}>
                      <div className={`px-4 py-3 shadow-sm ${
                        isMyMessage 
                          ? `bg-primary text-primary-foreground ${isMobile ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-br-sm'}` 
                          : `bg-card backdrop-blur-sm border border-border/50 ${isMobile ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-bl-sm'}`
                      }`}>
                        {msg.message_type === 'image' ? (
                          <img 
                            src={msg.content || ''} 
                            alt="Shared image" 
                            className={`rounded-xl max-w-full h-auto ${isMobile ? 'max-h-52' : 'max-h-72'}`}
                          />
                        ) : msg.message_type === 'video' ? (
                          <video 
                            src={msg.content || ''} 
                            controls
                            className={`rounded-xl max-w-full h-auto ${isMobile ? 'max-h-52' : 'max-h-72'}`}
                          />
                        ) : (
                          <p className={`whitespace-pre-wrap leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                            {msg.content}
                          </p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'} px-1`}>
                        <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                          {formatMessageTime(msg.created_at)}
                        </span>
                        {isMyMessage && (
                          <span>
                            {msg.read_at ? (
                              <CheckCheck className={`text-blue-500 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            ) : (
                              <Check className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            
            {isOtherUserTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <TypingIndicator />
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`backdrop-blur-xl border-t border-border/50 ${
            isMobile 
              ? 'bg-background/95 p-3' 
              : 'bg-card/80 p-4'
          }`}
        >
          <div className={!isMobile ? 'max-w-4xl mx-auto' : ''}>
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3 relative inline-block"
              >
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className={`rounded-xl border-2 border-primary/20 shadow-lg ${isMobile ? 'h-16' : 'h-24'}`} 
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className={`absolute -top-2 -right-2 rounded-full shadow-lg ${isMobile ? 'h-5 w-5 text-xs' : 'h-6 w-6'}`}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ×
                </Button>
              </motion.div>
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
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-shrink-0 rounded-full hover:bg-muted ${isMobile ? 'h-10 w-10' : 'h-11 w-11'}`}
              >
                <ImageIcon className={isMobile ? 'h-5 w-5' : 'h-5 w-5'} />
              </Button>
              <Input 
                value={message} 
                onChange={handleInputChange} 
                onKeyPress={handleKeyPress}
                placeholder="Type a message..." 
                className={`flex-1 rounded-full bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  isMobile ? 'h-10 text-sm' : 'h-12 text-base'
                }`}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={(!message.trim() && !imageFile) || sending}
                size="icon"
                className={`flex-shrink-0 rounded-full shadow-lg shadow-primary/25 ${isMobile ? 'h-10 w-10' : 'h-11 w-11'}`}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Chat;