# Household Budget Dashboard

A comprehensive finance monitoring dashboard that tracks household expenses against budget categories.

## Features

- **Automated Data Collection**: Daily scraping of transactions from Israeli banks
- **Smart Categorization**: Automatic categorization of expenses based on keywords
- **Budget Tracking**: Real-time monitoring of budget usage per category
- **Beautiful Dashboard**: Web-based interface with visual progress bars
- **CSV Export**: All data exported to CSV for further analysis

## Setup

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Budget Categories

Edit `budget-config.json` to customize your budget categories and amounts:

```json
{
  "categories": {
    "groceries": {
      "budget": 3000,
      "keywords": ["שופרסל", "רמי לוי", "shufersal"]
    }
  }
}
```

### 3. Build the Project

```bash
npm run build
```

## Usage

### Export Data to CSV

Fetch transactions from Google Sheets and export to CSV:

```bash
npm run export
```

This will:
- Fetch all transactions from your Google Sheet
- Categorize them automatically
- Generate CSV files in `data/transactions-latest.csv`
- Create a budget summary in `data/budget-summary-latest.json`

### Start the Dashboard

Launch the web dashboard:

```bash
npm run dashboard
```

Then open your browser to: `http://localhost:3000`

### Run Complete Daily Pipeline

From the project root:

```bash
./run-daily.sh
```

This will:
1. Scrape new transactions from banks
2. Export data to CSV
3. Refresh the dashboard data

## Automation

### Setup Daily Cron Job

To run the pipeline automatically once per day at 9 AM:

```bash
crontab -e
```

Add this line:

```
0 9 * * * /Users/maxhiveurban.com/moneyman2/run-daily.sh >> /Users/maxhiveurban.com/moneyman2/pipeline.log 2>&1
```

### Using launchd (macOS alternative)

Create a file at `~/Library/LaunchAgents/com.moneyman.daily.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.moneyman.daily</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/maxhiveurban.com/moneyman2/run-daily.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/maxhiveurban.com/moneyman2/pipeline.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/maxhiveurban.com/moneyman2/pipeline-error.log</string>
</dict>
</plist>
```

Then load it:

```bash
launchctl load ~/Library/LaunchAgents/com.moneyman.daily.plist
```

## API Endpoints

The dashboard server exposes these endpoints:

- `GET /api/budget-summary` - Get current month's budget summary
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:category` - Get transactions for a specific category

## File Structure

```
dashboard/
├── data/                           # Generated data files
│   ├── transactions-latest.csv     # Latest transactions
│   ├── budget-summary-latest.json  # Latest budget summary
│   └── transactions-YYYY-MM-DD.csv # Historical snapshots
├── src/
│   ├── csv-exporter.ts            # CSV export logic
│   ├── server.ts                  # Dashboard web server
│   └── index.ts                   # Main entry point
├── public/
│   └── index.html                 # Dashboard UI
├── budget-config.json             # Budget configuration
└── package.json
```

## Budget Categories

The default categories are:

- **Groceries** (₪3,000)
- **Restaurants** (₪1,500)
- **Transportation** (₪800)
- **Utilities** (₪1,200)
- **Shopping** (₪2,000)
- **Healthcare** (₪500)
- **Entertainment** (₪600)
- **Other** (₪1,000)

**Total Monthly Budget: ₪10,600**

## Customization

### Add Keywords to Categories

Edit `budget-config.json` and add keywords to match your transactions:

```json
{
  "categories": {
    "groceries": {
      "budget": 3000,
      "keywords": ["שופרסל", "victory", "am:pm"]
    }
  }
}
```

Keywords are case-insensitive and search in both description and memo fields.

### Change Budget Amounts

Simply modify the `budget` value for any category in `budget-config.json`.

## Troubleshooting

### No data showing in dashboard

1. Make sure you've run `npm run export` at least once
2. Check that the Google Sheets credentials are correct in `.env`
3. Verify that transactions exist in your Google Sheet

### Dashboard not loading

1. Ensure the server is running: `npm run dashboard`
2. Check the console for errors
3. Verify port 3000 is not in use by another application

### Categorization not working

1. Check that keywords match your actual transaction descriptions
2. Keywords are case-insensitive
3. Add more keywords to improve matching
