"use client";
import React, { useEffect } from "react";
import KardoraLogo from "./KardoraLogo";
import KardoraMark from "./KardoraMark";

interface SplashOverlayProps {
  onFinish: () => void;
}

export default function SplashOverlay({ onFinish }: SplashOverlayProps) {
  const [barPercentage, setBarPercentage] = React.useState(0);
  const [hasTriggeredZoom, setHasTriggeredZoom] = React.useState(false);
  const [overlayWidth, setOverlayWidth] = React.useState(0);
  const [logoAnimated, setLogoAnimated] = React.useState(false);
  const [logoAnimDuration, setLogoAnimDuration] = React.useState(800);
  const [isZooming, setIsZooming] = React.useState(false);

  // Constants
  const OVERLAY_ANIM_MS = 800;
  const OVERLAY_HOLD_MS = 200;
  const LOGO_ANIM_MS = 800;
  const LOGO_REPEAT_ANIM_MS = 900;
  const LOGO_TO_OVERLAY_DELAY_MS = 300;
  const LOGO_HOLD_MS = 0;
  const LOGO_START_DELAY_MS = 0;
  const OVERLAY_RESTART_DELAY_MS = 700;

  useEffect(() => {
    setBarPercentage(0);

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const initialDelay = setTimeout(() => {
      // 3-5 seconds random duration
      const randomDuration = Math.floor(Math.random() * (5000 - 3000 + 1) + 3000);
      const stepDuration = randomDuration / 100;

      intervalId = setInterval(() => {
        setBarPercentage((prev) => {
          if (prev >= 100) {
            if (intervalId) clearInterval(intervalId);
            return 100;
          }
          return prev + 1;
        });
      }, stepDuration);
    }, 1000);

    return () => {
      clearTimeout(initialDelay);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // When bar creates 100%, trigger zoom
    if (barPercentage >= 100 && !hasTriggeredZoom) {
      setHasTriggeredZoom(true);
      setIsZooming(true);
    }
  }, [barPercentage, hasTriggeredZoom]);

  useEffect(() => {
    if (isZooming) {
      const timer = setTimeout(() => {
        onFinish();
      }, 1000); // Wait for zoom transition
      return () => clearTimeout(timer);
    }
  }, [isZooming, onFinish]);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const runCycle = () => {
      setLogoAnimDuration(LOGO_ANIM_MS);
      setLogoAnimated(true);

      timers.push(
        setTimeout(() => {
          timers.push(
            setTimeout(() => {
              setOverlayWidth(100);

              timers.push(
                setTimeout(() => {
                  setLogoAnimated(false);

                  timers.push(
                    setTimeout(() => {
                      setOverlayWidth(0);
                      setLogoAnimDuration(LOGO_REPEAT_ANIM_MS);
                      setLogoAnimated(true);

                      timers.push(setTimeout(runCycle, OVERLAY_ANIM_MS + OVERLAY_RESTART_DELAY_MS));
                    }, OVERLAY_HOLD_MS)
                  );
                }, OVERLAY_ANIM_MS)
              );
            }, LOGO_TO_OVERLAY_DELAY_MS)
          );
        }, LOGO_ANIM_MS + LOGO_HOLD_MS)
      );
    };

    timers.push(setTimeout(runCycle, LOGO_START_DELAY_MS));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center p-8 transition-opacity duration-1000 ${
        isZooming ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="w-[800px] h-[1280px] text-white flex flex-col items-center justify-center shrink-0 border-4 border-gray-800 shadow-2xl relative">
        {/* Main Content Container */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center gap-10 px-6 transition-opacity duration-500`}
        >
          <div className="flex flex-col items-center gap-12 w-full">
            <div className="flex h-[350px] w-full items-center flex-col justify-center gap-20">
              <div className="relative flex items-center justify-center w-full">
                <div
                  className="relative w-[282px] h-[61px]"
                  style={{
                    transform: logoAnimated ? "rotate(0deg) scale(1)" : "rotate(-15deg) scale(0)",
                    transition: `transform ${logoAnimDuration}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
                    transformOrigin: "center",
                    zIndex: isZooming ? 9999 : 10,
                  }}
                >
                  <KardoraLogo className="block" />
                  <div
                    className="absolute right-[86.57px] bottom-0 mix-blend-difference"
                    style={{
                      transform: isZooming ? "scale(250)" : "scale(1)",
                      transition: isZooming ? "transform 1000ms ease-in-out" : "none",
                      transformOrigin: "center center",
                    }}
                  >
                    <KardoraMark />
                  </div>
                </div>
                <div
                  className={`absolute inset-0 z-50 h-[100px] bg-black pointer-events-none ${
                    isZooming ? "opacity-0" : "opacity-100"
                  }`}
                  style={{
                    width: `${overlayWidth}%`,
                    left: "auto",
                    right: 0,
                    background: "linear-gradient(270deg, black 0%, black 70%, rgba(0, 0, 0, 0) 100%)",
                    transition: `width ${OVERLAY_ANIM_MS}ms linear, opacity 500ms ease-out`,
                  }}
                />
              </div>

              {/* Progress Bar */}
              <div
                className={`transition-opacity duration-500 ${isZooming ? "opacity-0" : "opacity-100"}`}
                style={{
                  width: "260px",
                  height: "10px",
                  borderRadius: "999px",
                  background: "rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.18)",
                }}
              >
                <div
                  style={{
                    width: `${barPercentage}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background:
                      barPercentage === 100 ? "#ffffff" : "linear-gradient(90deg, #ffffff 0%, #e8e8e8 55%, #ffffff 100%)",
                    boxShadow: "0 0 24px rgba(255, 255, 255, 0.4)",
                    transition: "background 200ms ease-out, width 100ms linear, box-shadow 200ms ease-out",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
