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
      // Get or create user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      let profileId = profile?.id as string | undefined;

      if (!profileId) {
        const username = (user as any).email ? (user as any).email.split('@')[0] : `user_${user.id.slice(0,8)}`;
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: (user as any).email ?? null,
            username
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        profileId = newProfile.id;
      }

      // Create a unique filename
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload video to Supabase storage (we'll need to create a reels bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reels')
        .upload(fileName, videoFile, { contentType: videoFile.type || 'video/mp4', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL for video
      const { data: { publicUrl: videoPublicUrl } } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      // Generate a thumbnail from the first frame and upload it
      const generateThumbnail = (file: File) => new Promise<Blob>((resolve, reject) => {
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.onloadeddata = () => {
          try {
            videoEl.currentTime = Math.min(0.1, videoEl.duration || 0.1);
          } catch {
            // ignore seek errors
          }
        };
        videoEl.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth || 720;
          canvas.height = videoEl.videoHeight || 1280;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create thumbnail'));
          }, 'image/png');
          URL.revokeObjectURL(videoEl.src);
        };
        videoEl.onerror = () => reject(new Error('Failed to load video for thumbnail'));
        videoEl.src = URL.createObjectURL(file);
      });

      let thumbnailUrl = videoPublicUrl;
      try {
        const thumbBlob = await generateThumbnail(videoFile);
        const thumbName = `${fileName.replace(/\.[^/.]+$/, '')}.png`;
        const { error: thumbError } = await supabase.storage
          .from('reels')
          .upload(thumbName, thumbBlob, { contentType: 'image/png', upsert: true });
        if (!thumbError) {
          const { data: { publicUrl: publicThumbUrl } } = supabase.storage
            .from('reels')
            .getPublicUrl(thumbName);
          thumbnailUrl = publicThumbUrl;
        }
      } catch (thumbErr) {
        console.warn('Thumbnail generation failed, falling back to video URL', thumbErr);
      }

      // Insert reel record
      const { data: reelRecord, error: reelError } = await supabase
        .from('reels')
        .insert({
          admin_id: profileId, // Using profile ID as admin_id for now
          title: reelData.title,
          description: reelData.description || '',
          video_url: videoPublicUrl,
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