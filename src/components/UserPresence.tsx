import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPresenceProps {
  userId: string;
  children?: React.ReactNode;
  showDot?: boolean;
}

export function UserPresence({ userId, children, showDot = true }: UserPresenceProps) {
  const { user } = useAuth();
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
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track presence if this is the current user
        if (user?.id === userId) {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, user]);

  if (children) {
    return (
      <div className="relative">
        {children}
        {showDot && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`} />
      <span>
        {isOnline ? 'Online' : lastSeen ? 'Last seen recently' : 'Offline'}
      </span>
    </div>
  );
}