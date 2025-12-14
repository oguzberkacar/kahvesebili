"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KardoraBaseLogo from "../components/KardoraBaseLogo";
import OrderHereGraphic from "../components/OrderHereGraphic";
import TransitionRibbon from "../components/TransitionRibbon";
import ArrowIcon from "../components/ArrowIcon";
import Reserved from "../components/Reserved";
import SplashOverlay from "../components/SplashOverlay";
import Navbar from "../components/Navbar";

export default function SiparisPage() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <>
      {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
      <main className="min-h-screen w-full bg-white flex items-center justify-center p-8 overflow-auto">
        <div className="w-[800px] h-[1280px] relative bg-secondary text-white flex flex-col items-center justify-center shrink-0 border-4 border-gray-800 shadow-2xl">
          <Navbar backgroundColor="bg-white-9" textColor="text-fi" />
          <div className="w-full h-full flex flex-col  items-center justify-center gap-[135px]">
            <KardoraBaseLogo />
            <OrderHereGraphic />
            <div className="relative ">
              <TransitionRibbon />
              <Link
                href={"/order"}
                className="bg-fi rounded-full h-[206px] w-[206px] absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center"
              >
                <ArrowIcon />
              </Link>
            </div>
            <Reserved />
          </div>
        </div>
      </main>
    </>
  );
}
