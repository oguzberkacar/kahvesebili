import type { NextConfig } from "next";

const fallbackDeviceId =
  process.env.APP_ENV === "station" ? "station-1" : process.env.APP_ENV === "master" ? "master" : "device";

const nextConfig: NextConfig = {
  env: {
    // Expose device id to client; derive from STATION_ID if provided to avoid double-setting.
    NEXT_PUBLIC_DEVICE_ID:
      process.env.STATION_ID || process.env.NEXT_PUBLIC_DEVICE_ID || fallbackDeviceId,
  },
};

export default nextConfig;
