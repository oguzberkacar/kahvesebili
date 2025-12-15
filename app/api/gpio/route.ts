import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pin = body.pin || 14;
  const duration = body.duration || 10000; // 10 seconds default

  console.log(`[GPIO] Request to trigger Pin ${pin} for ${duration}ms`);

  // Simple safe-guard mechanism to run on Mac (Dev) and RPi (Prod)
  // You need to install 'onoff' package: npm install onoff
  try {
    if (process.platform === "linux") {
      // Dynamic require to prevent crashes on Mac during build/dev if 'onoff' is missing or incompatible
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Gpio } = require("onoff");

      if (Gpio.accessible) {
        const gpioPin = new Gpio(pin, "out");

        // Turn ON
        gpioPin.writeSync(1);
        console.log(`[GPIO] Pin ${pin} -> HIGH`);

        // Turn OFF after duration
        setTimeout(() => {
          gpioPin.writeSync(0);
          gpioPin.unexport(); // Release resource
          console.log(`[GPIO] Pin ${pin} -> LOW (Released)`);
        }, duration);
      } else {
        console.warn("[GPIO] GPIO not accessible.");
      }
    } else {
      // Mock for Mac/Windows Development
      console.log(`-----------------------------------------------`);
      console.log(`[MOCK GPIO] SIMULATING PIN ${pin} HIGH (ON)`);
      console.log(`[MOCK GPIO] Will turn off in ${duration}ms...`);

      setTimeout(() => {
        console.log(`[MOCK GPIO] SIMULATING PIN ${pin} LOW (OFF)`);
        console.log(`-----------------------------------------------`);
      }, duration);
    }

    return NextResponse.json({ success: true, message: `Pin ${pin} triggered for ${duration}ms` });
  } catch (error) {
    console.error("[GPIO Error]", error);
    return NextResponse.json({ success: false, error: "Failed to trigger GPIO" }, { status: 500 });
  }
}
