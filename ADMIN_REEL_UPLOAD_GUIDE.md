# Complete Admin Reel Upload Guide

This comprehensive guide explains how to upload and manage product showcase reels for your marketplace app.

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

## Step-by-Step Upload Process

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

## Required vs Optional Fields

### Required Fields:
- **admin_id**: Your admin profile ID (get from profiles table)
- **title**: Clear, engaging title for the reel
- **thumbnail_url**: Must be a publicly accessible URL to a high-quality image

### Optional Fields:
- **video_url**: Full video URL if you want to enable video playback
- **buy_link**: Direct link users will see when they tap "Buy Now"
- **product_id**: Link to an existing product in your products table
- **description**: Additional details about the product or offer

## Buy Button Integration

The buy button is the key feature that connects your reels to actual product sales:

### How Buy Links Work:
1. When users tap the "Buy" button on a reel, they're redirected to the `buy_link` URL
2. This should be a direct link to your product page or external store
3. The link opens in a new tab for seamless shopping experience

### Buy Link Priority:
- If `buy_link` is provided, users are redirected to that URL
- If `product_id` is linked but no `buy_link`, users go to the internal product detail page
- The `buy_link` takes priority over `product_id`

### Example Buy Link Formats:
- **External Store**: `https://shopify-store.com/products/item`
- **Amazon**: `https://amazon.com/dp/B123456789`
- **Internal Product**: Leave buy_link empty and set product_id
- **Landing Page**: `https://yoursite.com/special-offer`

## Content Guidelines

### Visual Content:
1. **Thumbnails**: Use high-quality, eye-catching images (1080x1920 recommended)
2. **Aspect Ratio**: Vertical format works best for mobile
3. **Branding**: Include your brand elements subtly
4. **Product Focus**: Make the product the hero of the image

### Text Content:
1. **Titles**: Keep under 60 characters for better mobile display
2. **Descriptions**: Keep concise but informative (under 200 characters)
3. **Call-to-Action**: Use compelling language that encourages purchases

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

### To Update Buy Link:
```sql
UPDATE public.reels 
SET buy_link = 'https://new-store-link.com/product' 
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

## Analytics & Performance

The app automatically tracks:
- **Views**: Incremented when users see the reel
- **Likes**: Users can like/unlike reels (stored in reel_likes table)
- **Comments**: Comment count (when commenting is implemented)

### View Analytics:
```sql
SELECT title, likes, views, comments, created_at, buy_link
FROM public.reels 
WHERE admin_id = 'your-profile-id' 
ORDER BY views DESC;
```

### Monitor Buy Button Clicks:
While direct click tracking isn't built-in, you can:
1. Use UTM parameters in your buy_links
2. Monitor your external store analytics
3. Track conversion rates from your e-commerce platform

## Advanced Features

### Multiple Product Variants:
Create different reels for different product variants:
```sql
-- Reel for Product A - Red variant
INSERT INTO public.reels (admin_id, title, thumbnail_url, buy_link) 
VALUES ('admin-id', 'Amazing Red Widget', 'thumbnail-red.jpg', 'store.com/red-widget');

-- Reel for Product A - Blue variant  
INSERT INTO public.reels (admin_id, title, thumbnail_url, buy_link) 
VALUES ('admin-id', 'Amazing Blue Widget', 'thumbnail-blue.jpg', 'store.com/blue-widget');
```

### Seasonal Campaigns:
Use the status field to manage seasonal content:
```sql
-- Activate holiday reels
UPDATE public.reels SET status = 'active' WHERE title LIKE '%Holiday%';

-- Deactivate after season
UPDATE public.reels SET status = 'inactive' WHERE title LIKE '%Holiday%';
```

## Troubleshooting

### Common Issues:
1. **Reel not showing**: Check if `status` is set to 'active'
2. **Thumbnail not loading**: Verify URL is publicly accessible and HTTPS
3. **Buy button not working**: Check if `buy_link` is correct and accessible
4. **Video not playing**: Ensure video URL is direct link to video file
5. **Low engagement**: Review thumbnail quality and title effectiveness

### Testing Your Setup:
1. Upload a test reel with a simple buy_link
2. Check the reel appears in the app
3. Test the buy button functionality
4. Monitor analytics for the test reel

## Security & Best Practices

1. **URL Validation**: Ensure all URLs are legitimate and safe
2. **Content Moderation**: Review all content before making reels active
3. **Link Verification**: Test buy_links regularly to ensure they're working
4. **Analytics Monitoring**: Regular check engagement metrics
5. **Backup**: Keep backups of successful reel configurations

## Quick Reference Commands

```sql
-- Create a new reel with buy link
INSERT INTO reels (admin_id, title, thumbnail_url, buy_link, description, status) 
VALUES ('admin-id', 'Product Title', 'https://image-url.jpg', 'https://store.com/product', 'Product description', 'active');

-- Update buy link
UPDATE reels SET buy_link = 'https://new-store-link.com' WHERE id = 'reel-id';

-- Check reel performance
SELECT title, likes, views, buy_link FROM reels WHERE admin_id = 'your-id' ORDER BY views DESC;

-- Activate/deactivate reels
UPDATE reels SET status = 'active' WHERE id = 'reel-id';
UPDATE reels SET status = 'inactive' WHERE id = 'reel-id';
```

---

*This guide assumes admin-level access to the Supabase backend. Contact your technical administrator if you need access permissions.*