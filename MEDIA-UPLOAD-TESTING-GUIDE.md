# 📸 MEDIA UPLOAD TESTING & DEBUGGING GUIDE

## Quick Reference for Testing Media Functionality

---

## 🧪 TESTING SCENARIOS

### Test 1: Image Upload (Authenticated)
**Setup:** Sign in to the app first
**Steps:**
1. Click "Add Image" button
2. Select an image file (~1MB recommended)
3. Should show preview
4. Click "Post" button
5. Should upload to Supabase Storage
6. Post should appear in bulletin board

**Expected Results:**
- ✓ Image appears in post
- ✓ Image URL from Supabase (not data URL)
- ✓ Post visible after page reload
- ✓ No errors in console

---

### Test 2: Video Upload (Authenticated)
**Setup:** Sign in to the app first
**Steps:**
1. Click "Add Video" button
2. Select a video file (~5MB recommended)
3. Should show preview with play button
4. Click "Post" button
5. Should upload to Supabase Storage

**Expected Results:**
- ✓ Video plays in post
- ✓ Video URL from Supabase
- ✓ Post visible after page reload
- ✓ Video controls visible

---

### Test 3: Image Upload (Unauthenticated)
**Setup:** NOT signed in
**Steps:**
1. Click "Add Image" button
2. Select an image file
3. Shows preview
4. Click "Post" button
5. Should show confirmation dialog

**Expected Results:**
- ✓ Dialog asks to sign in or post as text only
- ✓ If "OK": Opens sign-in modal
- ✓ If "Cancel": Clears media, posts as text only

---

### Test 4: File Size Validation - Images
**Setup:** Any auth state
**Steps:**
1. Try to upload image > 10MB
2. Should show error alert immediately

**Expected Results:**
- ✓ Alert: "Image is too large. Please use an image smaller than 10MB."
- ✓ File input cleared
- ✓ No upload attempted
- ✓ App remains responsive

**How to create test file:**
```bash
# Create 15MB test image
dd if=/dev/zero of=/tmp/large-image.jpg bs=1M count=15
```

---

### Test 5: File Size Validation - Videos
**Setup:** Any auth state
**Steps:**
1. Try to upload video > 50MB
2. Should show error alert immediately

**Expected Results:**
- ✓ Alert: "Video is too large. Please use a video smaller than 50MB."
- ✓ File input cleared
- ✓ No upload attempted

**How to create test file:**
```bash
# Create 60MB test video
dd if=/dev/zero of=/tmp/large-video.mp4 bs=1M count=60
```

---

### Test 6: Bucket Not Found Error
**Setup:** Supabase project without `community-media` bucket
**Steps:**
1. Sign in
2. Upload image
3. Bucket doesn't exist in Supabase

**Expected Results:**
- ✓ Alert: "Storage bucket not set up yet..."
- ✓ Post is saved with data URL fallback
- ✓ Image still visible in browser
- ✓ Post persists in localStorage

---

### Test 7: Network Failure Simulation
**Setup:** Chrome DevTools Network Throttling
**Steps:**
1. Open Chrome DevTools → Network
2. Set throttling to "Offline"
3. Try to upload image while signed in

**Expected Results:**
- ✓ Upload fails gracefully
- ✓ Alert: "Failed to upload media. The file will be saved temporarily..."
- ✓ Post saved with data URL fallback
- ✓ Image visible in browser
- ✓ Post persists in localStorage

---

### Test 8: Permissions Error
**Setup:** RLS policies block upload
**Steps:**
1. Sign in with restricted user (if available)
2. Try to upload image

**Expected Results:**
- ✓ Alert: "You do not have permission to upload..."
- ✓ Upload fails gracefully
- ✓ Post saved as text (without media)
- ✓ No data corruption

---

## 🐛 DEBUGGING MEDIA UPLOADS

### Enable Debug Logging

**In Browser Console:**
```javascript
// Enable debug logging for troubleshooting
DEBUG = true;
```

Then reload page or perform upload. Console will show detailed logs:
- Session checks
- Base64 conversion details
- Upload progress
- Error details

**Output Example:**
```
Session check for image upload: {session: {...}}
Is authenticated: true
Attempting to upload to community-media bucket... filename.jpg
Successfully uploaded to Supabase: https://...
```

### Common Error Messages & Fixes

#### Error: "Supabase client not initialized"
**Cause:** `sbClient` not created or Supabase not loaded
**Fix:** Check:
1. Supabase URL is correct in `js/main.js` line 149
2. Anon key is correct in `js/main.js` line 150
3. No JS errors in console during init
4. Browser allowed script loading

