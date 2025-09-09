# Admin Reel Management Guide

This comprehensive guide explains how to upload and manage reels through the backend for the marketplace app.

## Overview

Reels are short product showcase videos that appear in the app's "Reels" section. Only admins can create and manage reels through the Supabase database.

## Database Structure

### Reels Table Structure:
```sql
- id: UUID (primary key)
- title: Text (required)
- description: Text (optional)
- thumbnail_url: Text (required) - URL to the thumbnail image
- video_url: Text (optional) - URL to the actual video
- buy_link: Text (optional) - Direct link to purchase the product
- product_id: UUID (optional) - Reference to products table
- admin_id: UUID (required) - Reference to admin's profile ID
- likes: Integer (default: 0)
- comments: Integer (default: 0) 
- views: Integer (default: 0)
- status: Text (default: 'active') - 'active', 'inactive', 'draft'
- created_at: Timestamp
- updated_at: Timestamp
```

## How to Upload Reels (Admin Steps)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard/project/oanopiyrpofiwfusvthq](https://supabase.com/dashboard/project/oanopiyrpofiwfusvthq)
2. Navigate to "Table Editor" from the left sidebar
3. Select the "reels" table

### Step 2: Get Your Admin Profile ID
First, find your profile ID:
```sql
SELECT id FROM public.profiles WHERE email = 'your-admin-email@example.com';
```

### Step 3: Prepare Your Content
1. **Video Content**: Upload your reel video to a hosting service (YouTube, Vimeo, AWS S3, etc.)
2. **Thumbnail**: Upload a high-quality thumbnail image (recommended: 1080x1920 for mobile)
3. **Buy Link**: Prepare the direct purchase URL for the product

### Step 4: Insert Reel Data
Click "Insert" and fill in the following fields:

```sql
INSERT INTO public.reels (
  admin_id,
  title,
  description,
  thumbnail_url,
  video_url,
  buy_link,
  product_id,
  status
) VALUES (
  'your-admin-profile-id-here',
  'Amazing Vintage Watch Collection',
  'Check out this incredible collection of vintage watches! Each piece is carefully curated and authenticated.',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
  'https://example.com/video.mp4', -- Optional
  'https://example-store.com/vintage-watches',
  null, -- Optional: link to existing product
  'active'
);
```

### Step 5: Required Fields
- **title**: Clear, engaging title for the reel
- **thumbnail_url**: Must be a publicly accessible URL to a high-quality image
- **admin_id**: Your admin profile ID (get from profiles table)

### Step 6: Optional Enhancements
- **video_url**: Full video URL if you want to enable video playback
- **buy_link**: Direct link users will see when they tap "Buy Now"
- **product_id**: Link to an existing product in your products table
- **description**: Additional details about the product or offer

## Best Practices

### Content Guidelines:
1. **Thumbnails**: Use high-quality, eye-catching images (1080x1920 recommended)
2. **Titles**: Keep under 60 characters for better mobile display
3. **Buy Links**: Ensure links are working and lead to the correct product
4. **Descriptions**: Keep concise but informative (under 200 characters)

### Technical Guidelines:
1. **URLs**: Always use HTTPS URLs for security
2. **Image Formats**: JPG, PNG, or WebP for thumbnails
3. **Video Formats**: MP4, WebM for best compatibility
4. **File Sizes**: Keep thumbnails under 2MB for fast loading

## Managing Existing Reels

### To Update a Reel:
```sql
UPDATE public.reels 
SET title = 'New Title', description = 'New Description' 
WHERE id = 'reel-id-here';
```

### To Deactivate a Reel:
```sql
UPDATE public.reels SET status = 'inactive' WHERE id = 'reel-id-here';
```

### To Reactivate a Reel:
```sql
UPDATE public.reels SET status = 'active' WHERE id = 'reel-id-here';
```

### To View All Your Reels:
```sql
SELECT * FROM public.reels WHERE admin_id = 'your-profile-id' ORDER BY created_at DESC;
```

## Buy Button Integration

When users tap the "Buy" button on a reel:
1. If `buy_link` is provided, users are redirected to that URL
2. If `product_id` is linked, users go to the product detail page
3. The buy_link takes priority over product_id

### Example Buy Link Formats:
- **External Store**: `https://shopify-store.com/products/item`
- **Internal Product**: Leave buy_link empty and set product_id
- **Landing Page**: `https://yoursite.com/special-offer`

## Analytics & Engagement

The app automatically tracks:
- **Views**: Incremented when users see the reel
- **Likes**: Users can like/unlike reels  
- **Comments**: Comment count (when commenting is implemented)

### View Analytics:
```sql
SELECT title, likes, views, comments, created_at 
FROM public.reels 
WHERE admin_id = 'your-profile-id' 
ORDER BY views DESC;
```

## Troubleshooting

### Common Issues:
1. **Reel not showing**: Check if `status` is set to 'active'
2. **Thumbnail not loading**: Verify URL is publicly accessible
3. **Buy button not working**: Check if `buy_link` is correct and accessible
4. **Video not playing**: Ensure video URL is direct link to video file

### Required Permissions:
- Admin access to Supabase dashboard
- Insert/Update permissions on the reels table
- Valid admin profile ID in the profiles table

## Security Notes

1. Only authenticated admins should have access to create reels
2. All URLs should be validated before insertion
3. Monitor engagement metrics for inappropriate content
4. Regular backup of reel data is recommended

## Quick Reference

### Essential SQL Commands:
```sql
-- Create a new reel
INSERT INTO reels (admin_id, title, thumbnail_url, buy_link) 
VALUES ('admin-id', 'Title', 'thumbnail-url', 'buy-url');

-- Update reel status
UPDATE reels SET status = 'active' WHERE id = 'reel-id';

-- Check your reels
SELECT * FROM reels WHERE admin_id = 'your-id';
```

---

*This guide assumes admin-level access to the Supabase backend. Contact your technical administrator if you need access permissions.*