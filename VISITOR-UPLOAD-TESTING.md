# ✅ Testing Checklist - Visitor Upload Flow

## Pre-Test Setup
- [ ] Clear browser cache and localStorage
- [ ] Open bulletin.html in a fresh browser (not logged in)
- [ ] Open browser console (F12) for any error messages

---

## Test 1: Anonymous Image Upload ✅

**Scenario:** Visitor uploads image without signing in

### Steps:
1. [ ] Click **📷 Add Image**
2. [ ] Select a JPEG/PNG image (under 10MB)
3. [ ] Verify preview shows
4. [ ] Add some text in textarea (optional)
5. [ ] Click **Post** button

### Expected Results:
- [ ] Dialog appears: "💡 Sign up to save your uploads forever!"
- [ ] Two options: OK (sign up) and Cancel (post without saving)

### If Click "Cancel":
- [ ] Post appears on board with thumbnail
- [ ] Thumbnail shows the image
- [ ] No errors in console
- [ ] Post saved to browser storage (refresh page - still there!)

### If Click "OK":
- [ ] Sign in modal appears
- [ ] Complete sign in
- [ ] Post appears on board
- [ ] Post saved to cloud (visible to others)

---

## Test 2: Anonymous Video Upload ✅

**Scenario:** Visitor uploads video without signing in

### Steps:
1. [ ] Click **🎥 Add Video**
2. [ ] Select an MP4 video (under 50MB)
3. [ ] Verify preview shows
4. [ ] Click **Post** button

### Expected Results:
- [ ] Same dialog as Test 1
- [ ] Video thumbnail appears on board (or placeholder)
- [ ] Video plays when post is clicked

---

## Test 3: Upload Size Validation ✅

**Scenario:** Visitor tries to upload oversized media

### Test 3a: Large Image
1. [ ] Click **📷 Add Image**
2. [ ] Try to upload image > 10MB
3. [ ] Expected: Alert "Image is too large"
4. [ ] File input clears
5. [ ] No post created

### Test 3b: Large Video
1. [ ] Click **🎥 Add Video**
2. [ ] Try to upload video > 50MB
3. [ ] Expected: Alert "Video is too large"
4. [ ] File input clears
5. [ ] No post created

---

## Test 4: Invalid File Type ✅

**Scenario:** Visitor tries to upload unsupported format

### Steps:
1. [ ] Click **📷 Add Image**
2. [ ] Try to upload .exe, .zip, or other non-image
3. [ ] Expected: Alert "Invalid image format"
4. [ ] File input clears

---

## Test 5: Text-Only Post (No Media) ✅

**Scenario:** Visitor posts text only

### Steps:
1. [ ] Don't upload any media
2. [ ] Type text in textarea
3. [ ] Click **Post**

### Expected Results:
- [ ] NO sign-up dialog (no media = no requirement)
- [ ] Post appears immediately with text preview
- [ ] Works whether signed in or not

---

## Test 6: Browser Storage Persistence ✅

**Scenario:** Unsigned-in user's posts survive page refresh

### Steps:
1. [ ] Upload image/video WITHOUT signing in
2. [ ] Click Cancel on sign-up dialog
3. [ ] Post appears on board
4. [ ] **Refresh page** (Ctrl+R or Cmd+R)

### Expected Results:
- [ ] Post still appears!
- [ ] Image/video thumbnail still shows
- [ ] Survives refresh

### Steps (Part 2):
1. [ ] Close browser completely
2. [ ] Reopen to same URL
3. [ ] **Refresh page**

### Expected Results:
- [ ] If same browser → Post still there ✅
- [ ] If different browser → Post gone (correct - localStorage is per-browser)

---

## Test 7: Signed-In Upload ✅

**Scenario:** User signs in first, then uploads

### Steps:
1. [ ] Click **✨ Sign Up to Save Your Posts**
2. [ ] Sign in with email/Google/GitHub
3. [ ] Upload image
4. [ ] Click **Post**

### Expected Results:
- [ ] NO sign-up dialog (already signed in!)
- [ ] Post appears on board
- [ ] Post stored in cloud (persisted to Supabase)
- [ ] Post visible when you refresh
- [ ] Post visible to others who load page

---