#### Error: "Invalid base64 data URL format"
**Cause:** FileReader returned malformed data
**Fix:** 
1. Check file isn't corrupted
2. Try different file format
3. Check browser memory not exhausted
4. File < 10MB (images) or < 50MB (videos)

#### Error: "Bucket not found"
**Cause:** `community-media` bucket doesn't exist
**Fix:**
1. Go to Supabase Dashboard
2. Storage → Create new bucket
3. Name: `community-media`
4. Set to public (readable)
5. Configure RLS policies

#### Error: "Upload failed: User not authenticated"
**Cause:** Session expired or invalid
**Fix:**
1. Refresh page to re-check session
2. Sign out and sign back in
3. Check Supabase anon key isn't expired
4. Verify email is confirmed (Supabase)

---

## 🔍 DEBUG POINTS IN CODE

### File: `js/main.js`

**Line 146:** DEBUG flag control
```javascript
const DEBUG = false; // Set to true for debugging
```

**Line 435-476:** Image upload handler
- Checks authentication
- Validates file size
- Converts to data URL

**Line 479-523:** Video upload handler
- Checks authentication  
- Validates file size
- Converts to data URL

**Line 818-894:** Upload to Supabase function
```javascript
async function tryUploadToSupabase(dataUrl, kind)
```
- Parses base64 MIME type
- Validates base64 string
- Converts binary
- Uploads to storage
- Returns public URL or fallback

**Line 898-929:** Save post to database
```javascript
async function savePostSupabase(post)
```
- Gets user session
- Validates user ID
- Inserts into `posts` table
- Handles RLS errors

---

## 🧬 TESTING MEDIA FALLBACK CHAIN

The app has a robust fallback system:

```
1. Upload to Supabase Storage (if authenticated)
   ↓
   ✓ Success → Use Supabase public URL
   ↗ Bucket not found → Use data URL fallback
   ↗ Permission denied → Use data URL fallback
   ↗ Network error → Use data URL fallback

2. Save to Supabase Database (if authenticated)
   ↓
   ✓ Success → Post persists permanently
   ↗ Not authenticated → Skip to step 3
   ↗ DB error → Use data URL fallback

3. Save to Browser localStorage (always)
   ↓
   ✓ Success → Post persists in browser only
   ✓ Data URL used for image/video

4. Display in UI (always)
   ↓
   Shows post with media (Supabase URL or data URL)
```

**Test this chain:**
1. Sign in and upload → Should use Supabase URL
2. Sign out, disable DB, upload → Should use data URL
3. Reload page → Posts should be restored from localStorage

---

## 📊 MONITORING UPLOADS

### Track Success Rate
Monitor these Supabase metrics:
- `storage/upload_requests` - Total upload attempts
- `storage/upload_errors` - Failed uploads
- `database/insert_requests` - Posts saved
- `database/insert_errors` - Save failures

### Performance Metrics
- Image upload time: Should be < 5 seconds
- Video upload time: Should be < 30 seconds
- Page load with media: Should be < 2 seconds

**Check in Fly.io dashboard:**
```bash
flyctl metrics -a lv-robotics
```

---

## ✅ FINAL VERIFICATION CHECKLIST

Before deploying to production, verify:

- [ ] Image upload works (small, medium, large)
- [ ] Video upload works (small, medium)
- [ ] File size validation rejects oversized files
- [ ] Unauthenticated media post shows dialog
- [ ] Network error handling works
- [ ] Post persists after page reload
- [ ] Media displays correctly in modal
- [ ] Delete post removes media from storage
- [ ] No console errors (DEBUG = false)
- [ ] Storage bucket created with correct permissions
- [ ] RLS policies prevent unauthorized access
- [ ] Database queries complete in < 1 second

---

## 🚀 QUICK DEPLOY VERIFICATION

After deploying to Fly.io:

```bash
# 1. Check deployment status
flyctl status -a lv-robotics

# 2. View recent logs
flyctl logs -a lv-robotics -n 50

# 3. Test endpoint
curl https://lv-robotics.fly.dev

# 4. Check security headers
curl -i https://lv-robotics.fly.dev | grep -E "X-|Strict"

# 5. Enable debug logging on live site
# Open browser console, run: DEBUG = true
# Then test upload and watch logs
```

---

**Questions?** Check the console with `DEBUG = true` enabled for detailed logs!