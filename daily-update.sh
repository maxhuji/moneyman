#!/bin/bash
# Daily budget dashboard update script

set -e  # Exit on error

MONEYMAN_DIR="/Users/maxhiveurban.com/moneyman2/moneyman"
DASHBOARD_DIR="$MONEYMAN_DIR/dashboard"
LOG_DIR="$MONEYMAN_DIR/logs"
LOG_FILE="$LOG_DIR/daily-update-$(date +%Y-%m-%d).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "=== Daily Update Started: $(date) ===" >> "$LOG_FILE"

# 1. Scrape transactions
echo "Step 1: Scraping transactions..." >> "$LOG_FILE"
cd "$MONEYMAN_DIR"
npm run start >> "$LOG_FILE" 2>&1

# 2. Export CSV and generate budget summary
echo "Step 2: Exporting CSV and generating budget summary..." >> "$LOG_FILE"
cd "$DASHBOARD_DIR"
npm start >> "$LOG_FILE" 2>&1

echo "=== Daily Update Completed: $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep only last 7 days of logs
find "$LOG_DIR" -name "daily-update-*.log" -mtime +7 -delete
