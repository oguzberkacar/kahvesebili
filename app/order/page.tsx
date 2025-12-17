"use client";
import React, { useState } from "react";
import coffees from "../data/coffees.json";
import CoffeeCard from "../components/CoffeeCard";
import CoffeeDetail from "../components/CoffeeDetail";
import Navbar from "../components/Navbar";
import { cn } from "@/lib/utils";
import { useMaster } from "../context/MasterContext";
import useDeviceType from "../hooks/useDeviceType";

export interface Sizes {
  small: { price: number; volume: string };
  medium: { price: number; volume: string };
  large: { price: number; volume: string };
}

export interface Coffee {
  id: string;
  stationId: number;
  pin: number;
  name: string;
  image: string;
  imageRaw: string;
  tags: string[];
  description: string;
  roast: string;
  details: {
    Process: string;
    Region: string;
    Altitude: string;
    Variety: string;
    "Flavor Notes": string;
  };
  sizes: Sizes;
  currency?: { symbol: string; code: string };
}

export default function OrderPage() {
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null);
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [isPaymentView, setIsPaymentView] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // Get active stations from Master Context
  const { activeStations } = useMaster();
  const deviceType = useDeviceType();

  const handleCoffeeClick = (coffee: Coffee) => {
    //...
    setSelectedCoffee(coffee);
    setActiveView("detail");
  };

  const handleBack = () => {
    if (isPaymentSuccess) {
      setIsPaymentSuccess(false);
      setIsPaymentView(false);
      setActiveView("list");
      setTimeout(() => {
        setSelectedCoffee(null);
      }, 500);
      return;
    }
    if (isPaymentView) {
      setIsPaymentView(false);
      return;
    }
    setActiveView("list");
    setIsPaymentSuccess(false);
    // Optional: Clear selection after animation
    setTimeout(() => {
      setSelectedCoffee(null);
    }, 500);
  };

  return (
    <main
      className={cn(
        "min-h-screen w-full flex items-center justify-center overflow-auto",
        deviceType === "fixed" ? "p-0 md:p-8 bg-white" : "bg-quaternary p-0 m-0 items-start"
      )}
    >
      <div
        className={cn(
          " relative bg-quaternary overflow-hidden flex flex-col",
          deviceType === "fixed" ? "w-[800px] h-[1280px]" : "w-full h-dvh"
        )}
      >
        {/* Sliding Container */}
        <Navbar
          backgroundColor="bg-black-2"
          textColor="text-black"
          blur={activeView === "list"}
          showBackButton={activeView === "detail" && !isPaymentSuccess}
          onBack={handleBack}
        />
        <div
          className="flex flex-1 w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={{ transform: activeView === "list" ? "translateX(0)" : "translateX(-50%)" }}
        >
          {/* LIST VIEW (Left Half) */}
          <div className="w-1/2 h-full flex flex-col items-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Content Grid */}
            <div
              className={cn(
                "w-full  px-4 md:px-6 pb-24 pt-32",
                deviceType === "fixed" ? "max-w-[800px]" : "max-w-7xl mx-auto"
              )}
            >
              <div
                className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", deviceType !== "fixed" ? "gap-4 lg:gap-12" : "gap-4")}
              >
                {coffees.map((coffee) => {
                  // const isActive = activeStations.includes(`station${coffee.stationId}`);
                  const isActive = true;
                  return (
                    <div
                      key={coffee.id}
                      onClick={() => isActive && handleCoffeeClick(coffee as Coffee)}
                      className={cn(
                        "relative transition-all duration-300",
                        !isActive && "bg-white-9  cursor-not-allowed"
                        // deviceType === "fixed" ? "" : "w-[360px] mx-auto"
                      )}
                    >
                      <CoffeeCard coffee={coffee as Coffee} />
                      {!isActive && (
                        <div className="absolute inset-0 bg-white-8 z-10 rounded-4xl flex items-center justify-center">
                          <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                            DEVICE OFFLINE
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DETAIL VIEW (Right Half) */}
          <div className="w-1/2 h-full bg-quaternary">
            {selectedCoffee ? (
              <CoffeeDetail
                coffee={selectedCoffee}
                onBack={handleBack}
                isPaymentView={isPaymentView}
                setIsPaymentView={setIsPaymentView}
                isPaymentSuccess={isPaymentSuccess}
                setIsPaymentSuccess={setIsPaymentSuccess}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
