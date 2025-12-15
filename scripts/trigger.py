import sys
import time

# Check if gpiozero is available (Standard on RPi OS)
try:
    from gpiozero import OutputDevice
    HAS_GPIOZERO = True
except ImportError:
    HAS_GPIOZERO = False

def trigger_pin(pin_num, duration_ms):
    duration_sec = duration_ms / 1000.0
    print(f"[Python] Triggering Pin {pin_num} for {duration_ms}ms")

    try:
        if HAS_GPIOZERO:
            # gpiozero handles RPi 5 / RP1 chip automatically
            device = OutputDevice(pin_num)
            device.on()
            print(f"[Python] Pin {pin_num} HIGH")
            time.sleep(duration_sec)
            device.off()
            device.close()
            print(f"[Python] Pin {pin_num} LOW")
        else:
            # Fallback to lgpio directly if gpiozero missing (unlikely on Desktop image)
            # or RPi.GPIO (Won't work on Pi 5 usually)
            print("[Python] gpiozero not found. Trying lgpio...")
            import lgpio
            h = lgpio.gpiochip_open(0) # Standard chip
            lgpio.gpio_claim_output(h, pin_num)
            lgpio.gpio_write(h, pin_num, 1)
            time.sleep(duration_sec)
            lgpio.gpio_write(h, pin_num, 0)
            lgpio.gpiochip_close(h)
    
    except Exception as e:
        print(f"[Python Error] {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python trigger.py <pin> <duration_ms>")
        sys.exit(1)
    
    pin = int(sys.argv[1])
    dura = float(sys.argv[2])
    trigger_pin(pin, dura)
