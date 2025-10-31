# Community Bulletin Board - Photo/Video Persistence Fix

## Problem Identified
Photos and videos were disappearing from the community bulletin board because:

1. **Missing Supabase Library**: The `bulletin.html` page was missing the Supabase JavaScript library, preventing persistent storage
2. **No Authentication Required**: Users could attempt to upload media without being signed in, causing uploads to fail silently
3. **localStorage Fallback**: System was falling back to browser localStorage for failed uploads, which:
   - Has strict size limits (5-10MB typically)
   - Gets cleared when browser data is cleared
   - Is not shared between users or devices
   - Cannot reliably store large images/videos

## Fixes Applied

### 1. Added Supabase Library to bulletin.html
- Added `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` before main.js
- This enables proper cloud storage for all media uploads

### 2. Added Authentication Controls to bulletin.html
- Added sign-in interface matching community.html
- Users can sign in via:
  - Email magic link
  - Google OAuth
  - GitHub OAuth
- Authentication is now required to post photos/videos

### 3. Improved Upload Validation
- Added file size limits:
  - Images: 10MB maximum
  - Videos: 50MB maximum
- Added authentication checks before accepting media uploads
- Users now get clear error messages if they try to upload without signing in

### 4. Better Error Handling
- Media uploads now fail gracefully with helpful error messages
- Users are informed when uploads fail and why
- Failed uploads are removed from the display (no phantom posts)
- Console logs provide debugging information

### 5. Removed Unreliable localStorage for Media
- Media posts now REQUIRE Supabase to succeed
- Only text-only posts fall back to localStorage
- This prevents data loss from browser storage limitations

## How to Use the Fixed System

### For Users Posting Photos/Videos:

1. **Sign In First**
   - Open the bulletin board page
   - Enter your email and click "Sign in to post" OR
   - Click "Google" or "GitHub" for quick sign-in
   - Check your email for the magic link (if using email sign-in)

2. **Upload Your Media**
   - Click "📷 Add Image" or "🎥 Add Video"
   - Select your file (max 10MB for images, 50MB for videos)
   - See the preview appear
   - Add optional text description
   - Click "Post"

3. **Your Media is Now Permanent**
   - Photos and videos are stored in Supabase cloud storage
   - They will remain visible to all users
   - You can delete your own posts using the "Delete" button
   - Media persists even if you clear browser data

### For Administrators:

#### Database Configuration
The Supabase database is already configured with:
- `posts` table for metadata
- `community-media` storage bucket for files
- Row Level Security (RLS) policies ensuring:
  - Only authenticated users can upload
  - Files are stored in user-specific folders
  - Users can only delete their own content
  - All content is publicly readable

#### Storage Structure
```
community-media/
  └── {user-id}/
      ├── post_{timestamp}_{random}.jpg
      ├── post_{timestamp}_{random}.png
      └── post_{timestamp}_{random}.mp4
```

#### Maintenance
Run this SQL periodically to remove duplicate posts:
```sql
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, COALESCE(media_url, text)
           ORDER BY created_at DESC
         ) AS rn
  FROM posts
)
DELETE FROM posts p
WHERE EXISTS (
  SELECT 1 FROM ranked 
  WHERE ranked.id = p.id AND ranked.rn > 1
);
```

## Testing the Fix

1. Visit `bulletin.html` or `community.html`
2. Sign in using any method
3. Upload a photo or video
4. Refresh the page - media should still be there
5. Open in a different browser - media should be visible
6. Check browser console for any errors

## Technical Details

### Supabase Configuration
- **URL**: https://cbgevvuvleuwjjmefjza.supabase.co
- **Storage Bucket**: community-media (public)
- **Table**: posts
- **Authentication**: Email OTP, Google OAuth, GitHub OAuth

### File Upload Flow
1. User selects file → converted to base64 data URL
2. Authentication check performed
3. File size validation
4. Upload to Supabase storage in user's folder
5. Public URL returned and stored in database
6. Post rendered with permanent cloud URL

### Security Features
- User folders prevent unauthorized file access
- Rate limiting: 3 posts per 30 seconds
- File size limits prevent abuse
- RLS policies enforce ownership rules
- Public read access for community sharing

## Troubleshooting

### "Upload failed" error
- Ensure you are signed in
- Check file size (10MB images, 50MB videos)
- Verify internet connection
- Check browser console for detailed error

### Photos not appearing
- Refresh the page to load from Supabase
- Sign in to see all community posts
- Check if Supabase service is operational

### Can't delete posts
- Only the post author can delete posts
- Must be signed in with the same account that created the post

## Future Improvements

Potential enhancements:
- Image compression before upload
- Video thumbnail generation
- Progress indicators for large uploads
- Drag-and-drop upload interface
- Image editing tools
- Better file type validation
- Automatic image optimization

---

**Status**: ✅ FIXED - Photos and videos now persist permanently in cloud storage
**Last Updated**: October 31, 2025
