"use client";
import React, { useState } from "react";
import coffees from "../data/coffees.json";
import CoffeeCard from "../components/CoffeeCard";
import CoffeeDetail from "../components/CoffeeDetail";
import Navbar from "../components/Navbar";
import { cn } from "@/lib/utils";
import { useMaster } from "../context/MasterContext";

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

  const handleCoffeeClick = (coffee: Coffee) => {
    //...
    setSelectedCoffee(coffee);
    setActiveView("detail");
  };

  const handleBack = () => {
    if (isPaymentView) {
      setIsPaymentView(false);
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
    <main className="min-h-screen w-full bg-white flex items-center justify-center p-0 md:p-8 overflow-auto">
      <div className="w-full h-[100dvh] md:w-[800px] md:h-[1280px] relative bg-quaternary overflow-hidden shrink-0 flex flex-col">
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
            <div className="w-full max-w-[800px] px-4 md:px-6 pb-24 pt-32">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {coffees.map((coffee) => {
                  const isActive = activeStations.includes(`station${coffee.stationId}`);
                  return (
                    <div
                      key={coffee.id}
                      onClick={() => isActive && handleCoffeeClick(coffee as Coffee)}
                      className={cn(
                        "relative transition-all duration-300",
                        !isActive && "opacity-60 grayscale cursor-not-allowed"
                      )}
                    >
                      <CoffeeCard coffee={coffee as Coffee} />
                      {!isActive && (
                        <div className="absolute inset-0 bg-black/5 z-10 rounded-[32px] flex items-center justify-center">
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
