# Cloudinary Setup Guide for OnlyArts

## Why Cloudinary?

Currently, your images are saved locally to `backend/uploads/`. This won't work in production because:
- Most hosting platforms (Heroku, Render, Railway) use **ephemeral file systems** - files are deleted on restart
- No redundancy or backups
- Difficult to scale across multiple servers

Cloudinary provides:
- ✅ Permanent cloud storage
- ✅ Automatic image optimization
- ✅ CDN delivery (fast worldwide)
- ✅ Free tier: 25GB storage, 25GB bandwidth/month

---

## Step 1: Create Cloudinary Account

1. Go to **https://cloudinary.com/users/register_free**
2. Sign up with your email (or use Google/GitHub)
3. Choose the **Free Plan** (no credit card required)
4. Verify your email

---

## Step 2: Get Your Credentials

1. After logging in, you'll see your **Dashboard**
2. Look for the **Account Details** section (top of page)
3. You'll see three important values:

```
Cloud Name: your_cloud_name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123
```

4. Click the **👁 Show** button to reveal your API Secret
5. **Copy these values** - you'll need them next

---

## Step 3: Update Your .env File

### For Development (Local Testing):

1. Open `backend/.env`
2. Update the Cloudinary section:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

3. Replace the placeholder values with your actual credentials from Step 2

### For Production:

1. Copy `backend/.env.production` to `backend/.env` (when deploying)
2. Update the same Cloudinary values
3. **NEVER commit .env files to Git!**

---

## Step 4: Test Image Upload

1. Restart your backend server (to load new env variables)
2. Log into your app
3. Try uploading an artwork image or profile picture
4. Check your Cloudinary dashboard - you should see the image appear!

**Expected folder structure in Cloudinary:**
```
onlyarts/
  ├── general/          (profile images, covers)
  ├── artworks/
  │   ├── 1/           (artwork ID 1 images)
  │   ├── 2/           (artwork ID 2 images)
  │   └── ...
```

---

## Step 5: Verify It's Working

### Check 1: Upload Test
- Upload a test artwork with an image
- Go to Cloudinary Dashboard → Media Library
- You should see your image there

### Check 2: Image URLs
- In your database, check the `artwork_media` table
- The `media_url` should be a Cloudinary URL:
  ```
  https://res.cloudinary.com/your_cloud_name/image/upload/...
  ```

### Check 3: Image Display
- View the artwork in your app
- The image should load from Cloudinary (inspect the image URL)

---

## Troubleshooting

### Problem: "Cloudinary upload failed"

**Solution 1:** Check credentials
```bash
# In backend folder
node -e "require('dotenv').config(); console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME)"
```
- Should print your cloud name (not `undefined`)
- If `undefined`, your .env isn't loading properly

**Solution 2:** Restart server
- Changes to .env require server restart
- Kill and restart: `npm start`

### Problem: Images still saving to `uploads/` folder

**Cause:** Cloudinary credentials not set or incorrect

**Solution:**
1. Verify `.env` has correct credentials
2. Check `.env` is in the `backend/` directory (not root)
3. Restart the server

### Problem: "Invalid cloud_name"

**Solution:** Double-check you copied the cloud name correctly from Cloudinary dashboard

---

## Free Tier Limits

Cloudinary Free Plan includes:
- ✅ **25 GB storage**
- ✅ **25 GB bandwidth/month**
- ✅ **25 credits/month** (transformations)
- ✅ Unlimited images

**This is enough for:**
- ~5,000 high-quality artworks (5MB each)
- ~25,000 page views/month with images

If you exceed limits:
- Upgrade to **Plus plan** ($89/month) for 100GB storage
- Or optimize images more aggressively

---

## Production Deployment Checklist

When deploying to production:

1. ✅ Add Cloudinary credentials to production environment variables
2. ✅ Never commit `.env` to Git
3. ✅ Set `NODE_ENV=production`
4. ✅ Test image upload on production
5. ✅ Backup local `uploads/` folder (migration)
6. ✅ (Optional) Migrate existing images to Cloudinary

---

## Migration: Move Existing Images to Cloudinary

If you already have images in `backend/uploads/`, you can migrate them:

### Option 1: Manual Upload
1. Go to Cloudinary Dashboard → Media Library
2. Click "Upload"
3. Drag and drop your local images
4. Update database URLs manually

### Option 2: Automated Migration Script
Want me to create a migration script for you? Let me know!

---

## Security Best Practices

✅ **DO:**
- Keep API Secret in `.env` only
- Add `.env` to `.gitignore`
- Use environment variables in production (Heroku Config Vars, etc.)

❌ **DON'T:**
- Commit credentials to Git
- Share API Secret publicly
- Hardcode credentials in code

---

## Need Help?

Common issues:
1. **"Module 'cloudinary' not found"**
   - Run: `npm install cloudinary` in backend folder

2. **"Unauthorized"**
   - Check API Key and API Secret are correct
   - Make sure you copied the full API Secret (it's long!)

3. **Images not appearing**
   - Check browser console for CORS errors
   - Cloudinary images should work everywhere (CORS-friendly)

---

## Cost Estimate for Growth

| Usage Level | Storage | Bandwidth | Recommended Plan | Cost |
|------------|---------|-----------|------------------|------|
| Starting out | < 10 GB | < 25 GB/mo | Free | $0 |
| Growing | 25-100 GB | 25-100 GB/mo | Plus | $89/mo |
| Popular | 100-500 GB | 100-500 GB/mo | Advanced | $249/mo |

You're currently on **Free** which should be fine for initial launch!

---

## Summary

1. ✅ Sign up at cloudinary.com
2. ✅ Copy Cloud Name, API Key, API Secret
3. ✅ Add to backend/.env
4. ✅ Restart server
5. ✅ Test upload
6. ✅ Deploy!

**Your code is already Cloudinary-ready!** Just add the credentials and you're good to go! 🚀
