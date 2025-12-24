#!/usr/bin/env node

import { spawn } from "node:child_process";

const stationId = process.argv[2] ?? "dev";
const appEnv = process.argv[3] ?? "dev";

const child = spawn("npx", ["--no-install", "next", "dev"], {
  stdio: "inherit",
  env: {
    ...process.env,
    APP_ENV: appEnv,
    STATION_ID: stationId,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
