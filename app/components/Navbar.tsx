"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Props = {
  backgroundColor?: string;
  textColor?: string;
};

function Navbar({ backgroundColor, textColor }: Props) {
  const [time, setTime] = useState<string>("");

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

  return (
    <div className={`flex absolute right-0 top-0 left-0 items-center justify-between p-4 text-black `}>
      <div
        className={cn(
          "py-5 text-[28px] font-bold leading-10 px-[22px] rounded-full",
          backgroundColor || "bg-black-2",
          textColor || "text-black"
        )}
      >
        {time || ""}
      </div>
      <div
        className={cn(
          "size-20 text-[28px] flex items-center justify-center font-bold leading-10 rounded-full",
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
