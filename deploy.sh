#!/usr/bin/env bash
set -euo pipefail

# -------- INPUT --------
STATION_ID="${1:-station1}"   # station1 / station2 / station3
APP_ENV="${2:-station}"       # station / master / dev
# -----------------------

# station1 -> 01, station2 -> 02
STATION_NUM="$(echo "$STATION_ID" | sed 's/[^0-9]//g')"
STATION_PADDED="$(printf "%02d" "$STATION_NUM")"

TARGET_HOST="master@station-${STATION_PADDED}.local"
TARGET_PATH="/opt/apps/kahvesebili"

echo "==> target: $TARGET_HOST"

echo "==> clean & build"
rm -rf .next .deploy_station deploy_station.tar.gz

npm ci
echo "Building for DEVICE_ID: $STATION_ID"
npm run build:station -- "$STATION_ID" "$APP_ENV"

echo "==> assemble .deploy_station"
mkdir -p .deploy_station

copy_dir() {
  local src="$1"
  local dst="$2"
  mkdir -p "$dst"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a "$src"/. "$dst"/.
  else
    cp -a "$src"/. "$dst"/
  fi
}

# 1) standalone (gizli .next DAHİL)
copy_dir ".next/standalone" ".deploy_station"

# 2) static (CSS / JS)
mkdir -p .deploy_station/.next
copy_dir ".next/static" ".deploy_station/.next/static"

# 3) public
if [ -d public ] && [ ! -d .deploy_station/public ]; then
  copy_dir "public" ".deploy_station/public"
fi

echo "==> sanity checks"
test -f .deploy_station/server.js
test -f .deploy_station/.next/BUILD_ID
test -d .deploy_station/.next/static

echo "==> pack"
tar -czf deploy_station.tar.gz .deploy_station
echo "✔ deploy_station.tar.gz hazır"

echo "==> SCP"
scp deploy_station.tar.gz "$TARGET_HOST:/tmp/"

echo "==> remote deploy & restart"
ssh "$TARGET_HOST" <<EOF
  set -e
  sudo systemctl stop kahvesebili || true
  rm -rf $TARGET_PATH/.deploy_station
  mkdir -p $TARGET_PATH
  tar -xzf /tmp/deploy_station.tar.gz -C $TARGET_PATH
  sudo systemctl start kahvesebili
  echo "✔ deployed & restarted"
EOF
ssh "$TARGET_HOST" 'sudo systemctl restart kiosk || true'