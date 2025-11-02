# 🚀 QUICK DEPLOY GUIDE
**5-Minute Deployment to Production**

---

## ✅ Pre-Flight Check (2 minutes)

```bash
# 1. Verify code changes are in place
grep "DEBUG = false" /Users/leguplabs/Desktop/LV-Robotics/js/main.js
# Should return: const DEBUG = false;

grep -c "debugLog\|debugError" /Users/leguplabs/Desktop/LV-Robotics/js/main.js
# Should return: ~75

# 2. Verify Supabase credentials
grep "SUPABASE_URL\|SUPABASE_ANON_KEY" /Users/leguplabs/Desktop/LV-Robotics/js/main.js | head -2
# Should show: cbgevvuvleuwjjmefjza project URL
```

---

## 🎬 Deploy to Fly.io (2 minutes)

```bash
# Navigate to project
cd /Users/leguplabs/Desktop/LV-Robotics

# Deploy
flyctl deploy --app lv-robotics

# Watch logs (keep terminal open)
flyctl logs -a lv-robotics -f
```

**Expected Output:**
```
✓ Plan created and confirmed
✓ Building image with Docker
✓ Pushing image to fly
✓ Updating app
v123 deployed successfully
```

---

## 🔍 Verify Deployment (1 minute)

```bash
# Check app is running
flyctl status -a lv-robotics

# Test endpoint
curl https://lv-robotics.fly.dev

# Check security headers
curl -I https://lv-robotics.fly.dev | head -15
```

**Verify These Headers Present:**
- ✓ X-Frame-Options
- ✓ X-Content-Type-Options
- ✓ Strict-Transport-Security
- ✓ Content-Security-Policy

---

## 🧪 Quick Test (1 minute)

1. **Open in Browser:** https://lv-robotics.fly.dev
2. **Check:** Page loads and HTTPS shows green lock
3. **DevTools:** Open Console (F12) - should be clean, no errors
4. **Debug Check:** Run `DEBUG` in console - should show `false`
5. **Test Upload:** Try uploading small image
6. **Check Results:** Image should display in bulletin board

---

## ⚠️ Critical: Rotate Credentials (Important!)

**After verifying everything works:**

```bash
# 1. Go to Supabase Dashboard
# https://supabase.com/dashboard/project/cbgevvuvleuwjjmefjza

# 2. Settings → API → Anon Key → Click refresh icon

# 3. Copy new Anon Key

# 4. Update js/main.js line 154
# Edit file and replace with new key

# 5. Commit and redeploy
git add -A
git commit -m "Rotate Supabase anon key after deployment"
flyctl deploy --app lv-robotics
```

---

## 📊 Monitor for 24 Hours

```bash
# Check logs every few hours
flyctl logs -a lv-robotics -n 100

# Watch for:
# ✓ No 5xx errors
# ✓ No auth failures
# ✓ No upload errors
```

---

## 🎯 Done!

Your LV Robotics website is now live at **https://lv-robotics.fly.dev** 🎉

---

## 🆘 If Something Goes Wrong

### Deploy Won't Complete
```bash
# Check logs
flyctl logs -a lv-robotics

# Rollback to previous version
flyctl releases -a lv-robotics
flyctl releases rollback -a lv-robotics
```

### Page Not Loading
```bash
# Restart app
flyctl restart -a lv-robotics

# Force redeploy
flyctl deploy --app lv-robotics --force
```

### Media Upload Fails
1. Check Supabase dashboard
2. Verify `community-media` bucket exists
3. Enable DEBUG: `DEBUG = true` in console
4. Check error message and retry

---

## 📚 For More Details

- **Full Checklist:** `PRODUCTION-DEPLOYMENT-CHECKLIST.md`
- **Testing Guide:** `MEDIA-UPLOAD-TESTING-GUIDE.md`
- **Troubleshooting:** `PRODUCTION-DEPLOYMENT-CHECKLIST.md` → Troubleshooting Section

---

**You're all set! Deploy with confidence! 🚀**