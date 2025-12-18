"use client";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import useDeviceType from "../hooks/useDeviceType";

interface Sizes {
  small: { price: number; volume: string };
  medium: { price: number; volume: string };
  large: { price: number; volume: string };
}

interface Coffee {
  id: string;
  name: string;
  image: string;
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

interface CoffeeCardProps {
  coffee: Coffee;
}

export default function CoffeeCard({ coffee }: CoffeeCardProps) {
  // Use the minimum price from sizes as the displayed price based on the design pattern "from $X"
  const startPrice = coffee.sizes.small.price;
  const currencySymbol = coffee.currency?.symbol ?? "$";
  const deviceType = useDeviceType();
  return (
    <div
      className={cn(
        "bg-white  w-full  p-3 flex  items-center gap-4 relative active:scale-90 transition-transform duration-200 cursor-pointer",
        deviceType !== "fixed" ? "flex-row rounded-4xl" : "max-w-[360px] rounded-3xl pb-6 flex-col"
      )}
    >
      {/* Image Container */}
      <div className="relative bg-quaternary rounded-[20px] w-full h-[316px] overflow-hidden flex items-center justify-center transform-gpu">
        <Image
          src={coffee.image}
          alt={coffee.name}
          fill
          className="object-cover "
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        <div className="flex absolute left-2 z-50 bottom-2 gap-2">
          {coffee.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full bg-white text-secondary text-xs font-bold uppercase tracking-wide`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex flex-col gap-4.5 items-center  w-full px-3")}>
        {/* Title */}
        <div
          className={cn(
            "flex items-center  justify-between font-extrabold text-secondary text-2xl w-full gap-2",
            deviceType !== "fixed" ? "flex-col md:flex-row" : ""
          )}
        >
          <h3 className="truncate">{coffee.name}</h3>
          <span className="">
            {currencySymbol}
            {startPrice}
          </span>
        </div>

        {/* Short Description (Optional, maybe not on card grid but useful) */}
        <p className="text-secondary text-left font-bold text-xs leading-4.5 line-clamp-2 ">{coffee.description}</p>
      </div>
    </div>
  );
}
