#!/usr/bin/env node

import { spawn } from "node:child_process";

const stationId = process.argv[2] ?? "dev";
const appEnv = process.argv[3] ?? "dev";
const port = process.argv[4];

const args = ["next", "dev"];
if (port) {
  args.push("-p", port);
}

const child = spawn("npx", args, {
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
