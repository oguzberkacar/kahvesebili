"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Re-defining interface locally if needed or import
interface Sizes {
  small: { price: number; volume: string };
  medium: { price: number; volume: string };
  large: { price: number; volume: string };
}

interface CoffeeType {
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

interface Props {
  coffee: CoffeeType;
  onBack: () => void;
}

export default function CoffeeDetail({ coffee, onBack }: Props) {
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("small");
  const [showDetails, setShowDetails] = useState(false);
  const [isPaymentView, setIsPaymentView] = useState(false);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [waitingMethod, setWaitingMethod] = useState<"cash" | "card" | null>(null);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();
  const currencySymbol = coffee.currency?.symbol ?? "$";

  // Payment Simulation Effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isWaitingPayment) {
      // Random duration between 5000ms (5s) and 10000ms (10s)
      const duration = Math.floor(Math.random() * 5000) + 5000;
      timeout = setTimeout(() => {
        // Generate Order ID
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const r1 = letters.charAt(Math.floor(Math.random() * letters.length));
        const r2 = letters.charAt(Math.floor(Math.random() * letters.length));
        const nums = Math.floor(Math.random() * 900000) + 100000;
        setOrderNumber(`#${r1}${r2}${nums}`);

        setIsWaitingPayment(false);
        setWaitingMethod(null);
        setIsPaymentSuccess(true);
      }, duration);
    }
    return () => clearTimeout(timeout);
  }, [isWaitingPayment]);

  const handlePaymentClick = () => {
    setIsPaymentView(true);
    setShowDetails(false); // Ensure details are closed
  };

  const handleMethodClick = (method: "cash" | "card") => {
    if (isWaitingPayment) {
      setIsWaitingPayment(false);
      setWaitingMethod(null);
    } else {
      setWaitingMethod(method);
      setIsWaitingPayment(true);
    }
  };

  const handleBack = () => {
    if (isPaymentSuccess) {
      router.push("/siparis");
    } else if (isWaitingPayment) {
      setIsWaitingPayment(false);
      setWaitingMethod(null);
    } else if (isPaymentView) {
      setIsPaymentView(false);
    } else {
      onBack();
    }
  };

  if (isPaymentSuccess) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col bg-[#65E5B4] text-[#1F3933] font-sans p-6 animate-in fade-in zoom-in duration-500">
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold">Payment Succesfuly</h1>
            <h2 className="text-3xl font-extrabold">Enjoy Your Drink!</h2>
          </div>

          {/* Coffee Summary Card */}
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-2xl font-extrabold text-secondary">{coffee.name}</h3>
              <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-fi text-secondary">
                cold
              </span>
              <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-secondary text-white capitalize">
                {selectedSize}
              </span>
            </div>
            <p className="text-secondary/70 font-medium leading-relaxed">
              A smooth, medium-bodied coffee with hints of forest berries
            </p>
          </div>

          {/* Order Number Pill */}
          <div className="bg-white/30 rounded-full p-2 w-full max-w-sm flex items-center justify-between pl-6 pr-6 py-4">
            <span className="text-xl font-black text-[#1F3933]">ORDER</span>
            <span className="text-xl font-bold text-[#1F3933]">{orderNumber}</span>
          </div>
        </div>

        {/* Bottom Arrow Button */}
        <div className="w-full flex items-center justify-center pb-8">
          <button
            onClick={handleBack}
            className="w-24 h-24 bg-[#1F3933] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col pt-[142px] px-[100px] pb-[100px] justify-between items-center bg-quaternary text-secondary overflow-hidden font-sans">
      {/* Header */}

      {isPaymentView && <div className="font-bold text-xl">Order Summary</div>}

      <div className="flex flex-col items-center w-full  relative justify-center">
        {/* SECTION 1: Top Content (Image + Title) */}
        <div
          className={`w-full flex transition-all duration-700 ease-in-out ${
            isPaymentView ? "flex-row px-8 items-center justify-center gap-6 max-h-[40vh]" : "flex-col items-center px-6"
          }`}
        >
          {/* Image Container */}
          <div
            className="relative rounded-3xl overflow-hidden transition-all duration-700 ease-in-out shrink-0 mb-4"
            style={{
              width: isPaymentView
                ? "140px"
                : selectedSize === "small"
                ? "212px"
                : selectedSize === "medium"
                ? "254px"
                : "296px",
              height: isPaymentView
                ? "200px"
                : selectedSize === "small"
                ? "300px"
                : selectedSize === "medium"
                ? "360px"
                : "420px",
            }}
          >
            <Image src={coffee.imageRaw} alt={coffee.name} fill className="object-contain" priority />
          </div>

          {/* Title & Info Container */}
          <div
            className={`flex flex-col transition-all duration-700 ease-in-out ${
              isPaymentView ? "items-start text-left flex-1" : "items-center text-center w-full mt-2"
            }`}
          >
            <div className={`flex items-center gap-3 ${isPaymentView ? "mb-1" : "mb-2"}`}>
              <h1 className="text-[40px] font-extrabold text-secondary">{coffee.name}</h1>
              {/* Tags inside title line logic */}
              {!isPaymentView &&
                coffee.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-[17px] leading-[24px] font-bold uppercase tracking-wider
                      ${tag === "Cold" ? "bg-fi text-secondary" : "bg-orange-100 text-orange-800"}
                      `}
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* Payment View Specific Info */}
            <div
              className={`flex flex-col gap-2 transition-all duration-500 overflow-hidden ${
                isPaymentView ? "opacity-100 max-h-40" : "opacity-0 max-h-0"
              }`}
            >
              <div className="flex gap-2">
                {coffee.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider
                      ${tag === "Cold" ? "bg-fi text-secondary" : "bg-orange-100 text-orange-800"}
                      `}
                  >
                    {tag}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-secondary text-white">
                  {selectedSize}
                </span>
              </div>

              <p className="text-xs text-secondary/70 font-medium leading-relaxed">{coffee.description}</p>

              <div className="text-4xl font-black text-secondary mt-2">
                {currencySymbol}
                {coffee.sizes[selectedSize].price.toFixed(2)}
              </div>
            </div>

            {/* Default View Description */}
            <div
              className={`transition-all duration-500 overflow-hidden ${
                !isPaymentView ? "opacity-100 max-h-40" : "opacity-0 max-h-0"
              }`}
            >
              <p className="text-center font-sans text-[24px] font-semibold leading-[32px] text-secondary mx-auto">
                {coffee.description}
              </p>
            </div>
          </div>
        </div>

        {/* Accordion + View Detail Button (Hidden in Payment View) */}
        <div
          className={`w-full flex flex-col items-center transition-all duration-500 ease-in-out px-6 ${
            isPaymentView ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-[600px]"
          }`}
        >
          <div
            className={`w-full max-w-sm transition-all duration-300 ease-in-out overflow-hidden ${
              showDetails ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
            }`}
          >
            {/* Roast Label */}
            <div className="mb-4 font-bold text-secondary text-center">{coffee.roast}</div>
            {/* Details Grid */}
            <div className="space-y-4 text-sm">
              {Object.entries(coffee.details).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="font-extrabold text-secondary">
                    {key}: <span className="font-medium text-secondary/80">{value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-full bg-[rgba(0,0,0,0.06)] flex justify-center items-center px-8 py-[18px] text-secondary font-sans text-[24px] font-extrabold leading-[24px] truncate transition-colors hover:bg-black/10 mt-4"
          >
            {showDetails ? "Close Detail" : "View Detail"}
          </button>
          {!isPaymentView && (
            <div className="text-[81px] font-extrabold  text-secondary font-sans overflow-hidden whitespace-nowrap text-ellipsis mb-4 text-center">
              {currencySymbol}
              {coffee.sizes[selectedSize].price.toFixed(2)}
            </div>
          )}
        </div>

        {/* SECTION 2: Bottom Slider Container */}
        <div className="w-full overflow-hidden pb-8 mt-4">
          <div
            className="flex w-[200%] transition-transform duration-700 ease-spring"
            style={{
              transform: isPaymentView ? "translateX(-50%)" : "translateX(0%)",
            }}
          >
            {/* Slide 1: Size & Payment Button */}
            <div className="w-[600px] flex flex-col items-center justify-end ">
              {/* Size Selection */}
              <div className="w-[600px] bg-[#E9E9E9] rounded-full flex items-center relative mb-4">
                <div
                  className="absolute top-0 bottom-0 bg-[#1F3933] rounded-full transition-transform duration-300 ease-out z-0 shadow-sm"
                  style={{
                    width: "calc(100% / 3)",
                    left: "0",
                    transform: `translateX(${
                      selectedSize === "small" ? "0%" : selectedSize === "medium" ? "100%" : "200%"
                    })`,
                  }}
                />
                {(["small", "medium", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex-1 relative z-10 text-center py-[36px] font-extrabold text-[24px] leading-[24px] transition-colors duration-300 capitalize ${
                      selectedSize === size ? "text-white" : "text-black/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePaymentClick}
                className="w-full h-[120px] bg-[#65E5B4] text-[#1F3933] font-black text-[32px] rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Payment</span>
              </button>
            </div>

            {/* Slide 2: Payment Methods & Waiting State */}
            <div className="w-1/2 flex flex-col items-center justify-end px-2">
              <div className="flex flex-col items-center justify-center w-full max-w-xs">
                {/* Title & Spinner */}
                <h3 className="text-2xl font-bold text-secondary mb-6 text-center transition-all duration-300">
                  {isWaitingPayment ? (
                    <span className="flex flex-col items-center gap-4">
                      Waiting
                      <br />
                      Payment Confirmation
                      <span className="relative w-8 h-8 block">
                        <svg
                          className="animate-spin text-secondary opacity-20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        </svg>
                        <svg
                          className="animate-spin text-secondary absolute top-0 left-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            style={{ strokeDasharray: "40 100" }}
                          />
                        </svg>
                      </span>
                    </span>
                  ) : (
                    "Select Payment Method"
                  )}
                </h3>

                <div className="flex w-full h-[160px] relative items-center justify-center">
                  {/* Cash Button */}
                  <button
                    onClick={() => handleMethodClick("cash")}
                    className={`absolute transition-all duration-500 ease-in-out rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#d4d4d4] active:scale-95 overflow-hidden
                          ${
                            isWaitingPayment && waitingMethod === "card"
                              ? "w-0 h-0 opacity-0 pointer-events-none" // Hide if card selected
                              : isWaitingPayment && waitingMethod === "cash"
                              ? "w-full h-20 bg-[#E2E2E2] z-20" // Transform to Cancel style
                              : "w-[calc(50%-8px)] h-full bg-[#E2E2E2] left-0 top-0" // Default Grid pos
                          }
                        `}
                  >
                    <span
                      className={`text-xl font-bold text-secondary transition-all duration-300 ${
                        isWaitingPayment ? "text-2xl" : ""
                      }`}
                    >
                      {isWaitingPayment ? "Cancel" : "Cash"}
                    </span>
                    {!isWaitingPayment && (
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-secondary"
                      >
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                    )}
                  </button>

                  {/* Card Button */}
                  <button
                    onClick={() => handleMethodClick("card")}
                    className={`absolute transition-all duration-500 ease-in-out rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#5cd4a7] active:scale-95 shadow-lg overflow-hidden
                          ${
                            isWaitingPayment && waitingMethod === "cash"
                              ? "w-0 h-0 opacity-0 pointer-events-none" // Hide if cash selected
                              : isWaitingPayment && waitingMethod === "card"
                              ? "w-full h-20 bg-[#E2E2E2] z-20" // Transform to Cancel style (Grey bg to cancel)
                              : "w-[calc(50%-8px)] h-full bg-[#65E5B4] right-0 top-0" // Default Grid pos
                          }
                        `}
                  >
                    <span
                      className={`text-xl font-bold transition-all duration-300 ${
                        isWaitingPayment ? "text-2xl text-secondary" : "text-[#1F3933]"
                      }`}
                    >
                      {isWaitingPayment ? "Cancel" : "Card"}
                    </span>
                    {!isWaitingPayment && (
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1F3933" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
