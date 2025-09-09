# Reels Upload Backend Implementation Guide

## Overview
This guide shows how to implement backend functionality for uploading reels with buy button links.

## Backend Components Needed

### 1. Database Migration (Already exists)
The `reels` table is already created with these columns:
- `id` (UUID)
- `title` (TEXT)
- `description` (TEXT)
- `thumbnail_url` (TEXT)
- `video_url` (TEXT)
- `buy_link` (TEXT) - This is where you attach the buy button URL
- `admin_id` (UUID)
- `status` (TEXT)
- `likes`, `comments`, `views` (INT)

### 2. Storage Setup
Configure Supabase storage for video files:

```sql
-- Create storage bucket for reels
INSERT INTO storage.buckets (id, name, public) VALUES ('reels', 'reels', true);

-- Create storage policies for reels
CREATE POLICY "Reels are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reels');

CREATE POLICY "Authenticated users can upload reels" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'reels' 
  AND auth.role() = 'authenticated'
  AND (STORAGE.foldername(name))[1] = auth.uid()::text
);
```

### 3. Edge Function for Reel Upload
Create `supabase/functions/upload-reel/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const buyLink = formData.get('buyLink') as string;
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File;

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get admin profile
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile) {
      throw new Error('Profile not found');
    }

    // Upload video file
    const videoFileName = `${user.id}/${Date.now()}_video.mp4`;
    const { data: videoUpload, error: videoError } = await supabase.storage
      .from('reels')
      .upload(videoFileName, videoFile);

    if (videoError) throw videoError;

    // Upload thumbnail file
    const thumbnailFileName = `${user.id}/${Date.now()}_thumbnail.jpg`;
    const { data: thumbnailUpload, error: thumbnailError } = await supabase.storage
      .from('reels')
      .upload(thumbnailFileName, thumbnailFile);

    if (thumbnailError) throw thumbnailError;

    // Get public URLs
    const { data: videoUrl } = supabase.storage
      .from('reels')
      .getPublicUrl(videoFileName);

    const { data: thumbnailUrl } = supabase.storage
      .from('reels')
      .getPublicUrl(thumbnailFileName);

    // Create reel record
    const { data: reel, error: reelError } = await supabase
      .from('reels')
      .insert({
        title,
        description,
        video_url: videoUrl.publicUrl,
        thumbnail_url: thumbnailUrl.publicUrl,
        buy_link: buyLink,
        admin_id: adminProfile.id,
        status: 'active'
      })
      .select()
      .single();

    if (reelError) throw reelError;

    return new Response(JSON.stringify({ success: true, reel }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error uploading reel:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### 4. Frontend Integration
Update `AdminReels.tsx` to use the backend:

```typescript
const handleUploadReel = async () => {
  if (!newReel.title || !newReel.video || !newReel.thumbnail) {
    toast({
      title: "Error",
      description: "Please fill all required fields",
      variant: "destructive",
    });
    return;
  }

  setUploading(true);
  
  try {
    const formData = new FormData();
    formData.append('title', newReel.title);
    formData.append('description', newReel.description);
    formData.append('buyLink', newReel.buyLink);
    formData.append('video', newReel.video);
    formData.append('thumbnail', newReel.thumbnail);

    const { data, error } = await supabase.functions.invoke('upload-reel', {
      body: formData,
    });

    if (error) throw error;

    toast({
      title: "Success",
      description: "Reel uploaded successfully!",
    });
    
    setShowUploadDialog(false);
    setNewReel({
      title: "",
      description: "",
      video: null,
      thumbnail: null,
      buyLink: ""
    });
    
    // Refresh reels list
    window.location.reload();
    
  } catch (error) {
    console.error('Upload error:', error);
    toast({
      title: "Error",
      description: "Failed to upload reel",
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  }
};
```

### 5. Buy Button Implementation
The buy button links are stored in the `buy_link` column. In your `Reels.tsx` component:

```typescript
// In the reel display
{reel.buy_link && (
  <Button
    className="absolute top-4 right-4 bg-green-600 hover:bg-green-700"
    onClick={() => window.open(reel.buy_link, '_blank')}
  >
    Buy Now
  </Button>
)}
```

## Usage Instructions

1. **Setup Storage**: Run the storage SQL commands to create buckets and policies
2. **Deploy Edge Function**: The upload-reel function will be auto-deployed
3. **Upload Process**:
   - Admin fills the form with title, description, buy link
   - Selects video file and thumbnail image
   - Submits form which calls the edge function
   - Edge function uploads files to storage and creates database record
4. **Display**: Reels appear with buy buttons that open the provided links

## Security Notes

- Only authenticated users can upload reels
- Files are organized by user ID in storage
- Buy links should be validated on the frontend
- Consider file size limits and content moderation

## Testing

1. Go to `/admin/reels` (already exists in your app)
2. Click "Upload New Reel"
3. Fill form with buy link (e.g., product URL, external store link)
4. Upload video and thumbnail
5. Submit - the reel will appear with a buy button

The buy button will redirect users to whatever URL you provide in the `buyLink` field.