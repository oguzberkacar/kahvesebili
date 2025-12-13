"use client";

import React, { useState, useEffect } from "react";
import KardoraBaseLogo from "../../../components/KardoraBaseLogo";
import CupFrameIcon from "../../../components/CupFrameIcon";
import IceCube from "../../../components/IceCube";
import { Pause } from "lucide-react";

type Props = {
  coffee: any;
  displayOrderId: string;
};

// Animation Data
const iceStates = [
  // Step 0: Initial (Hidden at bottom / clustered)
  [
    { w: "40.392px", h: "40.392px", r: -16.179, bottom: "10px", left: "40%" },
    { w: "43.156px", h: "43.156px", r: 55.96, bottom: "5px", left: "20%" },
    { w: "51.246px", h: "51.246px", r: -28.98, bottom: "15px", left: "60%" },
    { w: "46.054px", h: "46.054px", r: -51.167, bottom: "8px", left: "30%" },
    { w: "40.712px", h: "40.712px", r: 121.461, bottom: "12px", left: "55%" },
  ],
  // Step 1: Float Up (Middle of cup)
  [
    { w: "40.392px", h: "40.392px", r: 33.14, bottom: "60px", left: "35%" },
    { w: "43.156px", h: "43.156px", r: -0.754, bottom: "85px", left: "15%" },
    { w: "51.246px", h: "51.246px", r: 33.14, bottom: "70px", left: "65%" },
    { w: "46.054px", h: "46.054px", r: 33.14, bottom: "50px", left: "45%" },
    { w: "40.712px", h: "40.712px", r: 77.258, bottom: "90px", left: "55%" },
  ],
  // Step 2: Float Higher (Top of liquid)
  [
    { w: "40.392px", h: "40.392px", r: -30.241, bottom: "140px", left: "40%" },
    { w: "43.156px", h: "43.156px", r: 20.295, bottom: "160px", left: "20%" },
    { w: "51.246px", h: "51.246px", r: 55.502, bottom: "150px", left: "60%" },
    { w: "46.054px", h: "46.054px", r: 35.21, bottom: "135px", left: "30%" },
    { w: "40.712px", h: "40.712px", r: 103.092, bottom: "170px", left: "50%" },
  ],
];

export default function OrderStationClient({ coffee, displayOrderId }: Props) {
  const [isStarted, setIsStarted] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
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
  }, [isStarted]);

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
          <div className="relative w-[231px] h-[276px] overflow-hidden">
            {/* Ice Cubes */}
            {iceStates[0].map((_, index) => {
              const state = iceStates[animationStep][index];
              return (
                <IceCube
                  key={index}
                  width={state.w}
                  height={state.h}
                  rotation={state.r}
                  style={{
                    bottom: state.bottom,
                    left: state.left,
                    // If current step is 0 (initial), render them but maybe below view if needed,
                    // but user said "start bottom then fill up".
                    // The positions I put in Step 0 are low (5-15px).
                  }}
                />
              );
            })}

            {/* Frame on top */}
            <div className="absolute inset-0 pointer-events-none z-20">
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
    </div>
  );
}
