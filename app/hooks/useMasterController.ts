"use client";

import { useEffect, useCallback } from "react";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import { mqttTopics } from "../lib/mqtt/topics";
import type { IncomingMessage } from "../lib/mqtt/types";
import { getMqttConfigFromEnv } from "../lib/mqtt/config";
import coffees from "../data/coffees.json";

// We assume Master is unique, role='master'
const MQTT_URL = process.env.NEXT_PUBLIC_MQTT_URL || "ws://192.168.1.9:3000";

export function useMasterController() {
  const envConfig = getMqttConfigFromEnv();

  const {
    client,
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    role: "master", // Enforce role
    clientId: "master-screen", // Override client ID to distinguish from station config if default matches?
    // Actually, getting ID from env might be better to avoid conflict if multiple tabs.
    // But keeping "master-screen" as fixed ID for the controller seems safe for now.
  });

  // Subscribe to all stations
  useEffect(() => {
    if (connectionState === "connected") {
      subscribe([
        { topic: mqttTopics.master.helloAll, qos: 1 },
        { topic: mqttTopics.master.eventsAll, qos: 1 },
      ]);
    }
  }, [connectionState, subscribe]);

  // Handle Incoming Messages (Hello, Events)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    handleMessage(lastMsg);
  }, [messages]);

  const handleMessage = useCallback(
    (msg: IncomingMessage) => {
      try {
        const payload: any = msg.json || JSON.parse(msg.payload);

        // 1. Station Hello -> Send Config
        // Topic structure: station/{id}/hello
        if (msg.topic.endsWith("/hello")) {
          const stationId = payload.deviceId;
          if (!stationId) return;

          console.log("Master received hello from:", stationId);

          // Find Coffee for this station
          // Logic: specific mapping or derived from ID?
          // User said: "master station o station id ile ayarlanmis kahveyo coffee.jsondan gonderecek"
          // Let's assume stationId matches 'stationId' in coffees.json?
          // coffees.json has "stationId": 1 (number).
          // Our IDs are "station1". Needs parsing or mapping.

          let coffee = null;
          // Try parsing number
          const numericId = parseInt(stationId.replace("station", ""), 10);
          console.log("Parsed numeric ID:", numericId);

          if (!isNaN(numericId)) {
            coffee = coffees.find((c) => c.stationId === numericId);
          } else {
            // Fallback or exact match if string IDs used later
            coffee = coffees.find((c) => String(c.stationId) === stationId);
          }

          if (coffee) {
            console.log(`Configuring ${stationId} with ${coffee.name}`);
            // Send Config
            const topic = mqttTopics.station(stationId).command; // or we can use generic topic?
            // Actually types.ts allowed StationConfigMessage in ParsedMqttMessage.
            // But Station listens to `command`.
            publish({
              topic,
              payload: {
                type: "set_config",
                deviceId: stationId,
                coffee: coffee,
                ts: Date.now(),
              },
            });
          } else {
            console.warn("No coffee found for stationId:", stationId);
          }
        }

        // 2. Start Request -> Trigger GPIO
        if (payload.type === "start_request") {
          const { deviceId, orderId } = payload;
          console.log(`Start request from ${deviceId} for order ${orderId}`);

          const numericId = parseInt(deviceId.replace("station", ""), 10);
          const coffee = coffees.find((c) => c.stationId === numericId);

          if (coffee && coffee.pin) {
            // 2a. Acknowledge Start (Processing)
            publish({
              topic: mqttTopics.station(deviceId).status,
              payload: { status: "processing", deviceId, ts: Date.now() },
            });

            // 2b. Trigger GPIO API
            // Call internal API
            fetch("/api/gpio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pin: coffee.pin }),
            })
              .then(async (res) => {
                if (res.ok) {
                  console.log("GPIO Triggered");
                  // 2c. Wait for duration (e.g. 10s as requested)
                  // The API might handle duration, or we handle "Finished" here.
                  // User said: "master belirli bi sure pin'e on konumu verip kapatirken... bitiminde ise bitti komutunu gonderecek"
                  // If API handles pulse, we just wait here to match.
                  // Let's check api/gpio/route.ts later.
                  // Assuming we wait 10s here for "filling" simulation.
                  setTimeout(() => {
                    publish({
                      topic: mqttTopics.station(deviceId).status,
                      payload: { status: "completed", deviceId, ts: Date.now() },
                    });
                  }, 10000); // 10 seconds
                } else {
                  console.error("GPIO Failed");
                }
              })
              .catch((err) => console.error("GPIO Call Error", err));
          }
        }
      } catch (e) {
        console.error("Master Handle Error", e);
      }
    },
    [publish]
  );

  // Public Actions
  const sendOrder = useCallback(
    (stationId: string, orderDetails: any) => {
      // orderDetails: { orderId, size, recipeId... }
      const topic = mqttTopics.station(stationId).command;
      publish({
        topic,
        payload: {
          ...orderDetails,
          deviceId: stationId,
          ts: Date.now(),
        },
      });
    },
    [publish]
  );

  return {
    connectionState,
    sendOrder,
  };
}
