"use client";
import React, { useState } from "react";
import useDeviceType from "../hooks/useDeviceType";
import { cn } from "@/lib/utils";
import GreetingView from "../components/GreetingView";
import OrderView from "../components/OrderView";

export default function MasterSPAPage() {
  const [activeView, setActiveView] = useState<"greeting" | "order">("greeting");
  const deviceType = useDeviceType();

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-secondary overflow-hidden">
      <div
        className={cn(
          "relative bg-secondary text-white flex flex-col items-center justify-center overflow-hidden",
          deviceType === "fixed" ? "w-[800px] h-[1280px]" : "w-full h-dvh"
        )}
      >
        {/* Render both views but control visibility/stacking */}

        {/* Greeting View: Visible when activeView is greeting */}
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-500 ease-in-out z-10",
            activeView === "greeting" ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <GreetingView onStart={() => setActiveView("order")} />
        </div>

        {/* Order View: Visible when activeView is order */}
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-500 ease-in-out z-20",
            activeView === "order" ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Only mount or keep active if needed, but keeping it mounted preserves state (scroll pos etc) */}
          <OrderView isActive={activeView === "order"} onBackToGreeting={() => setActiveView("greeting")} />
        </div>
      </div>
    </main>
  );
}
