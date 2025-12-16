"use client";
import React, { useState } from "react";
import coffees from "../data/coffees.json";
import CoffeeCard from "../components/CoffeeCard";
import CoffeeDetail from "../components/CoffeeDetail";
import Navbar from "../components/Navbar";

export interface Sizes {
  small: { price: number; volume: string };
  medium: { price: number; volume: string };
  large: { price: number; volume: string };
}

export interface Coffee {
  id: string;
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

  const handleCoffeeClick = (coffee: Coffee) => {
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
                {coffees.map((coffee) => (
                  <div key={coffee.id} onClick={() => handleCoffeeClick(coffee as Coffee)}>
                    {/* Wrapping in div to handle click without refactoring Card props yet, 
                       though better to pass onClick to Card for accessibility. 
                       For now, div wrapper works for the "click anywhere on card" requirement. 
                       User asked for 'card scale down', we'll handle that via Card interaction later or active state.
                   */}
                    <CoffeeCard coffee={coffee as Coffee} />
                  </div>
                ))}
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
