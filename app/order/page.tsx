"use client";
import React from "react";
import coffees from "../data/coffees.json";
import CoffeeCard from "../components/CoffeeCard";

export default function OrderPage() {
  return (
    <main className="min-h-screen w-full bg-quaternary flex flex-col items-center">
      {/* Content Grid */}
      <div className="w-full max-w-[800px] px-6 pb-24">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2">
          {coffees.map((coffee) => (
            <CoffeeCard key={coffee.id} coffee={coffee as any} />
          ))}
        </div>
      </div>
    </main>
  );
}
