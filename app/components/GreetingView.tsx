"use client";
import React, { useState } from "react";
import KardoraBaseLogo from "./KardoraBaseLogo";
import TransitionRibbon from "./TransitionRibbon";
import ArrowIcon from "./ArrowIcon";
import Navbar from "./Navbar";
import useDeviceType from "../hooks/useDeviceType";
import { cn } from "@/lib/utils";
import SplashOverlay from "./SplashOverlay";
import { useMaster } from "../context/MasterContext";

interface GreetingViewProps {
  onStart: () => void;
}

export default function GreetingView({ onStart }: GreetingViewProps) {
  const [showSplash, setShowSplash] = useState(false);
  const deviceType = useDeviceType();
  const { refreshNetwork } = useMaster();

  return (
    <>
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
      <div className="w-full h-full flex flex-col items-center justify-center bg-secondary relative overflow-hidden">
        {/* Secret Refresh Trigger (Top Left) */}
        <div
          onClick={() => refreshNetwork()}
          className="absolute top-0 left-0 w-24 h-24 z-50 cursor-pointer opacity-0 hover:opacity-5 active:bg-white/20 transition-colors"
          title="Force Network Refresh"
        />
        <Navbar backgroundColor="bg-white-9" textColor="text-fi" />
        <div className="w-full h-full flex flex-col items-center justify-between grow my-8">
          <div className="scale-75 md:scale-100 transition-transform">
            <KardoraBaseLogo />
          </div>
          <div
            className={cn(
              "scale-75 flex flex-col font-extrabold text-fi items-center justify-center text-center md:scale-100 transition-transform",
              deviceType === "fixed" ? "text-[150px] leading-[174px]" : "text-[120px] leading-[124px]"
            )}
          >
            <span>ORDER</span>
            <span>HERE</span>
          </div>
          <div className="relative scale-75 md:scale-100 transition-transform">
            <TransitionRibbon />
            <button
              onClick={onStart}
              className="bg-fi rounded-full h-[206px] w-[206px] absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-xl z-20"
            >
              <ArrowIcon />
            </button>
          </div>
          <div className="scale-75 md:scale-100 transition-transform">
            <span>© 2025 ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </>
  );
}
