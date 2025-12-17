#!/usr/bin/env node

import { spawn } from 'node:child_process';

const stationId = process.argv[2];
const appEnv = process.argv[3] ?? 'station';

if (!stationId) {
  console.error('Usage: npm run build:station -- <station-id> [app-env]');
  process.exit(1);
}

const child = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    APP_ENV: appEnv,
    STATION_ID: stationId,
  },
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
