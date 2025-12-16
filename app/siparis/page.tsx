"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import KardoraBaseLogo from "../components/KardoraBaseLogo";
import OrderHereGraphic from "../components/OrderHereGraphic";
import TransitionRibbon from "../components/TransitionRibbon";
import ArrowIcon from "../components/ArrowIcon";
import Reserved from "../components/Reserved";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SplashOverlay from "../components/SplashOverlay";
import Navbar from "../components/Navbar";
import useDeviceType from "../hooks/useDeviceType";
import { useMaster } from "../context/MasterContext";
import { cn } from "@/lib/utils";

// Debug Component
function DebugOverlay() {
  const [logs, setLogs] = React.useState<string[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      setLogs((prev) => [args.join(" "), ...prev].slice(0, 5));
      originalLog(...args);
    };
    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-[9999] w-64 pointer-events-none font-mono">
      {logs.map((L, i) => (
        <div key={i} className="mb-1 border-b border-white/20 pb-1">
          {L}
        </div>
      ))}
    </div>
  );
}

export default function SiparisPage() {
  const [showSplash, setShowSplash] = React.useState(true);
  const deviceType = useDeviceType();
  const { sendOrder } = useMaster(); // Ensure hook is active

  return (
    <>
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
      <div className="w-full h-screen bg-[#EBEBEB] flex justify-center items-center overflow-hidden relative">
        <DebugOverlay />
        <div
          className={cn(
            "bg-[#EBEBEB] relative flex flex-col items-center shadow-2xl overflow-hidden",
            deviceType === "fixed" ? "w-[800px] h-[1280px]" : "w-full h-full max-w-[800px]"
          )}
        >
          <Navbar backgroundColor="bg-white-9" textColor="text-fi" />
          <div className="w-full h-full flex flex-col items-center justify-center gap-12 md:gap-[135px]">
            <div className="scale-75 md:scale-100 transition-transform">
              <KardoraBaseLogo />
            </div>
            <div className="scale-75 md:scale-100 transition-transform">
              <OrderHereGraphic />
            </div>
            <div className="relative scale-75 md:scale-100 transition-transform">
              <TransitionRibbon />
              <Link
                href={"/order"}
                className="bg-fi rounded-full h-[206px] w-[206px] absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <ArrowIcon />
              </Link>
            </div>
            <div className="scale-75 md:scale-100 transition-transform">
              <Reserved />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
