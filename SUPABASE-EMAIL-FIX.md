# Fix: Disable Email Confirmation in Supabase

## The Problem
Users are getting "Email not confirmed" errors when trying to sign in, which blocks them from posting photos/videos.

## The Solution
Disable email confirmation requirement in your Supabase project settings.

---

## Steps to Fix (5 minutes):

### 1. Go to Supabase Dashboard
- Open: https://supabase.com/dashboard
- Select your project: `cbgevvuvleuwjjmefjza`

### 2. Navigate to Authentication Settings
- Click **Authentication** in the left sidebar
- Click **Providers** tab
- Find **Email** provider

### 3. Disable Email Confirmation
- Look for "Confirm email" toggle
- **Turn OFF** email confirmation
- Click **Save**

### Alternative: Enable Auto-Confirm
If you can't find the toggle above:
- Go to **Settings** → **Authentication**
- Find "Enable email confirmations"
- **Uncheck** this option
- Click **Save**

---

## OR: Confirm Your Existing Email

If you want to keep email confirmation ON:

### Option A: Find the Confirmation Email
1. Check your email inbox (the one you signed up with)
2. Look for email from Supabase
3. Click the confirmation link
4. Return to the website and sign in again

### Option B: Resend Confirmation (using Supabase Dashboard)
1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find your user account
4. Click the **...** menu
5. Select "Send confirmation email"
6. Check your inbox

### Option C: Manually Confirm (using Supabase Dashboard)
1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find your user account
4. Click to edit
5. Set `email_confirmed_at` to current timestamp
6. Save

---

## Recommended: Disable Email Confirmation

For a community bulletin board, email confirmation creates friction. Most similar sites (Facebook groups, Reddit, Discord) don't require email confirmation for posting.

**Benefits of disabling:**
- ✅ Instant account creation
- ✅ Better user experience
- ✅ No waiting for emails
- ✅ Works with temporary/disposable emails
- ✅ Fewer support requests

**You can still use:**
- ✅ Password requirements
- ✅ Rate limiting (already configured)
- ✅ Content moderation
- ✅ User banning if needed

---

## After Making Changes

1. **Clear your browser data** (or open an incognito window)
2. **Try signing in again** with your email/password
3. **Test uploading a photo**
4. Everything should work!

---

## Still Having Issues?

The code has been updated to:
- Handle "Email not confirmed" errors gracefully
- Show helpful messages to users
- Fall back to local storage if database isn't accessible
- Provide better error logging in the console

Check the browser console (F12 → Console tab) for detailed error messages.
