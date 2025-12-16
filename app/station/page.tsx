"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import KardoraBaseLogo from "../components/KardoraBaseLogo";
import { useStationController } from "../hooks/useStationController";
import CupFrameIcon from "../components/CupFrameIcon";
import IceCube from "../components/IceCube";
import SmokeIcon from "../components/SmokeIcon";
import LiquidSvg from "../components/LiquidSvg";
import { Pause } from "lucide-react";

// Animation Data
const liquidHeights = ["0%", "15%", "90%"];

type IceState = {
  w: string;
  h: string;
  r: number;
  s?: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

type SmokeState = {
  w: string;
  h: string;
  s?: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  opacity?: number;
};

// Smoke Animation Data
const smokeStates: SmokeState[][] = [
  // Step 0: Initial (Low opacity, small)
  [{ w: "30px", h: "35px", s: 0.5, bottom: "10px", left: "142px", opacity: 0 }],
  // Step 1: Rising (Visible)
  [{ w: "30px", h: "35px", s: 1, bottom: "55px", left: "142px", opacity: 0.6 }],
  // Step 2: Full Rise (Higher)
  [{ w: "30px", h: "35px", s: 1.1, bottom: "260px", left: "142px", opacity: 1 }],
];

const iceStates: IceState[][] = [
  // Step 0: Initial (Hidden at bottom / clustered)
  [
    { w: "40.392px", h: "40.392px", r: -30.241, s: 0.1, top: "-72.257px", right: "116.886px" },
    { w: "43.156px", h: "43.156px", r: 20.295, s: 0.1, top: "-79.436px", left: "63.455px" },
    { w: "51.246px", h: "51.246px", r: 55.502, s: 0.1, top: "-126.82px", left: "109.423px" },
    { w: "46.054px", h: "46.054px", r: 35.21, s: 0.1, top: "-126.82px", left: "109.423px" },
    { w: "40.712px", h: "40.712px", r: 103.092, s: 0.1, top: "-132.564px", left: "52px" },
  ],
  // Step 1: Float Up (Middle of cup)
  [
    { w: "40.392px", h: "40.392px", r: 33.14, s: 1, bottom: "31.353px", right: "77.491px" },
    { w: "43.156px", h: "43.156px", r: -0.754, s: 1, bottom: "44.152px", right: "117.155px" },
    { w: "51.246px", h: "51.246px", r: 33.14, s: 1, bottom: "31.818px", left: "87px" },
    { w: "46.054px", h: "46.054px", r: 33.14, s: 1, bottom: "70.081px", right: "74.267px" },
    { w: "40.712px", h: "40.712px", r: 77.258, s: 1, bottom: "76.516px", left: "102.388px" },
  ],
  // Step 2: Float Higher (Top of liquid)
  [
    { w: "40.392px", h: "40.392px", r: -30.241, s: 1, top: "17.744px", right: "61.008px" },
    { w: "43.156px", h: "43.156px", r: 20.295, s: 1, top: "59.385px", right: "88.082px" },
    { w: "51.246px", h: "51.246px", r: 55.502, s: 1, top: "62.077px", left: "90.539px" },
    { w: "46.054px", h: "46.054px", r: 35.21, s: 1, top: "12px", right: "116.679px" },
    { w: "40.712px", h: "40.712px", r: 103.092, s: 1, top: "24.923px", left: "61px" },
  ],
];

// Environment variables
const MQTT_URL = process.env.NEXT_PUBLIC_MQTT_URL || "ws://192.168.1.9:3000";
const STATION_ID = process.env.NEXT_PUBLIC_DEVICE_ID || "station1";

export default function StationPage() {
  const {
    stationState,
    coffeeConfig,
    orders,
    selectedOrderId,
    handleSelectOrder,
    handleStartOrder,
    handleReset,
    connectionState,
  } = useStationController();
  const [animationStep, setAnimationStep] = useState(0);

  // Animation Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (stationState === "PROCESSING") {
      if (animationStep < 2) {
        // Step 0 -> 1: Fast (1s)
        // Step 1 -> 2: Slower for filling (3s)
        const delay = animationStep === 0 ? 1000 : 3500;
        timeout = setTimeout(() => {
          setAnimationStep((prev) => prev + 1);
        }, delay);
      }
    } else {
      setAnimationStep(0);
    }
    return () => clearTimeout(timeout);
  }, [stationState, animationStep]);

  // Not Active / Disconnected View
  if (stationState === "DISCONNECTED" || (!coffeeConfig && stationState === "IDLE")) {
    // ... existing disconnected view ...
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-[600px] h-[1024px] bg-[#1F3933] relative flex flex-col items-center pt-[48px] overflow-hidden shadow-2xl">
          <div className="w-[520px] bg-white rounded-[40px] p-10 flex flex-col items-center text-center opacity-50">
            <div className="w-48 h-48 bg-gray-200 rounded-full mb-4 animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-8">
            <h2 className="text-white text-[32px] font-bold leading-normal">
              We can not serve to
              <br />
              you at moment
            </h2>
          </div>

          <div className="absolute -bottom-[65%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-white rounded-full flex items-start justify-center pt-[8%]">
            <div className="mt-8">
              <KardoraBaseLogo fillColor="#1F3933" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active / Connected View
  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        className={cn(
          "w-[600px] h-[1024px] relative flex flex-col items-center overflow-hidden shadow-2xl transition-all duration-700 ease-in-out",
          stationState === "PROCESSING" ? "bg-[#122824] pt-8" : "bg-[#65E5B4] pt-[48px]"
        )}
      >
        {/* Top Info Card */}
        <div
          className={cn(
            "w-[520px] bg-white rounded-[40px] px-8 flex flex-col items-center text-center shadow-sm z-20 transition-all duration-700 ease-in-out",
            stationState === "PROCESSING" ? "w-[400px] py-4 gap-0" : "py-10 gap-2"
          )}
        >
          <h1
            className={cn(
              "font-bold text-[#1F3933] transition-all duration-700",
              stationState === "PROCESSING" ? "text-2xl" : "text-[40px]"
            )}
          >
            {coffeeConfig.name}
          </h1>

          <div
            className={cn(
              "overflow-hidden w-full transition-all duration-700 ease-in-out",
              stationState === "PROCESSING" ? "max-h-0 opacity-0 mt-0" : "max-h-[500px] opacity-100 mt-2"
            )}
          >
            <h2 className="text-xl font-bold text-[#1F3933] mb-4">{coffeeConfig.roast}</h2>
            <div className="text-[#1F3933] text-lg space-y-1 leading-snug">
              {Object.entries(coffeeConfig.details || {}).map(([key, value]) => (
                <p key={key}>
                  <span className="font-bold">{key}:</span> {String(value)}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Content Area (Swaps between Prompt and Order Queue) */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-8 transition-opacity duration-500 z-10">
          {stationState === "IDLE" && (
            <div className="animate-in fade-in zoom-in duration-500">
              <h2 className="text-[#1F3933] text-[36px] font-bold leading-tight">
                Would you
                <br />
                like a drink?
              </h2>
            </div>
          )}

          {(stationState === "ORDER_RECEIVED" || stationState === "PROCESSING") && orders.length > 0 && (
            <div
              className={cn(
                "flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-500 gap-4 max-h-[400px] overflow-y-auto",
                stationState === "PROCESSING" ? "mt-4" : "mt-0"
              )}
            >
              {orders.map((order) => {
                const isSelected = order.orderId === selectedOrderId;
                const isProcessing = stationState === "PROCESSING" && isSelected;

                // If Processing, hide others? User didn't specify, but space is limited with cup.
                // Let's hide non-processing orders when processing to focus on the cup.
                if (stationState === "PROCESSING" && !isProcessing) return null;

                return (
                  <div
                    key={order.orderId}
                    onClick={() => stationState !== "PROCESSING" && handleSelectOrder(order.orderId)}
                    className={cn(
                      "z-10 overflow-hidden transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-95",
                      isProcessing
                        ? "w-[480px] h-12 rounded-full p-0 bg-white/20"
                        : isSelected
                        ? "w-[480px] bg-white rounded-full p-2 shadow-lg"
                        : "w-[480px] bg-white/40 rounded-full p-2 hover:bg-white/60"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <span className="bg-[#65E5B4] h-full flex items-center px-8 text-lg font-black text-[#1F3933] rounded-l-full">
                          ORDER
                        </span>
                        <span className="flex-1 text-right pr-6 text-xl font-bold text-white">{order.orderId}</span>
                      </>
                    ) : (
                      <>
                        <span
                          className={cn(
                            "rounded-full px-6 py-2 text-xl font-black transition-colors",
                            isSelected ? "bg-[#1F3933] text-white" : "bg-white text-[#1F3933]"
                          )}
                        >
                          ORDER
                        </span>
                        <span className="text-xl font-bold text-[#1F3933] pr-6">{order.orderId}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Cup Placeholder Layer with Ice Cubes & Smoke */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] transition-opacity duration-700 pointer-events-none",
              stationState === "PROCESSING" ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="relative w-[299px] h-[297px] overflow-hidden">
              {/* Liquid Layer Wrapper */}
              <div className="absolute left-[58px] top-[14px] bottom-6 z-0 flex items-end justify-center">
                <LiquidSvg heightRaw={liquidHeights[animationStep]} fill="white" />
              </div>

              {/* Ice Cubes */}
              {coffeeConfig?.tags?.includes("Cold") &&
                iceStates[0].map((_, index) => {
                  const state = iceStates[animationStep][index];
                  const top = state.top ?? `calc(100% - ${state.bottom || "0px"} - ${state.h})`;
                  const left = state.left ?? `calc(100% - ${state.right || "0px"} - ${state.w})`;
                  return (
                    <IceCube
                      key={index}
                      width={state.w}
                      height={state.h}
                      rotation={state.r}
                      scale={state.s ?? 1}
                      style={{ top, left }}
                    />
                  );
                })}

              {/* Smoke (For Hot Drinks) */}
              {!coffeeConfig?.tags?.includes("Cold") && animationStep > 0 && (
                <>
                  <style>
                    {`
                         @keyframes smokeFadeIn {
                           0% { opacity: 0; }
                           100% { opacity: 1; }
                         }
                       `}
                  </style>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 z-10 w-[75px] h-[200px] pointer-events-none transition-all duration-[3000ms] ease-in-out"
                    style={{
                      bottom: smokeStates[Math.min(animationStep, 2)][0].bottom,
                      animation: animationStep === 2 ? "smokeFadeIn 2s ease-in-out" : "none",
                    }}
                  >
                    <SmokeIcon className="w-full h-full" />
                  </div>
                </>
              )}

              {/* Frame on top */}
              <div className="absolute left-[37px] right-[37px] top-3 bottom-3 pointer-events-none z-20">
                <CupFrameIcon />
              </div>
            </div>
          </div>

          {stationState === "COMPLETED" && (
            <div className="animate-in zoom-in fade-in duration-500">
              <h2 className="text-[#1F3933] text-[48px] font-bold leading-tight mb-4">Enjoy!</h2>
              <p className="text-[#1F3933] text-2xl">Your drink is ready.</p>
            </div>
          )}
        </div>

        {/* Bottom Area (Swaps between Logo and Start Button) */}
        <div className="absolute -bottom-[65%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-white rounded-full flex items-start justify-center pt-[8%] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
          <div className="relative mt-8 w-full flex justify-center h-32">
            {/* Logo: Visible when IDLE or COMPLETED */}
            <div
              className={cn(
                "absolute transition-all duration-500 transform",
                stationState === "IDLE" || stationState === "COMPLETED"
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-20 scale-75"
              )}
            >
              <KardoraBaseLogo fillColor="#1F3933" />
            </div>

            {/* Start Button: Visible when ORDER_RECEIVED */}
            {stationState === "ORDER_RECEIVED" && (
              <button
                onClick={handleStartOrder}
                disabled={!selectedOrderId}
                className={cn(
                  "absolute z-10 text-[#AFEADC] text-3xl font-extrabold px-12 py-6 rounded-full shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-20",
                  selectedOrderId
                    ? "bg-[#1F3933] hover:shadow-xl hover:bg-[#152925] active:scale-95"
                    : "bg-[#1F3933]/50 cursor-not-allowed opacity-50"
                )}
              >
                START
              </button>
            )}

            {/* Started Status: Visible when PROCESSING - NOW A STOP BUTTON? Or just text?
                User requested effects, but maybe not the internal flow logic of the other page (3s, 5s).
                The other page had STOP logic. But here status is managed by Master.
                So we can show STOP button if we want to allow aborting locally?
                But actually Master controls the flow.
                Let's stick to showing "PREPARING" or just hiding UI if the cup is there.
                Actually the cup is above.
            */}
            {stationState === "PROCESSING" && (
              <div className="absolute text-[#1F3933] text-3xl font-extrabold animate-pulse">Preparing...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
