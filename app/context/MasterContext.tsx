"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMasterController } from "../hooks/useMasterController";
import useDeviceType from "../hooks/useDeviceType";

type MasterContextType = ReturnType<typeof useMasterController>;

const MasterContext = createContext<MasterContextType | null>(null);

export function MasterProvider({ children }: { children: ReactNode }) {
  // Only initialize controller if we are Master?
  // How do we know if we are master?
  // Env var default role is master in useMasterController logic unless we flag it.
  // Actually useMasterController defaults role="master".
  // AND useStationController defaults role="station".
  // On the Station device, we visit /station.
  // On the Master device, we visit /siparis and /order.
  // We don't want Station device to run Master Logic (listening to all events) just because it's in Layout.
  // We can filter by pathname? Or env var?
  // User said "station mqtt baglanir baglanmaz...". Station is a separate page/app flow.
  // BUT they share the same Next.js app.
  // If I put MasterProvider in RootLayout, it runs on Station too.

  // Checking pathname is one way.
  // Or checking `NEXT_PUBLIC_DEVICE_ID`.
  // Master ID defaults to "master" or similar?
  // In `next.config.ts`, fallback is "master".
  // If `NEXT_PUBLIC_DEVICE_ID` starts with "station", do not run Master Logic.

  const deviceId = process.env.NEXT_PUBLIC_DEVICE_ID || "unknown";
  const isStation = deviceId.startsWith("station");

  const controller = useMasterController({ enabled: !isStation });

  if (isStation) {
    // Don't expose master controller features if we are a station
    // But we must render children
    return <>{children}</>;
  }

  return <MasterContext.Provider value={controller}>{children}</MasterContext.Provider>;
}

export function useMaster() {
  const context = useContext(MasterContext);
  if (!context) {
    // This handles the case where we are on Station device or outside provider
    // Returns dummy functions or throws?
    // Better to return a lightweight fallback to prevent crashes if accidentally used.
    console.warn("useMaster used outside MasterProvider or on Station device");
    return {
      activeStations: [] as string[],
      activeOrders: [] as any[], // fallback
      stationStates: {},
      connectionState: "idle" as const,
      sendOrder: () => console.warn("Cannot send order: Not Master"),
      refreshNetwork: () => console.warn("Cannot refresh: Not Master"),
    };
  }
  return context;
}
