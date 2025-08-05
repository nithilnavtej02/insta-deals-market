# Admin Reel Upload Guide

## How to Upload Reels to the Database

As an admin, you can upload product reels directly to the database using the Supabase dashboard. Follow these steps:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard/project/oanopiyrpofiwfusvthq](https://supabase.com/dashboard/project/oanopiyrpofiwfusvthq)
2. Navigate to "SQL Editor" from the left sidebar

### Step 2: Insert a New Reel
Use this SQL template to insert a new reel:

```sql
INSERT INTO public.reels (
  product_id,
  admin_id,
  title,
  description,
  thumbnail_url,
  video_url,
  buy_link,
  status
) VALUES (
  null, -- product_id (can be null if not linked to a specific product)
  'admin-user-id', -- Replace with your admin profile ID
  'Your Reel Title Here',
  'Description of the product featured in the reel...',
  'https://example.com/thumbnail.jpg', -- URL to thumbnail image
  'https://example.com/video.mp4', -- URL to video file (optional)
  'https://your-buy-link.com', -- Where users should go when they click "Buy"
  'active'
);
```

### Step 3: Replace the Values
- **admin_id**: Get your profile ID from the profiles table
- **title**: Catchy title for your reel
- **description**: Detailed description of the product
- **thumbnail_url**: URL to the thumbnail image
- **video_url**: URL to the video file (optional)
- **buy_link**: The URL where users will be redirected when they click "Buy"

### Step 4: Get Your Admin Profile ID
First, find your profile ID:

```sql
SELECT id FROM public.profiles WHERE email = 'your-admin-email@example.com';
```

### Example Real Reel Insert:
```sql
INSERT INTO public.reels (
  admin_id,
  title,
  description,
  thumbnail_url,
  buy_link,
  status
) VALUES (
  'your-profile-id-here',
  'Amazing Vintage Watch Collection',
  'Check out this incredible collection of vintage watches! Each piece is carefully curated and authenticated. Perfect for collectors and watch enthusiasts.',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
  'https://example-store.com/vintage-watches',
  'active'
);
```

### Notes:
- The buy_link is where users will be redirected when they tap the "Buy" button on the reel
- Make sure the thumbnail_url points to a valid image
- The reel will automatically appear in the Reels section of the app
- Users can like, comment, and share the reel
- The video_url is optional - you can use just images with the thumbnail_url

### Managing Reels:
To deactivate a reel:
```sql
UPDATE public.reels SET status = 'inactive' WHERE id = 'reel-id-here';
```

To reactivate a reel:
```sql
UPDATE public.reels SET status = 'active' WHERE id = 'reel-id-here';
```

To view all your reels:
```sql
SELECT * FROM public.reels WHERE admin_id = 'your-profile-id' ORDER BY created_at DESC;
```