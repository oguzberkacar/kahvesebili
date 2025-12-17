import { NextResponse } from "next/server";
import { execFile } from "child_process";
import util from "util";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = util.promisify(execFile);

// Raspi 4 Bookworm / libgpiod v2.x
const CHIP = process.env.GPIO_CHIP || "gpiochip0";

// BCM pin aralığı (Pi 4 header: 0-27 en yaygın; ama chip0 0-57)
const MIN_PIN = 0;
const MAX_PIN = 57;

// Güvenli süre aralığı
const MIN_MS = 20;
const MAX_MS = 60_000;

function toInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

/**
 * libgpiod v2 gpioset time arg:
 *  -t 2s,0   (2 saniye HIGH, sonra toggle/release => LOW)
 *  -t 500ms,0
 */
function toGpiosetTimeArg(durationMs: number) {
  const d = clamp(durationMs, MIN_MS, MAX_MS);

  // if (d >= 1000) {
  //   const sec = Math.ceil(d / 1000);
  //   return `${sec}s,0`;
  // }
  return `${d}ms,0`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  console.log("[GPIO API] Received Body:", body);

  const pin = clamp(toInt(body.pin, 17), MIN_PIN, MAX_PIN);
  const duration = clamp(toInt(body.duration, 2000), MIN_MS, MAX_MS);
  const hold = body.hold === true;

  // value: 1 => HIGH pulse, 0 => LOW (force)
  const valueRaw = body.value;
  const hasValue = valueRaw === 0 || valueRaw === 1;
  const value = hasValue ? valueRaw : 1;

  try {
    // DEV / Mac / Windows -> MOCK
    if (process.platform !== "linux") {
      console.log(`[MOCK GPIO] pin=${pin} value=${value} duration=${duration}ms hold=${hold}`);
      return NextResponse.json({
        success: true,
        mocked: true,
        pin,
        value,
        durationMs: hold ? 0 : duration,
        hold,
      });
    }

    // ✅ 1) Instant set (Start/Stop manually without timer if needed)
    // If hold=true OR duration=0, set immediately and exit?
    // For now, if hold is true, we ignore duration.
    if (hold) {
      console.log(`Executing gpioset (HOLD): -c ${CHIP} -t 0s ${pin}=${value}`);
      await execFileAsync("gpioset", ["-c", CHIP, "-t", "0s", `${pin}=${value}`], { timeout: 3000 });
      return NextResponse.json({ success: true, method: "gpioset", chip: CHIP, pin, value, durationMs: 0, hold: true });
    }

    // ✅ 2) Pulse (Timed) logic for BOTH value=1 and value=0
    // If value=0, we pull LOW for duration, then release (toggle).
    const tArg = toGpiosetTimeArg(duration);

    // Force value=1 (Active High) as per user request to ensure pin goes HIGH.
    // Overriding body.value if it was 0 for regular pulse.
    const effectiveValue = 1;

    console.log(`Executing gpioset: -c ${CHIP} -t ${tArg} ${pin}=${effectiveValue}`);
    await execFileAsync("gpioset", ["-c", CHIP, "-t", tArg, `${pin}=${effectiveValue}`], { timeout: duration + 5000 });

    return NextResponse.json({
      success: true,
      method: "gpioset",
      chip: CHIP,
      pin,
      value: 1,
      durationMs: duration,
      timeArg: tArg,
    });
  } catch (error: any) {
    console.error("[GPIO Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to trigger GPIO",
        platform: process.platform,
        hint:
          "If permission denied: add user to gpio group (sudo usermod -aG gpio <user> then relog). " +
          "Also verify chip name (gpiochip0) and BCM pin number.",
      },
      { status: 500 }
    );
  }
}
