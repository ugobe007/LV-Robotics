# Moderator Profile Feature

## Overview
Added an optional moderator profile section to the admin panel where moderators can add their name, bio, and social links to display on community pages.

## Features Added

### Admin Panel
- **New Navigation Button**: "My Profile" with user-shield icon
- **Profile Form** with fields:
  - Moderator Name (display name)
  - Profile Bio (textarea for background/interests)
  - Email (optional public contact)
  - LinkedIn URL (optional)
  - Twitter/X URL (optional)
  - GitHub URL (optional)
- **Save Button**: Saves profile with success confirmation
- **Auto-load**: Loads existing profile when section is opened

### Database
- **Table**: `moderator_profiles`
- **Fields**: user_id, name, bio, email, linkedin, twitter, github
- **RLS Policies**:
  - Public can view all moderator profiles
  - Users can only edit their own profile
- **Upsert Logic**: Insert on first save, update on subsequent saves

## How to Use

### 1. Create the Database Table
Run this SQL in your Supabase SQL Editor:

```sql
-- See supabase-moderator-profiles.sql for complete schema
```

**File**: `supabase-moderator-profiles.sql`

### 2. Access Your Profile
1. Log into admin panel
2. Click **"My Profile"** in the left sidebar
3. Fill in your information (all fields optional)
4. Click **"Save Profile"**
5. Success message appears for 3 seconds

### 3. Profile Fields

**Moderator Name**
- Your display name for the community
- Example: "John Doe" or "Dr. Jane Smith"

**Profile Bio**
- Tell the community about yourself
- Your background, interests, role in robotics
- Example: "Robotics engineer with 10 years experience in autonomous systems..."

**Email** (optional)
- Public contact email
- Leave blank to keep your email private

**Social Media Links** (optional)
- LinkedIn: Full URL to your profile
- Twitter/X: Full URL to your profile
- GitHub: Full URL to your profile

## Technical Details

### Form Behavior
- All fields are optional - you can save with empty fields
- Data is stored per user (user_id)
- Uses upsert to create or update profile
- Success message disappears after 3 seconds

### Error Handling
- If table doesn't exist, shows helpful error message
- Suggests creating the table in Supabase
- Console logs for debugging

### Database Schema
```sql
CREATE TABLE moderator_profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE,
    name VARCHAR(255),
    bio TEXT,
    email VARCHAR(255),
    linkedin VARCHAR(500),
    twitter VARCHAR(500),
    github VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Future Use Cases

This profile data can be used to:
1. Display moderator bios on the Community page
2. Show "Meet the Team" section
3. Add moderator cards to event pages
4. Create a team/staff directory
5. Show who moderated/approved content

## Notes

- **Completely Optional**: Not filling out the profile won't affect admin functionality
- **Privacy**: Users control what information they share
- **Public Data**: Saved profiles are viewable by anyone (RLS policy)
- **One Profile Per User**: Each user can only have one profile

## Testing Checklist

- [x] Can access "My Profile" section from navigation
- [x] Form loads empty for new users
- [x] Can save profile with all fields filled
- [x] Can save profile with some fields empty
- [x] Success message appears after save
- [x] Existing profile loads when returning to section
- [x] Can update existing profile
- [x] Error message shows if table doesn't exist

## SQL Migration Required

Before using this feature, run:
```bash
# In Supabase SQL Editor, run the contents of:
supabase-moderator-profiles.sql
```

This creates the table and sets up proper permissions.
