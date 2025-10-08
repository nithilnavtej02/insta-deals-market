import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'product';
  product_id: string | null;
  image_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_id: string | null;
  updated_at: string;
  created_at: string;
  profiles?: {
    id: string;
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  messages?: {
    content: string | null;
    message_type: string;
    created_at: string;
  };
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get user's profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages:last_message_id (
            content,
            message_type,
            created_at
          )
        `)
        .or(`participant_1.eq.${profile.id},participant_2.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Fetch other participant details for each conversation
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantId = conv.participant_1 === profile.id 
            ? conv.participant_2 
            : conv.participant_1;

          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url')
            .eq('id', otherParticipantId)
            .single();

          return {
            ...conv,
            profiles: otherProfile
          };
        })
      );

      setConversations(conversationsWithProfiles as Conversation[]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverProfileId: string, content: string, messageType: 'text' | 'image' | 'product' = 'text') => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get user's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Create or get conversation
      let conversationId;
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${profile.id},participant_2.eq.${receiverProfileId}),and(participant_1.eq.${receiverProfileId},participant_2.eq.${profile.id})`)
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            participant_1: profile.id,
            participant_2: receiverProfileId
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // Send message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          receiver_id: receiverProfileId,
          content,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message_id: data.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return { data, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
  };

  return {
    conversations,
    loading,
    sendMessage,
    refreshConversations: fetchConversations
  };
}