"use client";

import { useEffect, useState } from "react";

export type DeviceType = "fixed" | "responsive";

export default function useDeviceType(): DeviceType {
  // Default to 'fixed' to match original behavior if env is missing
  const [deviceType, setDeviceType] = useState<DeviceType>("fixed");

  useEffect(() => {
    const envValue = process.env.NEXT_PUBLIC_DEVICE_TYPE;
    if (envValue === "responsive") {
      setDeviceType("responsive");
    } else {
      setDeviceType("fixed");
    }
  }, []);

  return deviceType;
}
