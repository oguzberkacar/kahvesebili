"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import KardoraBaseLogo from "../components/KardoraBaseLogo";
import { useStationController } from "../hooks/useStationController";

// Environment variables
const MQTT_URL = process.env.NEXT_PUBLIC_MQTT_URL || "ws://192.168.1.9:3000";
const STATION_ID = process.env.NEXT_PUBLIC_DEVICE_ID || "station1";

export default function StationPage() {
  const { stationState, coffeeConfig, activeOrder, handleStartOrder, handleReset, connectionState } = useStationController();

  // Not Active / Disconnected View
  if (stationState === "DISCONNECTED" || (!coffeeConfig && stationState === "IDLE")) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-[600px] h-[1024px] bg-[#1F3933] relative flex flex-col items-center pt-[48px] overflow-hidden shadow-2xl">
          {/* Static Info Card (If we have it locally, we could show it, but logic says wait for config) */}
          {/* Using a generic placeholder or last known config if persisted could be better, but implementing strictly as 'not active' */}

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
      <div className="w-[600px] h-[1024px] bg-[#65E5B4] relative flex flex-col items-center pt-[48px] overflow-hidden shadow-2xl transition-all duration-500">
        {/* Top Info Card */}
        <div className="w-[520px] bg-white rounded-[40px] py-10 px-8 flex flex-col items-center text-center gap-2 shadow-sm transition-transform duration-500">
          <h1 className="text-[40px] font-bold text-[#1F3933]">{coffeeConfig.name}</h1>
          <h2 className="text-xl font-bold text-[#1F3933] mb-4">{coffeeConfig.roast}</h2>

          <div className="text-[#1F3933] text-lg space-y-1 leading-snug">
            {/* Dynamic Details */}
            {Object.entries(coffeeConfig.details || {}).map(([key, value]) => (
              <p key={key}>
                <span className="font-bold">{key}:</span> {String(value)}
              </p>
            ))}
          </div>
        </div>

        {/* Middle Content Area (Swaps between Prompt and Order) */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center px-8 transition-opacity duration-500">
          {stationState === "IDLE" && (
            <div className="animate-in fade-in zoom-in duration-500">
              <h2 className="text-[#1F3933] text-[36px] font-bold leading-tight">
                Would you
                <br />
                like a drink?
              </h2>
            </div>
          )}

          {(stationState === "ORDER_RECEIVED" || stationState === "PROCESSING") && activeOrder && (
            <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-6 w-full max-w-sm">
                <div className="text-2xl font-bold text-[#1F3933] mb-2">New Order</div>
                <div className="text-4xl font-extrabold text-[#1F3933] mb-2">#{activeOrder.orderId}</div>
                <div className="text-xl text-[#1F3933] capitalize">{activeOrder.size} Size</div>
                {/* Price could be looked up if we had full menu here, or passed in order */}
              </div>
            </div>
          )}

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
                className="absolute z-10 bg-[#1F3933] text-[#AFEADC] text-3xl font-extrabold px-12 py-6 rounded-full shadow-lg active:scale-95 transition-all hover:shadow-xl hover:bg-[#152925] animate-in slide-in-from-bottom-20 duration-500"
              >
                START
              </button>
            )}

            {/* Started Status: Visible when PROCESSING */}
            {stationState === "PROCESSING" && (
              <div className="absolute text-[#1F3933] text-3xl font-extrabold animate-pulse">Preparing...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
