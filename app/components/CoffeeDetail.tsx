"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  isPaymentView: boolean;
  setIsPaymentView: (val: boolean) => void;
  isPaymentSuccess: boolean;
  setIsPaymentSuccess: (val: boolean) => void;
}

export default function CoffeeDetail({
  coffee,
  onBack,
  isPaymentView,
  setIsPaymentView,
  isPaymentSuccess,
  setIsPaymentSuccess,
}: Props) {
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("small");
  const [showDetails, setShowDetails] = useState(false);
  // Removed local isPaymentView state
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [waitingMethod, setWaitingMethod] = useState<"cash" | "card" | null>(null);
  // Removed local isPaymentSuccess state
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();
  const currencySymbol = coffee.currency?.symbol ?? "$";

  // Payment Simulation Effect
  // Payment Simulation Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWaitingPayment) {
      timer = setTimeout(() => {
        setIsWaitingPayment(false);
        setIsPaymentSuccess(true);
        setOrderNumber("#FG" + Math.floor(Math.random() * 89999 + 10000));
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isWaitingPayment, setIsPaymentSuccess]);

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
      <div className="w-full h-full flex flex-col justify-between bg-[#65E5B4] text-[#1F3933] font-sans px-4 pt-[100px] pb-8 md:px-[100px] md:pt-[186px] md:pb-[100px] animate-in fade-in zoom-in duration-500">
        {/* 1. Top Section: Titles */}
        <div className="text-center">
          <h1 className="text-3xl md:text-[48px] font-extrabold leading-tight md:leading-[72px] text-secondary">
            Payment Succesfuly
          </h1>
          <h2 className="text-3xl md:text-[48px] font-extrabold leading-tight md:leading-[72px] text-secondary">
            Enjoy Your Drink!
          </h2>
        </div>

        {/* 2. Middle Section: Card & Order Info */}
        <div className="flex flex-col items-center gap-12 w-full">
          {/* Coffee Summary Card */}
          <div className="bg-white rounded-[32px] p-8 w-full w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-3xl font-extrabold text-secondary">{coffee.name}</h3>
              <span className="px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider bg-fi text-secondary">
                cold
              </span>
              <span className="px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-wider bg-secondary text-white capitalize">
                {selectedSize}
              </span>
            </div>
            <p className="text-secondary/70 text-xl font-medium leading-relaxed">
              A smooth, medium-bodied coffee with hints of forest berries
            </p>
          </div>

          {/* Order Number Pill */}
          <div className="bg-white/30 rounded-full pr-2 w-full max-w-2xl flex items-center justify-between gap-4">
            <span className="bg-white rounded-full px-6 py-4 md:py-5 text-2xl md:text-[42px] font-extrabold leading-[56px] text-secondary shadow-sm">
              ORDER
            </span>
            <span className="text-2xl md:text-[42px] font-extrabold leading-[56px] text-secondary px-4 tracking-wide">
              {orderNumber}
            </span>
          </div>
        </div>

        {/* 3. Bottom Section: Arrow Button */}
        <div className="w-full flex items-center justify-center">
          <button
            onClick={handleBack}
            className="w-[206px] h-[206px] bg-[#18332F] rounded-full flex flex-col items-center justify-center text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="84" height="51" viewBox="0 0 84 51" fill="none">
              <path
                d="M75.5 8.5L42 42.5L8.5 8.5"
                stroke="white"
                strokeWidth="17"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col py-6 px-4 md:py-[50px] md:px-[100px] justify-between items-center bg-quaternary text-secondary overflow-hidden font-sans">
      {/* Header */}

      {/* {isPaymentView && <div className="font-bold text-xl">Order Summary</div>} */}

      <div
        className="flex flex-col items-center w-full relative justify-center h-full transition-all duration-500 ease-in-out"
        style={{ paddingBottom: showDetails ? "0px" : "380px" }}
      >
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
                ? "clamp(120px, 30vw, 212px)"
                : selectedSize === "small"
                ? "clamp(120px, 30vw, 212px)"
                : selectedSize === "medium"
                ? "clamp(140px, 35vw, 254px)"
                : "clamp(160px, 40vw, 296px)",
              height: isPaymentView
                ? "clamp(180px, 40vh, 300px)"
                : selectedSize === "small"
                ? "clamp(180px, 40vh, 300px)"
                : selectedSize === "medium"
                ? "clamp(220px, 50vh, 360px)"
                : "clamp(260px, 60vh, 420px)",
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
            <div className={`flex items-center gap-3 ${isPaymentView ? "mb-1 justify-start" : "mb-2 justify-center"}`}>
              <h1 className="text-3xl md:text-[40px] font-extrabold leading-tight md:leading-[48px] text-secondary">
                {coffee.name}
              </h1>
              <div className="flex gap-2 items-center">
                {coffee.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-md font-bold uppercase tracking-wider
                      ${tag === "Cold" ? "bg-fi text-secondary" : "bg-orange-100 text-orange-800"}
                      ${isPaymentView ? "px-2 py-0.5 text-xs" : "px-2 py-0.5 text-[17px] leading-[24px]"}
                    `}
                  >
                    {tag}
                  </span>
                ))}
                {isPaymentView && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-secondary text-white">
                    {selectedSize}
                  </span>
                )}
              </div>
            </div>

            {/* Payment View Specific Info */}
            <div
              className={`flex flex-col gap-2 transition-all duration-500 overflow-hidden ${
                isPaymentView ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0"
              }`}
            >
              <p className="text-[24px] text-secondary font-semibold leading-[32px] overflow-hidden text-ellipsis line-clamp-2">
                {coffee.description}
              </p>

              <div className="text-5xl md:text-[81px] font-extrabold text-secondary mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
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
              <p className="text-center font-sans text-lg md:text-[24px] font-semibold leading-relaxed md:leading-[32px] text-secondary mx-auto">
                {coffee.description}
              </p>
            </div>
          </div>
        </div>

        {/* Accordion + View Detail Button (Hidden in Payment View) */}
        <div
          className={`w-full flex mt-8 flex-col items-center transition-all duration-500 ease-in-out px-6 ${
            isPaymentView ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 max-h-[600px]"
          }`}
        >
          <div
            className={`w-full max-w-sm transition-all duration-300 ease-in-out overflow-hidden ${
              showDetails ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
            }`}
          >
            {/* Roast Label */}
            <div className="mb-4 text-center font-extrabold text-[24px] leading-[32px] text-secondary truncate">
              {coffee.roast}
            </div>
            {/* Details Grid */}
            <div className="flex flex-col gap-[56px] text-center">
              {Object.entries(coffee.details).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[24px] leading-[32px] text-secondary">
                    <span className="font-extrabold">{key}: </span>
                    <span className="font-bold">{value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-full bg-[rgba(0,0,0,0.06)] flex justify-center items-center px-8 py-[18px] text-secondary font-sans text-[24px] font-extrabold leading-[24px] truncate transition-colors hover:bg-black/10 mt-4 cursor-pointer"
          >
            {showDetails ? "Back" : "View Detail"}
          </button>
        </div>

        {/* SECTION 2: Bottom Slider Container */}
        <div
          className="w-full overflow-hidden pb-8 mt-4 flex flex-col justify-end absolute bottom-0 left-0 z-50 transition-transform duration-500 ease-in-out"
          style={{
            transform: showDetails ? "translateY(120%)" : "translateY(0%)",
          }}
        >
          {!isPaymentView && (
            <div className="flex justify-center items-center mb-4 text-6xl md:text-[81px] font-extrabold leading-[48px] text-secondary font-sans">
              <span className="mr-4">{currencySymbol}</span>
              <div className="h-[72px] md:h-[96px] overflow-hidden relative [--price-height:72px] md:[--price-height:96px]">
                <div
                  className="flex flex-col transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateY(calc(var(--price-height) * -${(["small", "medium", "large"] as const).indexOf(
                      selectedSize
                    )}))`,
                  }}
                >
                  {(["small", "medium", "large"] as const).map((s) => (
                    <div key={s} className="h-[72px] md:h-[96px] flex items-center justify-start">
                      {coffee.sizes[s].price.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPaymentView && (
            <h3
              className={cn(
                "text-[48px] font-extrabold leading-[72px] text-secondary flex justify-center items-center text-center mb-6 transition-all duration-300"
              )}
            >
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
                <span className="text-[48px]  font-extrabold leading-[72px] text-secondary text-center mb-6 transition-all duration-300 w-[422px]">
                  Select Payment Method
                </span>
              )}
            </h3>
          )}

          <div
            className="flex w-[200%] transition-transform duration-700 ease-spring"
            style={{
              transform: isPaymentView ? "translateX(-50%)" : "translateX(0%)",
            }}
          >
            {/* Slide 1: Size & Payment Button */}
            <div className="w-full md:w-[600px] flex flex-col items-center mt-8 justify-end ">
              {/* Size Selection */}
              <div className="w-full md:w-[600px] bg-[#E9E9E9] rounded-full flex items-center relative mb-8">
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
                    className={`flex-1 relative z-10 text-center py-[36px] font-extrabold text-[24px] leading-[24px] transition-colors duration-300 capitalize cursor-pointer ${
                      selectedSize === size ? "text-white" : "text-black/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePaymentClick}
                className="w-full h-[120px] bg-[#65E5B4] text-[#1F3933] font-black text-[32px] rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Payment</span>
              </button>
            </div>

            {/* Slide 2: Payment Methods & Waiting State */}
            <div className="w-1/2 flex flex-col items-center justify-end px-2">
              <div className="flex flex-col items-center justify-center w-full max-w-xs">
                {/* Title & Spinner */}
                <div className="flex w-[600px] h-[284px] relative items-center justify-center">
                  {/* Cash Button */}
                  <button
                    onClick={() => handleMethodClick("cash")}
                    className={`absolute transition-all duration-500 ease-in-out rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#d4d4d4] active:scale-95 overflow-hidden cursor-pointer
                          ${
                            isWaitingPayment && waitingMethod === "card"
                              ? "w-0 h-0 p-0 shadow-none opacity-0 pointer-events-none" // Hide if card selected
                              : isWaitingPayment && waitingMethod === "cash"
                              ? "w-full h-[120px] p-12 bg-[#E2E2E2] z-20" // Transform to Cancel style
                              : "w-[284px] h-full p-12 bg-[#E2E2E2] left-0 top-0" // Default Grid pos
                          }
                        `}
                  >
                    <span
                      className={`text-[40px] font-bold text-secondary transition-all duration-300 ${
                        isWaitingPayment ? "text-[40px]" : ""
                      }`}
                    >
                      {isWaitingPayment ? "Cancel" : "Cash"}
                    </span>
                    {!isWaitingPayment && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="92" height="92" viewBox="0 0 92 92" fill="none">
                        <path
                          d="M8.15385 30.2308C7.31739 30.2308 6.5152 29.8985 5.92374 29.307C5.33228 28.7156 5 27.9134 5 27.0769V8.15385C5 7.31739 5.33228 6.5152 5.92374 5.92374C6.5152 5.33228 7.31739 5 8.15385 5H83.8462C84.6826 5 85.4848 5.33228 86.0763 5.92374C86.6677 6.5152 87 7.31739 87 8.15385V27.0769C87 27.9134 86.6677 28.7156 86.0763 29.307C85.4848 29.8985 84.6826 30.2308 83.8462 30.2308M23.9231 87H68.0769M27.0769 20.7692H64.9231C66.6649 20.7692 68.0769 22.1813 68.0769 23.9231V68.0769C68.0769 69.8187 66.6649 71.2308 64.9231 71.2308H27.0769C25.3351 71.2308 23.9231 69.8187 23.9231 68.0769V23.9231C23.9231 22.1813 25.3351 20.7692 27.0769 20.7692ZM55.4615 46C55.4615 51.2255 51.2255 55.4615 46 55.4615C40.7745 55.4615 36.5385 51.2255 36.5385 46C36.5385 40.7745 40.7745 36.5385 46 36.5385C51.2255 36.5385 55.4615 40.7745 55.4615 46Z"
                          stroke="#18332F"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Card Button */}
                  <button
                    onClick={() => handleMethodClick("card")}
                    className={`absolute transition-all duration-500 ease-in-out rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#5cd4a7] active:scale-95 shadow-lg overflow-hidden cursor-pointer
                          ${
                            isWaitingPayment && waitingMethod === "cash"
                              ? "w-0 h-0 p-0 shadow-none opacity-0 pointer-events-none" // Hide if cash selected
                              : isWaitingPayment && waitingMethod === "card"
                              ? "w-full h-[120px] p-12 bg-[#E2E2E2] z-20" // Transform to Cancel style (Grey bg to cancel)
                              : "w-[284px] h-full p-12 bg-[#65E5B4] right-0 top-0" // Default Grid pos
                          }
                        `}
                  >
                    <span
                      className={`text-[40px] font-bold transition-all duration-300 ${
                        isWaitingPayment ? "text-[40px] text-secondary" : "text-[#1F3933]"
                      }`}
                    >
                      {isWaitingPayment ? "Cancel" : "Card"}
                    </span>
                    {!isWaitingPayment && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="122" height="92" viewBox="0 0 122 92" fill="none">
                        <path
                          d="M5 35.2105H117M82.5385 65.4211H95.4615M13.6154 5H108.385C113.143 5 117 8.86449 117 13.6316V78.3684C117 83.1355 113.143 87 108.385 87H13.6154C8.85724 87 5 83.1355 5 78.3684V13.6316C5 8.86449 8.85724 5 13.6154 5Z"
                          stroke="#18332F"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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
