#!/bin/bash

# Daily pipeline script for finance monitoring
# This script: (1) scrapes transactions (2) exports to CSV (3) refreshes dashboard

set -e

echo "========================================"
echo "Starting Daily Finance Pipeline"
echo "Time: $(date)"
echo "========================================"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Run moneyman scraper to fetch new transactions
echo ""
echo "[1/3] Fetching new transactions from banks..."
cd "$SCRIPT_DIR/moneyman"
npm run start

# Step 2: Export data to CSV
echo ""
echo "[2/3] Exporting data to CSV..."
cd "$SCRIPT_DIR/dashboard"
npm run export

# Step 3: Dashboard auto-refreshes via API, no action needed
echo ""
echo "[3/3] Data export complete. Dashboard will auto-refresh."

echo ""
echo "========================================"
echo "Pipeline completed successfully!"
echo "Time: $(date)"
echo "========================================"
