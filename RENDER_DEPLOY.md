# Deploying Moneyman Dashboard to Render.com (Free)

## Prerequisites
- GitHub account (already done ✅)
- Render.com account (free signup)

## Step-by-Step Deployment

### 1. Sign up for Render.com
1. Go to https://render.com
2. Click "Get Started" and sign up with your GitHub account
3. Authorize Render to access your GitHub repositories

### 2. Create a New Web Service
1. From the Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository: **maxhuji/moneyman**
3. Configure the service:
   - **Name**: moneyman-dashboard (or any name you like)
   - **Region**: Frankfurt
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Environment**: Node
   - **Build Command**: `cd dashboard && npm install && npm run build`
   - **Start Command**: `cd dashboard && node dist/server-render.js`
   - **Plan**: Free

### 3. Add Environment Variables
Click "Advanced" and add these environment variables:

#### Required (from Google Sheets):
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: (from your .env file)
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: (from your .env file - **keep the \\n in the value**)
- `GOOGLE_SHEET_ID`: `1M2iLT_gQI4wojhlRaUyzAThm6quI6rIWZ819FiFNlq8`
- `WORKSHEET_NAME`: `Moneyman`

#### Auto-set:
- `PORT`: 10000 (already configured in render.yaml)
- `NODE_ENV`: production (already configured in render.yaml)

### 4. Deploy
1. Click "Create Web Service"
2. Render will start building and deploying (takes 2-3 minutes)
3. Once deployed, you'll get a URL like: `https://moneyman-dashboard.onrender.com`

### 5. Share with Your Partner
Send the URL to your partner! They can access it from anywhere.

## Important Notes

### Free Tier Limitations
- ✅ **Always free**: Web service hosting
- ⏰ **Sleeps after 15 minutes** of inactivity (first request after sleep takes ~30 seconds to wake up)
- 💾 **No persistent storage**: Data is fetched fresh from Google Sheets on each request
- 📊 **Data caching**: Caches data for 30 minutes to avoid excessive Google Sheets API calls

### How It Works
1. When you or your partner visit the dashboard, it fetches data from Google Sheets
2. Data is cached for 30 minutes (subsequent visits in that window are instant)
3. After 15 minutes of no visitors, the service sleeps
4. Next visit wakes it up automatically (takes ~30 seconds first time)

### Manual Refresh
If you want to see brand new data immediately, add `/api/refresh` to your URL:
```
https://your-dashboard-url.onrender.com/api/refresh
```

Then refresh the main page.

## Local Updates (Cron Job)
Your local Mac will continue to:
- Scrape transactions at 8 AM and 8 PM
- Update the Google Sheet
- The cloud dashboard will show the new data automatically on next refresh

## Troubleshooting

### "Failed to fetch budget data"
- Check that environment variables are set correctly in Render dashboard
- Make sure `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` includes the full key with `-----BEGIN PRIVATE KEY-----` header
- Verify the Google Sheet ID is correct

### Dashboard shows old data
- Wait for the 30-minute cache to expire, OR
- Visit `/api/refresh` to force a data refresh

### Service is slow to load
- This is normal after 15 minutes of inactivity (free tier limitation)
- The service is "waking up" - just wait 30 seconds and refresh

## Cost
**$0/month** - Render's free tier is completely free, no credit card required!

## Need Help?
Check Render's logs in the dashboard for error messages.
