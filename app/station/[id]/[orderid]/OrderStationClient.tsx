"use client";

import React, { useState } from "react";
import KardoraBaseLogo from "../../../components/KardoraBaseLogo";
import CupFrameIcon from "../../../components/CupFrameIcon";
import { Pause } from "lucide-react";

type Props = {
  coffee: any; // Using any for simplicity as referenced in other files, or could define interface
  displayOrderId: string;
};

export default function OrderStationClient({ coffee, displayOrderId }: Props) {
  const [isStarted, setIsStarted] = useState(false);

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

        {/* Cup Placeholder Layer */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] transition-opacity duration-700 ${
            isStarted ? "opacity-100" : "opacity-0"
          }`}
        >
          <CupFrameIcon />
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
