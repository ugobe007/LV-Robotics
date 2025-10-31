# Supabase Setup Guide: Storage + OAuth

## Part 1: Create Storage Bucket (REQUIRED for photos/videos)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: **tzitghqmrmsxddysxhvc** (Las Vegas Robotics)

### Step 2: Create Storage Bucket
1. Click **Storage** in the left sidebar
2. Click **Create a new bucket** button
3. Enter these details:
   - **Name**: `community-media`
   - **Public bucket**: ✅ Check this box (IMPORTANT!)
   - Click **Create bucket**

### Step 3: Set Bucket Policies
1. Click on your new **community-media** bucket
2. Go to **Policies** tab
3. Click **New Policy**

**Policy 1: Allow Uploads (Authenticated Users)**
- Click "Create policy" under INSERT
- Name: `Authenticated users can upload`
- Policy definition:
```sql
bucket_id = 'community-media'
```
- Click **Review** → **Save policy**

**Policy 2: Allow Public Read**
- Click "Create policy" under SELECT
- Name: `Public can view`
- Policy definition:
```sql
bucket_id = 'community-media'
```
- Click **Review** → **Save policy**

**Policy 3: Allow Delete Own Files**
- Click "Create policy" under DELETE
- Name: `Users can delete own files`
- Policy definition:
```sql
bucket_id = 'community-media'
```
- Click **Review** → **Save policy**

### Done! ✅
Your storage bucket is now set up. Photos and videos will be saved permanently in the cloud.

---

## Part 2: Enable OAuth (Google & GitHub)

### Option A: Enable Google Sign-In

#### Step 1: Get Google OAuth Credentials
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if needed
6. Application type: **Web application**
7. Add **Authorized redirect URIs**:
   ```
   https://tzitghqmrmsxddysxhvc.supabase.co/auth/v1/callback
   ```
8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

#### Step 2: Add to Supabase
1. Go to Supabase Dashboard
2. Click **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** ON
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

---

### Option B: Enable GitHub Sign-In

#### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: LV Robotics Community
   - **Homepage URL**: `http://localhost:8000` (or your actual domain)
   - **Authorization callback URL**:
     ```
     https://tzitghqmrmsxddysxhvc.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Click **Generate a new client secret**
6. Copy your **Client ID** and **Client Secret**

#### Step 2: Add to Supabase
1. Go to Supabase Dashboard
2. Click **Authentication** → **Providers**
3. Find **GitHub** and click to expand
4. Toggle **Enable Sign in with GitHub** ON
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

---

### Option C: Simplest - Disable Email Confirmation Instead

If you don't want to set up OAuth, just disable email confirmation:

1. Go to Supabase Dashboard
2. Click **Authentication** → **Settings**
3. Scroll to **Email Settings**
4. Find **"Enable email confirmations"**
5. **UNCHECK** this box
6. Click **Save**

Now all email/password sign-ups work instantly without confirmation!

---

## After Setup: Enable OAuth Buttons

Once you've enabled Google and/or GitHub in Supabase, I'll update the code to add those buttons back to the sign-in modal.

Let me know which OAuth providers you enabled!

---

## Quick Reference

### Storage Bucket Name
`community-media`

### OAuth Callback URL
```
https://tzitghqmrmsxddysxhvc.supabase.co/auth/v1/callback
```

### Required Supabase Settings
- ✅ Storage bucket: `community-media` (public)
- ✅ OAuth providers: Google and/or GitHub
- ✅ Email confirmation: Disabled (recommended)

---

## Test Everything

After setup:
1. **Refresh browser**
2. **Sign in** (should work smoothly now)
3. **Upload a photo** - should upload to cloud storage
4. **Refresh page** - photo should still be there
5. **Try OAuth** (if enabled) - should sign in with one click

You're all set! 🚀
