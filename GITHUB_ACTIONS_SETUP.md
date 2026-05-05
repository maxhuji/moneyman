# GitHub Actions Setup - Automated Scraping (FREE!)

## What This Does:

- ✅ Runs scraper automatically at **6 AM & 6 PM UTC** (8-9 AM & 8-9 PM Israel time)
- ✅ **No Mac needed** - runs in the cloud
- ✅ **100% FREE** (GitHub Actions free tier: 2,000 minutes/month)
- ✅ Updates Google Sheets automatically
- ✅ Can trigger manually anytime from GitHub

## Setup Steps:

### 1. Add Secrets to GitHub Repository

Go to your repository on GitHub:
**https://github.com/maxhuji/moneyman/settings/secrets/actions**

Click **"New repository secret"** for each of these:

#### Secret 1: `ACCOUNTS_JSON`

**Value:** (Copy the entire accounts array from your moneyman.conf.jsonc)

```json
[
  {
    "companyId": "discount",
    "id": "345797393",
    "password": "Sophie2025",
    "num": "Rina1985"
  },
  {
    "companyId": "discount",
    "id": "303463798",
    "password": "columbia246",
    "num": "FIONA9680"
  },
  {
    "companyId": "max",
    "username": "max873411@gmail.com",
    "password": "tammuzi1985"
  },
  {
    "companyId": "max",
    "username": "goldfeld.rina@gmail.com",
    "password": "omepradex1357"
  }
]
```

#### Secret 2: `GOOGLE_SERVICE_ACCOUNT_EMAIL`

**Value:**

```
translate@white-watch-429106-t1.iam.gserviceaccount.com
```

#### Secret 3: `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

**Value:** (The full private key, including header/footer)

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgaoecWRga61XY
... (full key) ...
iniEQAaACAb84XJ6EPJLNTo=
-----END PRIVATE KEY-----
```

#### Secret 4: `GOOGLE_SHEET_ID`

**Value:**

```
1M2iLT_gQI4wojhlRaUyzAThm6quI6rIWZ819FiFNlq8
```

#### Secret 5: `WORKSHEET_NAME`

**Value:**

```
Moneyman
```

#### Secret 6: `TELEGRAM_API_KEY` (optional - for notifications)

**Value:**

```
7536157529:AAG4dvorI1Bti_nxIgXTTT_zfSfaPgiJ5MA
```

#### Secret 7: `TELEGRAM_CHAT_ID` (optional - for notifications)

**Value:**

```
6666355223
```

### 2. Enable GitHub Actions

1. Go to: **https://github.com/maxhuji/moneyman/actions**
2. If you see a message about workflows, click **"I understand my workflows, go ahead and enable them"**

### 3. Push the Workflow File

The workflow file is already created locally. Now push it:

```bash
cd /Users/maxhiveurban.com/moneyman2/moneyman
git add .github/workflows/daily-scraper.yml
git commit -m "Add GitHub Actions workflow for automated scraping"
git push origin main
```

### 4. Test It Manually

Once pushed:

1. Go to: **https://github.com/maxhuji/moneyman/actions**
2. Click on **"Daily Transaction Scraper"** workflow
3. Click **"Run workflow"** → **"Run workflow"** button
4. Watch it run in real-time!

## How to Monitor:

### Email Notifications

GitHub will email you if a workflow fails. To enable:

1. Go to: **https://github.com/settings/notifications**
2. Under "Actions" → Enable **"Send notifications for failed workflows"**

### Check Logs Anytime

1. Visit: **https://github.com/maxhuji/moneyman/actions**
2. Click any workflow run to see detailed logs

### Telegram Notifications (Optional)

If you set up Telegram secrets, you'll get notifications when scraping starts/completes.

## Schedule:

The workflow runs at:

- **6:00 AM UTC** → ~8-9 AM Israel time (depending on DST)
- **6:00 PM UTC** → ~8-9 PM Israel time (depending on DST)

To change the schedule, edit `.github/workflows/daily-scraper.yml`:

```yaml
schedule:
  - cron: "0 6,18 * * *" # Change these numbers
  # Format: 'minute hour day month day-of-week'
  # Example: '0 */6 * * *' = Every 6 hours
```

## Cost:

**FREE!** ✅

- Each run takes ~2 minutes
- 2 runs/day = ~120 minutes/month
- Free tier: 2,000 minutes/month
- You're using only **6%** of your free quota!

## Comparison:

| Method                  | Cost         | Requires Mac On? | Reliability      |
| ----------------------- | ------------ | ---------------- | ---------------- |
| Local Cron              | Free         | ✅ Yes           | Depends on Mac   |
| **GitHub Actions**      | **Free**     | **❌ No**        | **99.9% uptime** |
| Cloud hosting (AWS/etc) | $10-20/month | ❌ No            | 99.9% uptime     |

## Troubleshooting:

### "Workflow failed"

1. Check the logs in GitHub Actions
2. Common issues:
   - Wrong credentials in secrets
   - Bank changed their login page
   - Network timeout

### "Can't see workflow in Actions tab"

- Make sure you pushed the `.github/workflows/daily-scraper.yml` file
- Check that GitHub Actions is enabled for your repo

### "Want to run it now"

- Go to Actions tab
- Click workflow name
- Click "Run workflow" button

## Next Steps After Setup:

1. **Disable local cron** (optional, since your Mac won't always be on):

   ```bash
   crontab -r
   ```

2. **Remove the "Update Budget" app** from Applications (optional)

3. **Enjoy!** Your data updates automatically, even when traveling! ✈️

## Advanced: Custom Schedule

Want more frequent updates? Edit the cron schedule:

```yaml
# Every 4 hours
- cron: "0 */4 * * *"

# Every hour during work hours (8 AM - 8 PM UTC)
- cron: "0 8-20 * * *"

# Only on weekdays at 9 AM and 6 PM UTC
- cron: "0 9,18 * * 1-5"
```

Cron syntax: https://crontab.guru/
