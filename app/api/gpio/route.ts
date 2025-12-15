import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pin = parseInt(body.pin || 14);
  const duration = parseInt(body.duration || 10000);

  console.log(`[GPIO] Request to trigger Pin ${pin} for ${duration}ms`);

  // Helper to run shell command
  const runCommand = async (cmd: string) => {
    try {
      await execAsync(cmd);
      return true;
    } catch (e) {
      console.warn(`[GPIO] Command failed: ${cmd}`, e);
      return false;
    }
  };

  try {
    if (process.platform === "linux") {
      let methodUsed = "none";

      // 1. Try 'onoff' library first
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const onoff = eval("require")("onoff");
        const Gpio = onoff.Gpio;

        if (Gpio.accessible) {
          const gpioPin = new Gpio(pin, "out");
          gpioPin.writeSync(1);
          console.log(`[GPIO] 'onoff' Set Pin ${pin} HIGH`);

          setTimeout(() => {
            gpioPin.writeSync(0);
            gpioPin.unexport();
            console.log(`[GPIO] 'onoff' Set Pin ${pin} LOW`);
          }, duration);

          methodUsed = "onoff";
        }
      } catch (e: any) {
        console.error(`[GPIO] 'onoff' failed (${e.code || e.message}). Trying fallbacks...`);
      }

      // 2. Fallback: 'pinctrl' (RPi 5 / Bookworm)
      if (methodUsed === "none") {
        console.log(`[GPIO] Trying 'pinctrl' fallback...`);
        // op = output, dh = driving high
        const success = await runCommand(`pinctrl set ${pin} op dh`);
        if (success) {
          methodUsed = "pinctrl";
          setTimeout(() => runCommand(`pinctrl set ${pin} op dl`), duration);
        }
      }

      // 3. Fallback: 'gpio' (Legacy / WiringPi)
      if (methodUsed === "none") {
        console.log(`[GPIO] Trying 'gpio' fallback...`);
        // -g = BCM numbering
        const success = await runCommand(`gpio -g mode ${pin} out && gpio -g write ${pin} 1`);
        if (success) {
          methodUsed = "gpio";
          setTimeout(() => runCommand(`gpio -g write ${pin} 0`), duration);
        }
      }

      // 4. Fallback: 'gpioset' (libgpiod)
      if (methodUsed === "none") {
        console.log(`[GPIO] Trying 'gpioset' fallback...`);
        // 0 is usually the chip for main headers on Pi 4/5
        const success = await runCommand(`gpioset 0 ${pin}=1`);
        if (success) {
          methodUsed = "gpioset";
          setTimeout(() => runCommand(`gpioset 0 ${pin}=0`), duration);
        }
      }

      if (methodUsed === "none") {
        throw new Error("All GPIO methods failed (onoff, pinctrl, gpio, gpioset). Check hardware/permissions.");
      }

      return NextResponse.json({ success: true, message: `Pin ${pin} triggered via ${methodUsed}` });
    } else {
      // Mock for Mac/Windows Development
      console.log(`-----------------------------------------------`);
      console.log(`[MOCK GPIO] SIMULATING PIN ${pin} HIGH (ON)`);
      console.log(`[MOCK GPIO] Will turn off in ${duration}ms...`);

      setTimeout(() => {
        console.log(`[MOCK GPIO] SIMULATING PIN ${pin} LOW (OFF)`);
        console.log(`-----------------------------------------------`);
      }, duration);

      return NextResponse.json({ success: true, message: `[MOCK] Pin ${pin} triggered` });
    }
  } catch (error: any) {
    console.error("[GPIO Error]", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to trigger GPIO" }, { status: 500 });
  }
}
