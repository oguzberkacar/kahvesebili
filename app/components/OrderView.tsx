"use client";
import React, { useState, useEffect } from "react";
import coffees from "../data/coffees.json";
import CoffeeCard from "./CoffeeCard";
import CoffeeDetail from "./CoffeeDetail";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import { useMaster } from "../context/MasterContext";
import useDeviceType from "../hooks/useDeviceType";

interface Sizes {
  small: { price: number; volume: string };
  medium: { price: number; volume: string };
  large: { price: number; volume: string };
}

interface LocalCoffee {
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

interface OrderViewProps {
  onBackToGreeting: () => void;
  isActive: boolean;
}

export default function OrderView({ onBackToGreeting, isActive }: OrderViewProps) {
  const [selectedCoffee, setSelectedCoffee] = useState<LocalCoffee | null>(null);
  const [activeView, setActiveView] = useState<"list" | "detail">("list");
  const [isPaymentView, setIsPaymentView] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // Inactivity Timer
  useEffect(() => {
    // Only run if this view is active
    if (!isActive) return;

    if (typeof window !== "undefined") {
      let timeout: string | number | NodeJS.Timeout | undefined;

      const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          onBackToGreeting();
        }, 30000);
      };

      // Initial start
      resetTimer();

      // Event listeners
      const events = ["click", "mousemove", "touchstart", "scroll", "keydown"];
      events.forEach((event) => window.addEventListener(event, resetTimer));

      // Cleanup
      return () => {
        clearTimeout(timeout);
        events.forEach((event) => window.removeEventListener(event, resetTimer));
      };
    }
  }, [isActive, onBackToGreeting]);

  // Reset state when view becomes inactive
  useEffect(() => {
    if (!isActive) {
      // Allow transition to finish before resetting
      const timer = setTimeout(() => {
        setActiveView("list");
        setSelectedCoffee(null);
        setIsPaymentView(false);
        setIsPaymentSuccess(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Get active stations from Master Context
  const { activeStations } = useMaster();
  const deviceType = useDeviceType();

  const handleCoffeeClick = (coffee: LocalCoffee) => {
    setSelectedCoffee(coffee);
    setActiveView("detail");
  };

  const handleBack = () => {
    if (isPaymentSuccess) {
      onBackToGreeting();
      return;
    }
    if (isPaymentView) {
      setIsPaymentView(false);
      return;
    }
    if (activeView === "detail") {
      setActiveView("list");
      setIsPaymentSuccess(false);
      // Optional: Clear selection after animation
      setTimeout(() => {
        setSelectedCoffee(null);
      }, 500);
      return;
    }
    // If at root list view, go back to greeting
    onBackToGreeting();
  };

  return (
    <div
      className={cn(
        "relative w-full h-full bg-quaternary overflow-hidden flex flex-col transition-opacity duration-500",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
      )}
    >
      <Navbar
        backgroundColor="bg-black-2"
        textColor="text-black"
        blur={activeView === "list"}
        showBackButton={true}
        onBack={handleBack}
      />

      <div
        className="flex flex-1 w-[200%] h-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ transform: activeView === "list" ? "translateX(0)" : "translateX(-50%)" }}
      >
        {/* LIST VIEW */}
        <div className="w-1/2 h-full flex flex-col items-center overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div
            className={cn("w-full px-4 md:px-6 pb-24 pt-32", deviceType === "fixed" ? "max-w-[800px]" : "max-w-7xl mx-auto")}
          >
            <div
              className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", deviceType !== "fixed" ? "gap-4 lg:gap-12" : "gap-4")}
            >
              {coffees.map((coffee) => {
                const isStationActive = activeStations.includes(`station${coffee.stationId}`);
                return (
                  <div
                    key={coffee.id}
                    onClick={() => isStationActive && handleCoffeeClick(coffee as unknown as LocalCoffee)}
                    className={cn(
                      "relative transition-all duration-300",
                      !isStationActive && "bg-white-9 cursor-not-allowed"
                    )}
                  >
                    <CoffeeCard coffee={coffee as unknown as LocalCoffee} />
                    {!isStationActive && (
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

        {/* DETAIL VIEW */}
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
  );
}
