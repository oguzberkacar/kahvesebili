"use client";
import React, { useState } from "react";
import Link from "next/link";

const PINS = [17];

export default function PinPage() {
  // Track loading state for each pin individually
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  const triggerPin = async (pin: number) => {
    setLoadingMap((prev) => ({ ...prev, [pin]: true }));
    try {
      const response = await fetch("/api/gpio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin, duration: 10000 }), // 10 seconds default
      });

      const data = await response.json();
      console.log(`GPIO ${pin} Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger pin");
      }

      // Optional: don't alert for every click if testing rapidly, or use toast.
      // console.log("Success");
    } catch (error) {
      console.error(`GPIO ${pin} Error:`, error);
      alert(`Failed to trigger GPIO ${pin}`);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [pin]: false }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center gap-12 p-8">
      <h1 className="text-4xl font-bold text-gray-800">GPIO Control Center</h1>

      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
        {PINS.map((pin) => (
          <button
            key={pin}
            onClick={() => triggerPin(pin)}
            disabled={loadingMap[pin]}
            className={`flex flex-col items-center justify-center h-48 rounded-3xl text-3xl font-bold text-white shadow-xl transition-all active:scale-95
              ${loadingMap[pin] ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-2xl"}`}
          >
            <span>Pin {pin}</span>
            <span className="text-sm font-normal opacity-80 mt-2">
              {loadingMap[pin] ? "Triggering..." : "Tap to Trigger (10s)"}
            </span>
          </button>
        ))}
      </div>

      <p className="text-gray-500 text-center">
        Controls Raspberry Pi GPIO pins via <code>/api/gpio</code>.
      </p>

      <Link
        href="/"
        className="mt-8 px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
