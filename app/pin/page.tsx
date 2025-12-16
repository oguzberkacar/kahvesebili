"use client";
import React, { useState } from "react";
import Link from "next/link";

const PINS = [17];
const DURATIONS = [
  { label: "1s", ms: 1000 },
  { label: "3s", ms: 3000 },
  { label: "5s", ms: 5000 },
  { label: "10s", ms: 10_000 },
];

export default function PinPage() {
  const [selectedPin, setSelectedPin] = useState<number>(PINS[0]);
  const [selectedDuration, setSelectedDuration] = useState<number>(3000);
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const [status, setStatus] = useState<string>("");

  const triggerPin = async ({
    pin,
    durationMs,
    value,
    hold,
  }: {
    pin: number;
    durationMs?: number;
    value?: 0 | 1;
    hold?: boolean;
  }) => {
    setLoadingMap((prev) => ({ ...prev, [pin]: true }));
    setStatus("");

    const duration = durationMs ?? selectedDuration;
    const body = { pin, duration, value, hold };

    try {
      const response = await fetch("/api/gpio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log(`GPIO ${pin} Response:`, data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to trigger pin");
      }

      setStatus(
        value === 0
          ? `Pin ${pin} OFF sent`
          : hold
            ? `Pin ${pin} ON (steady)`
            : `Pin ${pin} ON for ${duration / 1000}s`
      );
    } catch (error) {
      console.error(`GPIO ${pin} Error:`, error);
      alert(`Failed to trigger GPIO ${pin}`);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [pin]: false }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-4xl font-bold text-gray-800">GPIO Control</h1>
      <p className="text-gray-600 text-center max-w-2xl">
        Pin seç, kartı aç, süreyi ya da On/Off eylemini gönder.
      </p>

      <div className="w-full max-w-3xl space-y-4">
        {PINS.map((pin) => {
          const isSelected = selectedPin === pin;

          return (
            <div
              key={pin}
              className={`bg-white border rounded-3xl shadow-lg transition-all overflow-hidden ${
                isSelected ? "border-blue-500 shadow-xl" : "border-slate-200"
              }`}
            >
              <button
                onClick={() => {
                  setSelectedPin(pin);
                }}
                disabled={loadingMap[pin]}
                className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors ${
                  loadingMap[pin]
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : isSelected
                      ? "bg-blue-50 text-blue-800"
                      : "bg-white hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-2xl font-bold">Pin {pin}</p>
                  <p className="text-sm opacity-70">
                    {loadingMap[pin]
                      ? "İşleniyor..."
                      : isSelected
                        ? "Açık - seçenekler aşağıda"
                        : "Detay için tıkla"}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100"
                  }`}
                >
                  {isSelected ? "Seçildi" : "Seç"}
                </span>
              </button>

              <div
                className={`transition-[max-height,opacity] duration-200 ease-out ${
                  isSelected ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {isSelected && (
                  <div className="px-6 pb-6 pt-2 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Süre (otomatik gönderilir)
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {DURATIONS.map(({ label, ms }) => {
                          const active = selectedDuration === ms;
                          return (
                            <button
                              key={label}
                              onClick={() => {
                                setSelectedDuration(ms);
                                triggerPin({
                                  pin,
                                  durationMs: ms,
                                  value: 1,
                                });
                              }}
                              disabled={loadingMap[pin]}
                              className={`py-3 rounded-xl text-lg font-semibold transition-all border ${
                                loadingMap[pin]
                                  ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                                  : active
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                                    : "bg-slate-100 text-gray-800 hover:bg-slate-200 border-slate-200"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        On / Off
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            triggerPin({
                              pin,
                              value: 1,
                              hold: true,
                            })
                          }
                          disabled={loadingMap[pin]}
                          className={`py-3 rounded-xl text-lg font-semibold transition-all border ${
                            loadingMap[pin]
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                              : "bg-blue-600 text-white hover:bg-blue-700 border-blue-500 shadow-md"
                          }`}
                        >
                          On (sabit)
                        </button>
                        <button
                          onClick={() =>
                            triggerPin({
                              pin,
                              value: 0,
                            })
                          }
                          disabled={loadingMap[pin]}
                          className={`py-3 rounded-xl text-lg font-semibold transition-all border ${
                            loadingMap[pin]
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                              : "bg-red-600 text-white hover:bg-red-700 border-red-500 shadow-md"
                          }`}
                        >
                          Off
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {status && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          {status}
        </div>
      )}

      <Link
        href="/"
        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold hover:bg-gray-300 transition-colors"
      >
        Ana Sayfa
      </Link>
    </div>
  );
}
