#!/usr/bin/env bash
set -euo pipefail

STATION_ID="${1:-station1}"   # station1 / station2 / ...
APP_ENV="${2:-station}"       # station / master / dev

echo "==> clean & build"
rm -rf .next .deploy_station deploy_station.tar.gz
npm ci
npm run build:station1 -- "${STATION_ID}" "${APP_ENV}"

echo "==> assemble .deploy_station"
mkdir -p .deploy_station

# 1) standalone her şey (GİZLİ .next dahil!) -> .deploy_station
rsync -a .next/standalone/. .deploy_station/.

# 2) STATIC şart: root .next/static -> .deploy_station/.next/static
mkdir -p .deploy_station/.next
rsync -a .next/static/ .deploy_station/.next/static/

# 3) public (bazı assetler burada)
if [ -d public ] && [ ! -d .deploy_station/public ]; then
  rsync -a public/ .deploy_station/public/
fi

echo "==> sanity checks"
test -f .deploy_station/server.js
test -f .deploy_station/.next/BUILD_ID
test -d .deploy_station/.next/static

echo "==> pack"
tar -czf deploy_station.tar.gz .deploy_station
echo "OK => deploy_station.tar.gz hazır"