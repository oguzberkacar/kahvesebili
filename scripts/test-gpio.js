const { exec } = require("child_process");

const PIN = 23; // Default test pin (Standard GPIO, usually safe)

console.log(`Starting GPIO Diagnostic for PIN ${PIN}...`);
console.log(`Checking Node Version: ${process.version}`);
console.log(`Platform: ${process.platform} / Arch: ${process.arch}`);

// 1. Try 'onoff'
try {
  console.log("\n[Test 1] Testing 'onoff' library...");
  const { Gpio } = require("onoff");
  if (Gpio.accessible) {
    const p = new Gpio(PIN, "out");
    console.log("  - Successfully initialized Gpio");
    p.writeSync(1);
    console.log("  - Wrote HIGH (1)");
    setTimeout(() => {
      p.writeSync(0);
      console.log("  - Wrote LOW (0)");
      p.unexport();
      console.log("  - [SUCCESS] 'onoff' works!");
    }, 1000);
  } else {
    console.log("  - 'onoff' reports GPIO is not accessible.");
  }
} catch (e) {
  console.error("  - [FAIL] 'onoff' library failed:", e.message);
}

// 2. Try 'pinctrl' (New RPi OS standard)
// pinctrl set <pin> op dh (output driving high)
// pinctrl set <pin> op dl (output driving low)
console.log("\n[Test 2] Testing 'pinctrl' command (RPi 5 / Bookworm)...");
exec(`pinctrl set ${PIN} op dh`, (err, stdout, stderr) => {
  if (err) {
    console.log("  - 'pinctrl' command failed or not found:", err.message);
    // 3. Try 'gpio' (Legacy WiringPi)
    // gpio -g write <pin> 1
    console.log("\n[Test 3] Testing legacy 'gpio' command...");
    exec(`gpio -g mode ${PIN} out && gpio -g write ${PIN} 1`, (err2, stdout2, stderr2) => {
      if (err2) {
        console.log("  - 'gpio' command failed or not found:", err2.message);

        // 4. Try 'gpioset' (libgpiod)
        // gpioset 0 23=1
        console.log("\n[Test 4] Testing 'gpioset' (libgpiod)...");
        exec(`gpioset 0 ${PIN}=1`, (err3) => {
          if (err3) {
            console.log("  - 'gpioset' command failed:", err3.message);
            console.log("\n--- DIAGNOSTIC COMPLETE: All automated attempts failed. Check permissions or Hardware. ---");
          } else {
            console.log("  - [SUCCESS] 'gpioset' worked!");
            // Turn off
            setTimeout(() => exec(`gpioset 0 ${PIN}=0`), 1000);
          }
        });
      } else {
        console.log("  - [SUCCESS] 'gpio' command worked!");
        // Turn off
        setTimeout(() => exec(`gpio -g write ${PIN} 0`), 1000);
      }
    });
  } else {
    console.log("  - [SUCCESS] 'pinctrl' command worked!");
    // Turn off
    setTimeout(() => exec(`pinctrl set ${PIN} op dl`), 1000);
  }
});
