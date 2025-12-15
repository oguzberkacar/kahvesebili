import { useCallback } from "react";
import { mqttTopics } from "./topics";
import { PublishMessage, GpioCommandMessage } from "./types";

/**
 * Hook to provide a function that pulses Raspberry Pi pins ON then OFF after a duration.
 *
 * @param publish The publish function from useMqttClient
 * @param deviceId The target device ID (station)
 * @returns A function pulsePins(pins: number[], durationSec: number)
 */
export function usePulsePins(publish: (message: PublishMessage) => Promise<void>, deviceId: string) {
  const pulsePins = useCallback(
    async (pins: number[], durationSec: number) => {
      // Determine the topic for sending commands to the specific station
      const topic = mqttTopics.station(deviceId).command;

      // Construct the payload
      const payload: GpioCommandMessage = {
        type: "gpio_pulse",
        deviceId,
        pins,
        durationSec,
        ts: Date.now(),
      };

      // Publish the command
      await publish({
        topic,
        payload: JSON.stringify(payload),
      });
    },
    [publish, deviceId]
  );

  return pulsePins;
}
