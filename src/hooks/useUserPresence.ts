import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserPresence(userId: string) {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const channelName = `presence-${userId}`;
    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setIsOnline(users.length > 0);
      })
      .on('presence', { event: 'join' }, () => {
        setIsOnline(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsOnline(false);
        setLastSeen(new Date().toISOString());
      });

    // Subscribe to the channel
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { isOnline, lastSeen };
}
