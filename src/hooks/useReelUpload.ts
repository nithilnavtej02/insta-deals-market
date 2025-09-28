import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useReelUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadReel = async (videoFile: File, reelData: {
    title: string;
    description?: string;
    buyLink?: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to upload reels');
      return { error: new Error('User not authenticated') };
    }

    if (!videoFile) {
      toast.error('Please select a video file');
      return { error: new Error('No video file provided') };
    }

    setUploading(true);
    
    try {
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Create a unique filename
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload video to Supabase storage (we'll need to create a reels bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reels')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      // Create thumbnail from first frame (simplified - in real app you'd generate proper thumbnail)
      const thumbnailUrl = publicUrl; // For now, use the video URL as thumbnail

      // Insert reel record
      const { data: reelRecord, error: reelError } = await supabase
        .from('reels')
        .insert({
          admin_id: profile.id, // Using profile ID as admin_id for now
          title: reelData.title,
          description: reelData.description || '',
          video_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          buy_link: reelData.buyLink || '',
          status: 'active'
        })
        .select()
        .single();

      if (reelError) throw reelError;

      toast.success('Reel uploaded successfully!');
      return { data: reelRecord, error: null };
    } catch (error) {
      console.error('Error uploading reel:', error);
      toast.error('Failed to upload reel');
      return { data: null, error };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadReel,
    uploading
  };
}