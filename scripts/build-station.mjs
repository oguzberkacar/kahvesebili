#!/usr/bin/env node

import { spawn } from "node:child_process";

const stationId = process.argv[2];
const appEnv = process.argv[3] ?? "station";

if (!stationId) {
  console.error("Usage: npm run build:station -- <station-id> [app-env]");
  process.exit(1);
}

console.log(`[Build] Starting build for DEVICE_ID: ${stationId}, APP_ENV: ${appEnv}`);
console.log(`[Build] NEXT_PUBLIC_DEVICE_ID set to: ${stationId}`);

const child = spawn("npx", ["--no-install", "next", "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    APP_ENV: appEnv,
    STATION_ID: stationId,
    NEXT_PUBLIC_DEVICE_ID: stationId,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
