"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = {
  backgroundColor?: string;
  textColor?: string;
  blur?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
};

function Navbar({ backgroundColor, textColor, blur, showBackButton, onBack }: Props) {
  const [time, setTime] = useState<string>("00:00 pm");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timezone = process.env.NEXT_PUBLIC_TIMEZONE || "Europe/Istanbul";
      // Format example: 08:45 pm
      const formatted = now
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: timezone,
        })
        .toLowerCase();
      setTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const blurStyle = blur
    ? {
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.00) 100%)",
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)",
      }
    : {};

  return (
    <div
      className={`flex absolute z-50 right-0 top-0 left-0 items-center justify-between p-4 text-black `}
      style={blurStyle}
    >
      <div
        onClick={showBackButton ? onBack : undefined}
        className={cn(
          "h-20 text-[28px] font-bold backdrop-blur-lg leading-10 rounded-full flex items-center justify-center text-center relative overflow-hidden transition-all whitespace-nowrap",
          showBackButton ? "w-20 px-0" : "min-w-[200px] px-[22px]",
          backgroundColor || "bg-black-2",
          textColor || "text-black",
          showBackButton && "cursor-pointer hover:opacity-80"
        )}
      >
        <span
          className={cn(
            "absolute transition-all duration-500 ease-in-out flex items-center justify-center w-full",
            showBackButton ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
          )}
        >
          {time}
        </span>
        <span
          className={cn(
            "absolute transition-all duration-500 ease-in-out flex items-center justify-center w-full",
            showBackButton ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
        >
          <ArrowLeft className="w-8 h-8" />
        </span>
        {/* Placeholder to maintain height if simple absolute positioning removes it, but py-5 handles that mostly. 
            However, absolute elements don't give height. 
            We need an invisible element to hold height/width if not set by padding/min-w.
            min-w handles width. leading-10 + py-5 handles height.
        */}
        <span className="invisible pointer-events-none">{time || "00:00 pm"}</span>
      </div>
      <div
        className={cn(
          "size-20 text-[28px] flex backdrop-blur-lg items-center justify-center font-bold leading-10 rounded-full",
          backgroundColor || "bg-black-2",
          textColor || "text-black"
        )}
      >
        en
      </div>
    </div>
  );
}

export default Navbar;
