"use client";

import React, { useState, useEffect } from "react";
import KardoraBaseLogo from "../../../components/KardoraBaseLogo";
import CupFrameIcon from "../../../components/CupFrameIcon";
import IceCube from "../../../components/IceCube";
import SmokeIcon from "../../../components/SmokeIcon"; // Import SmokeIcon
import LiquidSvg from "../../../components/LiquidSvg"; // Import LiquidSvg
import { Pause } from "lucide-react";

type Props = {
  coffee: any;
  displayOrderId: string;
};

// Animation Data
// Animation Data
const liquidHeights = ["0%", "15%", "100%"];
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
  [{ w: "30px", h: "35px", s: 1, bottom: "70px", left: "142px", opacity: 0.6 }],
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
  const [manualStep, setManualStep] = useState<number | null>(null);

  useEffect(() => {
    // If manual step is active, ignore auto-play logic
    if (manualStep !== null) {
      setAnimationStep(manualStep);
      return;
    }

    let timers: NodeJS.Timeout[] = [];

    if (isStarted) {
      // Step 1: Wait 1s then move to step 1
      timers.push(setTimeout(() => setAnimationStep(1), 1000));
      // Step 2: Wait 1s (delay) + 1s (transition) => move to step 2
      timers.push(setTimeout(() => setAnimationStep(2), 2500));
    } else {
      setAnimationStep(0);
      timers.forEach((t) => clearTimeout(t));
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [isStarted, manualStep]);

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        className={`w-[600px] h-[1024px] relative flex flex-col items-center pt-8 overflow-hidden shadow-2xl font-sans transition-colors duration-700 ease-in-out ${
          isStarted ? "bg-secondary" : "bg-[#65E5B4]"
        }`}
      >
        {/* Top Logo */}
        <div className="mb-6 scale-75 origin-top relative z-20">
          <div className={`transition-all duration-500`}>
            <KardoraBaseLogo fillColor={isStarted ? "white" : "#1F3933"} />
          </div>
        </div>

        {/* Info Card */}
        <div
          className={`bg-white rounded-[40px] px-8 flex flex-col items-center text-center shadow-sm z-10 transition-all duration-700 ease-in-out ${
            isStarted ? "w-[480px] py-4" : "w-[520px] py-8 gap-2"
          }`}
        >
          {/* Name - Always visible */}
          <h1 className="text-[40px] font-bold text-secondary transition-all">{coffee.name}</h1>

          {/* Collapsible Content */}
          <div
            className={`grid transition-all duration-700 ease-in-out ${
              isStarted ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
              <h2 className="text-xl font-bold text-secondary mb-4">{coffee.roast}</h2>
              <div className="text-secondary text-lg space-y-1.5 leading-snug pb-2">
                <p>
                  <span className="font-bold">Process:</span> {coffee.details.Process}
                </p>
                <p>
                  <span className="font-bold">Region:</span> {coffee.details.Region}
                </p>
                <p>
                  <span className="font-bold">Altitude:</span> {coffee.details.Altitude}
                </p>
                <p>
                  <span className="font-bold">Variety:</span> {coffee.details.Variety}
                </p>
                <p className="pt-2">
                  <span className="font-bold">Flavor Notes:</span> {coffee.details["Flavor Notes"]}
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
              <span className="text-xl font-bold text-secondary">{displayOrderId}</span>
            </>
          )}
        </div>

        {/* Cup Placeholder Layer with Ice Cubes */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] transition-opacity duration-700 ${
            isStarted ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative w-[299px] h-[297px] overflow-hidden">
            {/* Liquid Layer Wrapper */}
            <div className="absolute left-[58px]  top-[14px] bottom-6 z-0 flex items-end justify-center">
              <LiquidSvg heightRaw={liquidHeights[animationStep]} fill="white" />
            </div>

            {/* Ice Cubes */}
            {coffee.tags?.includes("Cold") &&
              iceStates[0].map((_, index) => {
                const state = iceStates[animationStep][index];

                // Normalize positions to top/left to ensure CSS transitions work
                // (CSS cannot transition between 'top' and 'bottom' properties otherwise)
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
            {!coffee.tags?.includes("Cold") &&
              smokeStates[0].map((_, index) => {
                // Determine smoke state. Cycle through states or loop if needed.
                // For simple 3-step animation, we can just use animationStep
                const state = smokeStates[Math.min(animationStep, 2)][index];

                return (
                  <SmokeIcon
                    key={`smoke-${index}`}
                    className="absolute transition-all duration-1000 ease-in-out"
                    style={{
                      width: state.w,
                      height: state.h,
                      top: state.top,
                      left: state.left,
                      right: state.right,
                      bottom: state.bottom,
                      transform: `scale(${state.s ?? 1})`,
                      opacity: state.opacity ?? 1,
                      zIndex: 15, // Below frame (20) but above liquid (0) and potentially above/mix with ice
                    }}
                  />
                );
              })}

            {/* Frame on top */}
            <div className="absolute left-[37px] right-[37px] top-3 bottom-3 pointer-events-none z-20">
              <CupFrameIcon />
            </div>
          </div>
        </div>

        {/* Bottom Arc & Button */}
        <div className="absolute -bottom-[65%] left-1/2 -translate-x-1/2 w-[150%] aspect-square bg-white rounded-full flex items-start justify-center pt-[8%]">
          {isStarted ? (
            // STOP Button
            <button
              onClick={() => setIsStarted(false)}
              className="mt-8 bg-white border border-gray-200 text-secondary text-3xl font-black py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-wider flex items-center gap-4"
            >
              STOP
              {/* Pause circle */}
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white">
                <Pause fill="white" size={16} />
              </div>
            </button>
          ) : (
            // START Button
            <button
              onClick={() => setIsStarted(true)}
              className="mt-8 bg-white border-2 border-gray-200 text-secondary text-3xl font-black py-4 px-12 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-wider"
            >
              Start
            </button>
          )}
        </div>
      </div>
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-black/50 p-2 rounded text-white text-xs backdrop-blur-md">
        <div className="font-bold border-b border-white/20 pb-1 mb-1">Debug Controls</div>
        <div className="flex items-center gap-2">
          <span>Animation:</span>
          {manualStep === null ? (
            <span className="text-green-400 font-bold">Auto</span>
          ) : (
            <span className="text-yellow-400 font-bold">Manual ({manualStep})</span>
          )}
        </div>

        <div className="flex gap-1">
          {[0, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => {
                setManualStep(s);
                setIsStarted(true); // Ensure UI is in started state
              }}
              className={`px-3 py-1.5 rounded transition-colors ${
                manualStep === s ? "bg-blue-600 text-white shadow-inner" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              Step {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setManualStep(null);
            setIsStarted(false); // Reset to initial state
          }}
          className={`w-full px-3 py-1.5 rounded transition-colors mt-1 ${
            manualStep === null ? "bg-red-600 text-white shadow-inner" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Reset / Auto
        </button>
      </div>
    </div>
  );
}
