"use client";
import React from "react";
import Link from "next/link";
import KardoraBaseLogo from "../components/KardoraBaseLogo";
import OrderHereGraphic from "../components/OrderHereGraphic";
import TransitionRibbon from "../components/TransitionRibbon";
import ArrowIcon from "../components/ArrowIcon";
import Reserved from "../components/Reserved";
import SplashOverlay from "../components/SplashOverlay";
import Navbar from "../components/Navbar";
import useDeviceType from "../hooks/useDeviceType";
import { cn } from "@/lib/utils";

export default function SiparisPage() {
  const [showSplash, setShowSplash] = React.useState(true);

  const deviceType = useDeviceType();
  const isFixed = deviceType === "fixed";

  return (
    <>
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
      <main className="min-h-screen w-full bg-white flex items-center justify-center  overflow-auto">
        <div
          className={cn(
            "  relative bg-secondary text-white flex flex-col items-center justify-center shrink-0 md:border-4 border-gray-800 shadow-2xl overflow-hidden",
            isFixed ? "w-[800px] h-[1280px]" : "w-full h-dvh"
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
      </main>
    </>
  );
}
