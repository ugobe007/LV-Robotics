# Migration Guide: Add user_id to Members & Posts Tables

**IMPORTANT:** Follow these steps carefully to avoid breaking your site.

## Overview

This migration safely adds `user_id` fields to both the `members` and `posts` tables, linking them to Supabase's `auth.users` table.

**Data Risk:** ⚠️ LOW - We're adding columns, not dropping existing data
**Downtime:** None - can migrate while site is running

---

## Step-by-Step Instructions

### 1. **BACKUP YOUR DATABASE** ⚡ (CRITICAL)

Before running any SQL:
- Go to Supabase Dashboard → Settings → Backups
- Create a manual backup NOW
- Save the backup ID somewhere safe

### 2. **Test in Development First** (Recommended)

If you have a dev/staging environment:
- Run migration there first
- Test thoroughly
- Then run in production

### 3. **Run Migration in Supabase SQL Editor**

Go to: https://supabase.com/dashboard/project/cbgevvuvleuwjjmefjza/editor

**Copy and paste the entire `migration-add-user-id.sql` file**

Run it all at once (Supabase will execute sequentially).

### 4. **Verify Each Step**

After running, check the verification queries at the bottom of the script:

```sql
-- Check members with user_id
SELECT COUNT(*) as members_with_user_id FROM members WHERE user_id IS NOT NULL;
SELECT COUNT(*) as members_without_user_id FROM members WHERE user_id IS NULL;

-- Check posts with user_id
SELECT COUNT(*) as posts_with_user_id FROM posts WHERE user_id IS NOT NULL;
SELECT COUNT(*) as posts_without_user_id FROM posts WHERE user_id IS NULL;
```

**What you want to see:**
- ✅ `members_with_user_id` = number of your members
- ✅ `members_without_user_id` = 0
- ✅ `posts_with_user_id` = number of your posts
- ✅ `posts_without_user_id` = 0 (or small number of orphaned posts)

### 5. **Handle Orphaned Data** (if any)

If `SELECT * FROM members WHERE user_id IS NULL;` returns rows:

**Option A:** Manually create auth accounts for these users
- Go to Authentication → Users
- Create an account with their email
- Re-run the update query

**Option B:** Delete these orphaned records
```sql
DELETE FROM members WHERE user_id IS NULL;
```

### 6. **Finalize Constraints** (After verification)

Once you've verified all data, uncomment these lines in the SQL editor:

```sql
-- Make user_id NOT NULL
ALTER TABLE members ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE members ADD CONSTRAINT members_user_id_unique UNIQUE(user_id);

ALTER TABLE posts ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old author column from posts
ALTER TABLE posts DROP COLUMN IF EXISTS author;
```

### 7. **Update Your Frontend Code**

The JavaScript code at `/Users/leguplabs/Desktop/LV-Robotics/js/main.js` has already been updated to use `user_id` instead of `author`. No changes needed there.

### 8. **Test Your Site**

1. **Try creating a post** - Should save with your user_id
2. **Try editing your post** - Should work (user_id matches)
3. **Try editing someone else's post** - Should fail (RLS policy)
4. **Try deleting your post** - Should work
5. **Check member profile** - Should display user_id correctly

---

## Rollback Instructions (if something breaks)

If something goes wrong:

1. **Go to Supabase Dashboard → Settings → Backups**
2. **Restore from backup** you created in Step 1
3. **Contact support** if needed

Or manually rollback by running:

```sql
-- Rollback members table
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_user_id_fkey;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_user_id_unique;
ALTER TABLE members ALTER COLUMN user_id DROP NOT NULL;
DROP INDEX IF EXISTS idx_members_user_id;

-- Rollback posts table
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts ALTER COLUMN user_id DROP NOT NULL;
DROP INDEX IF EXISTS idx_posts_user_id;
```

---

## Timeline

- **Steps 1-4:** 5 minutes
- **Steps 5-6:** 10 minutes (pending data verification)
- **Steps 7-8:** 5 minutes
- **Total:** ~20-30 minutes

---

## Need Help?

Check these files:
- **Migration SQL:** `migration-add-user-id.sql`
- **New Schema:** `supabase-setup.sql`
- **Frontend Code:** `js/main.js` (already updated)

Run the verification queries and share their output if you hit issues.

**Good luck! 🚀**