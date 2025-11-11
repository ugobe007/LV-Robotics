# LV Robotics Event Management System - Setup Instructions

## 🎯 Overview
You now have a comprehensive event management system with multi-platform publishing capabilities for:
- ✅ SplashThat
- ✅ Meetup (Las Vegas Robotics Meetup)
- ✅ LinkedIn
- ✅ X (Twitter)
- ✅ Facebook

## 📋 Setup Steps

### Step 1: Create Events Database Table
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/tzitghqmrmsxddysxhvc/editor
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the ENTIRE contents of `supabase-events-setup.sql`
5. Click "Run" or press Cmd/Ctrl + Enter
6. Wait for "Success. No rows returned" message

**What this creates:**
- `events` table with 30+ fields including multi-platform publishing tracking
- `event_attendees` table for registration tracking
- Storage bucket `event-images` for event photos
- Auto-slug generation from event titles
- Views for `upcoming_events` and `past_events`
- Full-text search capabilities
- Row Level Security policies

### Step 2: Link Event Management JavaScript (ALREADY DONE)
The file `js/admin-events.js` contains all the event management functions and has been created.

### Step 3: Test the Admin Panel
1. Go to https://lv-robotics.fly.dev/admin.html
2. Sign in with your admin email (ugobe1@mac.com or ugobe07@gmail.com)
3. Click "Events" in the left sidebar
4. Click "Create Event" button

### Step 4: Create Your First Event
Fill in the form:
- **Title**: e.g., "LV Robotics Community Kickoff Meetup"
- **Category**: Choose from workshop, meetup, competition, etc.
- **Short Description**: 1-2 sentences for social media
- **Full Description**: Detailed event information
- **Start/End Date & Time**: Use the datetime pickers
- **Location Type**: In-Person, Virtual, or Hybrid
- **Location Details**: Name and address
- **Registration**: Toggle if required, set max attendees
- **Upload Image**: Optional event banner
- **Contact Info**: Your email and organizer name
- **Status**: Draft (to test) or Published (to go live)
- **Featured**: Check to highlight on homepage

### Step 5: Multi-Platform Publishing
Once your event is saved, use the publishing buttons:

**📢 Multi-Platform Publishing Section:**
1. **SplashThat** 🔵
   - Clicks button → Copies event data → Opens SplashThat
   - Paste the JSON data when creating event

2. **Meetup** 🔴
   - Clicks button → Copies event details → Opens your Meetup group
   - Paste details in event creation form

3. **LinkedIn** 💙
   - Clicks button → Copies post text → Opens LinkedIn share dialog
   - Paste text and add event link

4. **X (Twitter)** ⚫
   - Clicks button → Opens pre-filled tweet with event info
   - Review and post

5. **Facebook** 💙
   - Clicks button → Opens Facebook share dialog
   - Add your commentary and post

**Publishing Status Tracking:**
- The system tracks which platforms you've published to
- Shows checkmarks and counts in the events list
- Stores URLs so you can reference later

## 🔄 Next Steps (Still To Build)

### Event Detail Pages
I'm creating `event.html` which will:
- Show full event details with beautiful layout
- Display event image, date, time, location
- Show registration button/form
- Include social sharing buttons
- Show "Add to Calendar" options (Google, iCal, Outlook)
- Display map for in-person events

### Dynamic Events on Homepage
I'll update `index.html` to:
- Pull events from Supabase instead of hardcoded HTML
- Show next 3 upcoming events
- Link to individual event pages
- Add "View All Events" page

### Events Listing Page
Create `events.html` to show:
- All upcoming events in a grid/list
- Filter by category (workshops, meetups, competitions)
- Search events
- Calendar view option

## 🎨 Features Included

### Event Management
- ✅ Rich event creation form
- ✅ Image uploads to Supabase storage
- ✅ Draft/Published/Cancelled/Completed statuses
- ✅ Featured event highlighting
- ✅ Category & tag system
- ✅ In-person, virtual, hybrid support
- ✅ Registration tracking
- ✅ Max attendee limits

### Multi-Platform Publishing
- ✅ One-click sharing to 5 platforms
- ✅ Pre-filled content for each platform
- ✅ Publishing status tracking
- ✅ URL storage for published events
- ✅ Platform-specific formatting

### Advanced Features
- ✅ Auto-generated URL slugs (SEO-friendly)
- ✅ Full-text search on events
- ✅ Event views and click tracking
- ✅ Attendee registration system
- ✅ Check-in functionality
- ✅ Event metadata for social sharing
- ✅ Timezone support

## 📊 Database Schema Highlights

**Events Table (30+ columns):**
```
- Basic: title, slug, description
- Dates: start_date, end_date, timezone
- Location: location_name, location_address, location_type, virtual_link
- Registration: registration_required, registration_url, max_attendees
- Media: image_url, banner_url, og_image
- Publishing: status, is_featured, publish_date
- Platforms: JSONB field tracking all platform publishing
- SEO: meta_title, meta_description
- Analytics: view_count, click_count
```

**Event Attendees Table:**
```
- Links to events and users
- Status: registered, checked-in, cancelled, waitlist
- Registration timestamp
- Check-in timestamp
```

## 🚀 Ready to Deploy

Once you've completed Step 1 (SQL setup), I'll finish building:
1. Event detail pages (`event.html`)
2. Dynamic events on homepage
3. Full events listing page
4. Calendar integration

Then we'll commit everything and deploy to Fly.io!

## 📝 Notes
- All events are stored in Supabase (cloud database)
- Images stored in Supabase Storage (unlimited uploads)
- RLS policies ensure only admins can create/edit events
- Public can view published events
- Built-in registration system (no external forms needed)
- Tracks publishing across all platforms
- SEO-optimized with meta tags and Open Graph

## ❓ Questions?
Let me know if you need any adjustments to the form, publishing flow, or want to add additional platforms!