## Test 8: Media Error Handling ✅

**Scenario:** Image/video fails to load

### Steps:
1. [ ] Upload an image
2. [ ] In the browser DevTools, block the image URL
3. [ ] Post the image
4. [ ] Click on the post to see details

### Expected Results:
- [ ] Broken image shows error placeholder
- [ ] Error message: "⚠️ Image failed to load"
- [ ] Not a broken image icon
- [ ] No JavaScript errors

---

## Test 9: Multiple Posts ✅

**Scenario:** Upload multiple posts

### Steps:
1. [ ] Upload image 1, post (signed out)
2. [ ] Upload image 2, post (signed out)
3. [ ] Upload image 3, post (signed in)

### Expected Results:
- [ ] All 3 appear on board
- [ ] Images 1-2 in localStorage
- [ ] Image 3 in cloud
- [ ] Counter updates: "📸 Latest Community Posts (3/50)"

---

## Test 10: Sign In Button Behavior ✅

**Scenario:** Test the header sign-in button

### When Signed Out:
- [ ] Button says "✨ Sign Up to Save Your Posts"
- [ ] Click it → sign-in modal appears

### When Signed In:
- [ ] Button changes to "Sign out"
- [ ] Click it → user logs out
- [ ] Button changes back to "✨ Sign Up to Save Your Posts"

---

## Test 11: Mobile Responsiveness ✅

**Scenario:** Test on mobile browser

### Steps:
1. [ ] Open bulletin.html on phone/tablet
2. [ ] Upload image
3. [ ] Post with/without signing in
4. [ ] Verify responsive layout

### Expected Results:
- [ ] Gallery grid adapts to mobile
- [ ] Buttons are tap-friendly
- [ ] No broken layout
- [ ] Upload works same as desktop

---

## Test 12: Cross-Browser Testing ✅

### Firefox:
- [ ] Upload image ✅
- [ ] Post without signing in ✅
- [ ] Posts persist after refresh ✅

### Safari:
- [ ] Upload image ✅
- [ ] Post without signing in ✅
- [ ] Posts persist after refresh ✅

### Chrome:
- [ ] Upload image ✅
- [ ] Post without signing in ✅
- [ ] Posts persist after refresh ✅

---

## Test 13: Verification of New Flow ✅

### Quick Test:
1. [ ] **Incognito/Private window** (ensures no stored session)
2. [ ] Click **📷 Add Image**
3. [ ] Upload image
4. [ ] **NO auth required** ✅
5. [ ] Click **Post**
6. [ ] See sign-up dialog ✅
7. [ ] Click **Cancel**
8. [ ] Post appears on board ✅
9. [ ] Refresh page ✅
10. [ ] Post still there (localStorage) ✅

---

## Console Error Check ✅

### Steps:
1. [ ] Open F12 (Developer Tools)
2. [ ] Go to **Console** tab
3. [ ] Perform tests above
4. [ ] Check for errors

### Expected Results:
- [ ] No JavaScript errors
- [ ] No 404s for resources
- [ ] Only INFO logs from debug system
- [ ] Clean console

### If you see errors, note them:
```
Error observed: ___________________
Location/Step: ___________________
```

---

## Success Criteria

✅ **All tests passing** means:

1. Visitors can upload without signing in
2. Posts appear immediately
3. Sign-up dialog shown at post time (not upload time)
4. Both signed-in and signed-out posts work
5. localStorage fallback working
6. Cloud storage working for authenticated users
7. No console errors
8. Responsive and cross-browser compatible

---

## Deployment Verification

After deploying to production:

- [ ] Test on live URL
- [ ] Verify posts from unsigned users appear
- [ ] Verify posts from signed-in users appear in cloud
- [ ] Monitor for console errors
- [ ] Check Supabase storage for uploaded media
- [ ] Monitor localStorage usage

---

## Issue Tracking

If you find any issues:

1. **Issue:** _________________________________
2. **Steps to reproduce:** ____________________
3. **Expected vs Actual:** ____________________
4. **Browser/Device:** _________________________
5. **Console errors:** __________________________

---

**Testing Date:** ________________
**Tested By:** ________________
**Status:** ☐ PASS ☐ FAIL

**Notes:** ____________________________________________