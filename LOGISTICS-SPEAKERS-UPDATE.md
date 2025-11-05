# Event System Update: Single-Day Events with Logistics & Speakers

## Overview
Updated the event system to focus on single-day robotics meetups/workshops with venue logistics tracking and speaker information.

## Changes Made

### 1. Form Updates (admin.html)
- **Converted to single-day events**: Removed separate end date field
- **Made end time required**: Events must have defined start and end times
- **Made venue name required**: Clear identification of event location
- **Made venue address/URL required**: Critical for attendee planning
- **Added venue logistics section**:
  - Food & Drinks dropdown (provided/needed/none)
  - AV Equipment dropdown (provided/needed/none)
  - Curfew/Hard Stop Time (optional)
- **Added speakers & partners section**:
  - Event Topic/Industry dropdown (space, healthcare, defense, hospitality, manufacturing, public safety, office, education, agriculture, general, other)
  - Speaker Names (comma-separated)
  - Speaker Bios (textarea)
  - Partner Organizations (comma-separated)
  - Background Materials/Resources (textarea for links)

### 2. JavaScript Updates (admin-events.js)
- Updated `saveEvent()` to include all new fields
- Updated `populateEventForm()` to load logistics and speaker data
- Enhanced validation to require venue name, address, and end time
- Maintains single-day structure (uses same date for start and end)

### 3. Database Migration Required

**IMPORTANT**: You must run this SQL in your Supabase SQL Editor before the new fields will save:

```sql
-- Add venue logistics and speakers/partners fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS curfew_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS food_drinks VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS av_equipment VARCHAR(50);
ALTER TABLE events ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
ALTER TABLE events ADD COLUMN IF NOT EXISTS speakers TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS speaker_bios TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS partners TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS resources TEXT;
```

**SQL file**: `supabase-logistics-speakers-migration.sql`

## How to Apply Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your "lv-robotics" project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `supabase-logistics-speakers-migration.sql`
6. Click "Run" or press Cmd/Ctrl + Enter
7. Verify success message appears

## New Fields Reference

### Venue Logistics
| Field | Type | Required | Values |
|-------|------|----------|--------|
| `curfew_time` | TIME | No | HH:MM format (e.g., "22:00") |
| `food_drinks` | VARCHAR(50) | No | "provided", "needed", "none" |
| `av_equipment` | VARCHAR(50) | No | "provided", "needed", "none" |

### Speakers & Partners
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | VARCHAR(100) | No | Industry focus (space, healthcare, etc.) |
| `speakers` | TEXT | No | Comma-separated speaker names |
| `speaker_bios` | TEXT | No | Speaker biographical information |
| `partners` | TEXT | No | Partner organizations/sponsors |
| `resources` | TEXT | No | Links to slides, papers, materials |

## Topic Options
The topic dropdown includes these robotics industry sectors:
- Robots in Space
- Healthcare Robotics
- Defense & Security
- Hospitality & Service
- Manufacturing & Industrial
- Public Safety & Emergency Response
- In-Office Environments
- Education & Training
- Agriculture & Farming
- General Robotics
- Other

## Testing Checklist

After running the database migration:

1. **Create a new event**:
   - Fill in all required fields (title, date, times, venue, address)
   - Select topic: "Healthcare Robotics"
   - Enter speaker: "Dr. Jane Smith"
   - Add bio: "Leading robotics surgeon with 15 years experience"
   - Set food/drinks: "provided"
   - Set AV: "needed"
   - Add curfew: "22:00"
   - Save as draft

2. **Edit the event**:
   - Verify all fields load correctly
   - Update speaker bio
   - Change topic to "Manufacturing"
   - Save changes

3. **Publish the event**:
   - Set status to "Published"
   - Verify event appears on homepage

4. **View on public page**:
   - Click "View Event" 
   - Check if logistics info displays (needs event.html update - see next section)

## Next Steps

### Update Event Display Page (event.html)
To show the new logistics and speaker information on public event pages, event.html needs to be updated with:
- Venue Details section (food, AV, curfew)
- Speakers section (with bios, topics, resources)
- Proper formatting and styling

This update is pending but not required for the admin panel to work.

## Cache Management

JavaScript cache version updated to `?v=8` to force browser reload. If you don't see the new fields:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache for the site
3. Open in incognito/private window to verify

## Backward Compatibility

All new fields are optional/nullable. Events created before this migration will have NULL values for these fields and will continue to work normally.

## Deployment

After running the database migration:

```bash
# From project root
git add .
git commit -m "Add single-day events with venue logistics and speaker tracking"
git push origin main

# Deploy to Fly.io
flyctl deploy
```

Your changes will be live at: https://lv-robotics.fly.dev/admin.html

## Questions?

- Check `PROJECT-SUMMARY.md` for overall system architecture
- Check `EVENT-UPDATES.md` for previous event system changes
- Database schema is in `supabase-events-setup.sql` (original) and migration files
