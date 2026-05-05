# Dashboard Quick Start Guide

Your household budget dashboard is ready! Here's how to get it running.

## What You've Built

✅ **Automated Data Pipeline**: Scrapes transactions from your Israeli banks daily  
✅ **Smart Categorization**: Auto-categorizes expenses (groceries, restaurants, etc.)  
✅ **Budget Tracking**: Monitors spending against monthly budgets  
✅ **Beautiful Dashboard**: Web interface with visual progress bars  
✅ **CSV Export**: All data saved to CSV files for analysis

## Local Setup (Run on Your Computer)

### 1. Install Dependencies

Already done! But if needed:

```bash
cd /Users/maxhiveurban.com/moneyman2/moneyman/dashboard
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Export Data from Google Sheets

```bash
npm run export
```

This fetches transactions from your Google Sheet, categorizes them, and creates:

- `data/transactions-latest.csv` - All transactions with categories
- `data/budget-summary-latest.json` - Budget vs actual spending

### 4. Start the Dashboard

```bash
npm run dashboard
```

Then open: **http://localhost:3000**

### 5. Run Complete Daily Pipeline

From the moneyman root directory:

```bash
cd /Users/maxhiveurban.com/moneyman2/moneyman
./run-daily.sh
```

This runs all three steps:

1. Scrapes new transactions from banks → Google Sheets
2. Exports data to CSV with categorization
3. Updates dashboard data

## Automate Daily (Local)

### Option 1: Cron (macOS/Linux)

```bash
crontab -e
```

Add this line (runs daily at 9 AM):

```
0 9 * * * /Users/maxhiveurban.com/moneyman2/moneyman/run-daily.sh >> /Users/maxhiveurban.com/moneyman2/moneyman/pipeline.log 2>&1
```

### Option 2: launchd (macOS)

Create `~/Library/LaunchAgents/com.moneyman.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.moneyman.daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/maxhiveurban.com/moneyman2/moneyman/run-daily.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
```

Then:

```bash
launchctl load ~/Library/LaunchAgents/com.moneyman.daily.plist
```

## Deploy to Cloud (Render.com)

Your repository already has `render.yaml` configured!

### Steps:

1. **Go to [render.com](https://render.com)** and sign up

2. **Create a Blueprint**:
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select `maxhuji/moneyman` repository
   - Render will auto-detect the `render.yaml` file

3. **Add Environment Variables**:

   For both services, add:

   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=translate@white-watch-429106-t1.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=<your-key-from-.env>
   GOOGLE_SHEET_ID=1M2iLT_gQI4wojhlRaUyzAThm6quI6rIWZ819FiFNlq8
   WORKSHEET_NAME=Moneyman
   ACCOUNTS_JSON=<your-accounts-from-.env>
   TELEGRAM_API_KEY=<your-key>
   TELEGRAM_CHAT_ID=<your-chat-id>
   DAYS_BACK=180
   ```

4. **Deploy**: Click "Apply" and Render will:
   - Deploy the dashboard web service (free tier)
   - Set up a daily cron job to scrape transactions
   - Give you a public URL like: `https://moneyman-dashboard.onrender.com`

### Important Notes:

- **Free tier sleeps after 15 min** - First load may take 30-60 seconds
- **Data is ephemeral** - Google Sheets is the source of truth
- **Cron runs once daily** at 6 AM UTC (8-9 AM Israel time)

## Customize Budget

Edit `dashboard/budget-config.json`:

```json
{
  "categories": {
    "groceries": {
      "budget": 3000,
      "keywords": ["שופרסל", "רמי לוי", "shufersal"]
    },
    "restaurants": {
      "budget": 1500,
      "keywords": ["מסעדה", "קפה"]
    }
  }
}
```

Then rebuild and restart:

```bash
npm run build
npm run dashboard
```

## Current Budget Setup

- **Groceries**: ₪3,000
- **Restaurants**: ₪1,500
- **Transportation**: ₪800
- **Utilities**: ₪1,200
- **Shopping**: ₪2,000
- **Healthcare**: ₪500
- **Entertainment**: ₪600
- **Other**: ₪1,000

**Total Monthly Budget: ₪10,600**

## Troubleshooting

### "No data available"

Run the export first: `npm run export`

### Dashboard won't start

Check if port 3000 is in use: `lsof -i :3000`

### Categorization not working

Add more keywords to `budget-config.json` matching your transaction descriptions

### Export fails

- Check Google Sheets credentials in `.env`
- Verify the sheet name is "Moneyman"
- Ensure service account has access to the sheet

## Next Steps

1. **Test locally**: Run `./run-daily.sh` to see the full pipeline
2. **View dashboard**: Open http://localhost:3000
3. **Customize budgets**: Edit `budget-config.json` to match your spending
4. **Deploy to cloud**: Use Render.com for 24/7 access
5. **Monitor spending**: Check dashboard regularly to stay on budget!

## Questions?

Check the full documentation in [dashboard/README.md](dashboard/README.md)
