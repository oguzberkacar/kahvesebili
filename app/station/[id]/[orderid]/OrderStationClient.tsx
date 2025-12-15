"use client";

import React, { useState, useEffect } from "react";
import KardoraBaseLogo from "../../../components/KardoraBaseLogo";
import CupFrameIcon from "../../../components/CupFrameIcon";
import IceCube from "../../../components/IceCube";
import SmokeIcon from "../../../components/SmokeIcon";
import LiquidSvg from "../../../components/LiquidSvg";
import { Pause, Check } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

type Coffee = {
  name: string;
  origin?: string;
  flavor_notes?: string;
  price?: number;
  roast: string;
  tags?: string[];
  size_options?: string[];
  details?: {
    Region?: string;
    "Flavor Notes"?: string;
  };
  sizes?: {
    small?: { price: number };
    medium?: { price: number };
    large?: { price: number };
  };
  currency?: {
    symbol: string;
  };
};

type Props = {
  coffee: Coffee;
  displayOrderId: string;
};

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

export default function OrderStationClient({ coffee, displayOrderId }: Props) {
  const [isStarted, setIsStarted] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isStarted) {
      if (animationStep < 2) {
        // Determine delay based on current step
        // Step 0 -> 1: Fast (1s)
        // Step 1 -> 2: Slower for filling (3s)
        const delay = animationStep === 0 ? 1000 : 3500;
        timeout = setTimeout(() => {
          setAnimationStep((prev) => prev + 1);
        }, delay);
      } else if (animationStep === 2 && !isReady) {
        // Step 2 Finished -> Wait 2-5s then show Ready Screen
        const randomDelay = Math.random() * 3000 + 2000;
        timeout = setTimeout(() => {
          setIsReady(true);
        }, randomDelay);
      }
    } else {
      setAnimationStep(0);
      setIsReady(false);
    }
    return () => clearTimeout(timeout);
  }, [isStarted, animationStep, isReady]);

  // Data Mapping for UI
  const origin = coffee.origin || coffee.details?.Region || "";
  const flavor = coffee.flavor_notes || coffee.details?.["Flavor Notes"] || "";
  const price = coffee.price || coffee.sizes?.medium?.price || coffee.sizes?.small?.price || 0;
  const currencySymbol = coffee.currency?.symbol || "$";

  let sizeOptions: string[] = coffee.size_options || [];
  if (!coffee.size_options && coffee.sizes) {
    sizeOptions = [];
    if (coffee.sizes.small) sizeOptions.push("S");
    if (coffee.sizes.medium) sizeOptions.push("M");
    if (coffee.sizes.large) sizeOptions.push("L");
  }

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Container Frame */}
      <div
        className={`w-[600px] h-[1024px] relative flex flex-col items-center overflow-hidden shadow-2xl font-sans transition-all duration-700 ease-in-out ${
          isStarted || isReady ? "bg-[#122824] pt-8" : "bg-[#65E5B4] pt-32"
        }`}
      >
        {!isReady ? (
          <>
            {/* Top Logo */}
            <div
              className={`absolute top-10 left-0 w-full flex justify-center scale-75 origin-top z-0 transition-all duration-700 ease-in-out ${
                isStarted ? "opacity-0 translate-y-24" : "opacity-100 translate-y-0"
              }`}
            >
              <KardoraBaseLogo fillColor={isStarted ? "white" : "#1F3933"} />
            </div>

            {/* Info Card - Collapses on Start */}
            {/* Info Card - Collapses on Start */}
            <div
              className={`bg-white rounded-[40px] px-8 flex flex-col items-center text-center shadow-sm z-10 transition-all duration-700 ease-in-out ${
                isStarted ? "w-[400px] py-4 gap-0" : "w-[520px] py-8 gap-2"
              }`}
            >
              <h1
                className={`font-bold text-secondary transition-all duration-700 ${isStarted ? "text-2xl" : "text-[40px]"}`}
              >
                {coffee.name}
              </h1>

              <div
                className={`overflow-hidden w-full transition-all duration-700 ease-in-out ${
                  isStarted ? "max-h-0 opacity-0 mt-0" : "max-h-[500px] opacity-100 mt-2"
                }`}
              >
                <div className="flex justify-between items-start mb-2 mt-4">
                  <div className="text-left">
                    <p className="text-secondary/60 text-lg font-medium">Origin: {origin}</p>
                  </div>
                  <span className="text-4xl font-black text-primary">
                    {currencySymbol}
                    {price}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-2 text-left">
                  <div>
                    <h3 className="text-secondary/40 font-bold text-sm tracking-wider mb-1">ROAST</h3>
                    <p className="text-secondary font-bold text-lg">{coffee.roast}</p>
                  </div>
                  <div>
                    <h3 className="text-secondary/40 font-bold text-sm tracking-wider mb-1">FLAVOR</h3>
                    <p className="text-secondary font-bold text-lg">{flavor}</p>
                  </div>
                  <div>
                    <h3 className="text-secondary/40 font-bold text-sm tracking-wider mb-1">SIZE</h3>
                    <div className="flex gap-2">
                      {sizeOptions.map((size: string) => (
                        <span
                          key={size}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                            size === "L"
                              ? "bg-secondary text-white border-secondary"
                              : "text-secondary/40 border-secondary/20"
                          }`}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-secondary/40 font-bold text-sm tracking-wider mb-1">TOTAL</h3>
                    <p className="text-secondary font-bold text-lg">
                      {currencySymbol} {price}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Number Pill */}
            <div
              className={`mt-4 z-10 overflow-hidden transition-all duration-700 flex items-center justify-between ${
                isStarted ? "w-[480px] h-12 rounded-full p-0 bg-white/20" : "w-[520px] bg-white/30 rounded-full p-2 mt-8"
              }`}
            >
              {isStarted ? (
                <>
                  <span className="bg-[#65E5B4] h-full flex items-center px-8 text-lg font-black text-secondary rounded-l-full">
                    ORDER
                  </span>
                  <span className="flex-1 text-right pr-6 text-xl font-bold text-white">{displayOrderId}</span>
                </>
              ) : (
                <>
                  <span className="bg-white rounded-full px-6 py-2 text-xl font-black text-secondary">ORDER</span>
                  <span className="text-xl font-bold text-secondary pr-6">{displayOrderId}</span>
                </>
              )}
            </div>

            {/* Cup Placeholder Layer with Ice Cubes & Smoke */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] transition-opacity duration-700 ${
                isStarted ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative w-[299px] h-[297px] overflow-hidden">
                {/* Liquid Layer Wrapper */}
                <div className="absolute left-[58px] top-[14px] bottom-6 z-0 flex items-end justify-center">
                  <LiquidSvg heightRaw={liquidHeights[animationStep]} fill="white" />
                </div>

                {/* Ice Cubes */}
                {coffee.tags?.includes("Cold") &&
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
                {!coffee.tags?.includes("Cold") && animationStep > 0 && (
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

            {/* Bottom Arc & Start/Stop Button */}
            <div className="absolute -bottom-[65%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-white rounded-full flex items-start justify-center pt-[8%] transition-transform duration-700">
              {isStarted ? (
                <button
                  onClick={() => setIsStarted(false)}
                  className="mt-8 bg-white border border-gray-200 text-secondary text-3xl font-black py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-wider flex items-center gap-4"
                >
                  STOP
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white">
                    <Pause fill="white" size={16} />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setIsStarted(true)}
                  className="mt-8 bg-white border-2 border-gray-200 text-secondary text-3xl font-black py-4 px-12 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-wider"
                >
                  Start
                </button>
              )}
            </div>
          </>
        ) : (
          /* READY SCREEN OVERLAY */
          <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-700 relative z-50">
            {/* Top Pills */}
            <div className="absolute top-16 flex flex-col items-center w-full gap-4">
              <div className="bg-white rounded-full px-12 py-4 shadow-lg">
                <h1 className="text-3xl font-bold text-[#122824]">{coffee.name}</h1>
              </div>
              <div className="w-[400px] flex items-center justify-between bg-[#7AE1BF] rounded-full p-2 pl-8 pr-8 mt-2 shadow-lg">
                <span className="text-xl font-black text-[#122824]">ORDER</span>
                <span className="text-xl font-black text-[#122824]">{displayOrderId}</span>
              </div>
            </div>

            {/* Center Text */}
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-white leading-tight">
                Your order is ready
                <br />
                for pickup.
              </h2>
            </div>

            {/* Bottom Check Button */}
            <div className="absolute bottom-24">
              <button
                onClick={() => {
                  // Order completed, navigate back to station idle page
                  router.push(`/station/${params.id}`);
                }}
                className="w-32 h-32 rounded-full bg-[#7AE1BF] flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
              >
                <Check className="w-16 h-16 text-white stroke-[4]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
