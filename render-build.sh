#!/usr/bin/env bash
set -e

echo "Building dashboard only..."
cd dashboard
npm install
npm run build
echo "Dashboard build complete!"
