import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useTypingIndicator(conversationId: string) {
  const { user } = useAuth();
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) setUserProfileId(data.id);
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (!conversationId || !userProfileId) return;

    // Subscribe to typing indicator changes
    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Only show typing if it's not the current user
          const newData = payload.new as any;
          if (newData && newData.user_id !== userProfileId) {
            setIsOtherUserTyping(newData.is_typing);
            
            // Auto-hide after 3 seconds
            if (newData.is_typing) {
              setTimeout(() => setIsOtherUserTyping(false), 3000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userProfileId]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!userProfileId || !conversationId) return;

    await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: userProfileId,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'conversation_id,user_id'
      });
  }, [conversationId, userProfileId]);

  return { isOtherUserTyping, setTyping };
}
