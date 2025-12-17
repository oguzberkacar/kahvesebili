"use client";

import { useEffect, useCallback, useState } from "react";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import { mqttTopics } from "../lib/mqtt/topics";
import type { IncomingMessage } from "../lib/mqtt/types";
import { getMqttConfigFromEnv } from "../lib/mqtt/config";
import coffees from "../data/coffees.json";

export type MasterOrder = {
  orderId: string;
  stationId: string;
  status: "SENT" | "PROCESSING" | "COMPLETED";
  startTime?: number;
  endTime?: number;
  details: any;
};

export function useMasterController({ enabled = true }: { enabled?: boolean } = {}) {
  const envConfig = getMqttConfigFromEnv();

  // Track connected stations
  const [activeStations, setActiveStations] = useState<Set<string>>(new Set());
  // Track orders
  const [activeOrders, setActiveOrders] = useState<MasterOrder[]>([]);

  const {
    client,
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    role: "master", // Enforce role
    clientId: envConfig.deviceId || "master-screen",
    enabled,
  });

  // Subscribe to all stations AND Broadcast Discovery
  useEffect(() => {
    if (connectionState === "connected") {
      // Wildcards might be blocked by ACL. Subscribe explicitly to known stations.
      // Wildcards might be blocked by ACL. Subscribe explicitly to known stations.
      const explicitSubscriptions: { topic: string; qos: 0 | 1 | 2 }[] = [];
      const KNOWN_STATIONS = ["station1", "station2", "station3", "station4", "station5"];

      KNOWN_STATIONS.forEach((id) => {
        explicitSubscriptions.push({ topic: mqttTopics.station(id).hello, qos: 0 });
        explicitSubscriptions.push({ topic: mqttTopics.station(id).events, qos: 0 });
      });

      subscribe(explicitSubscriptions);

      // subscribe([
      //   ...explicitSubscriptions,
      //   // { topic: mqttTopics.master.helloAll, qos: 0 }, // Wildcard blocked
      //   // { topic: mqttTopics.master.eventsAll, qos: 0 }, // Wildcard blocked
      // ]);

      // Proactive Discovery: Ask "Who is there?"
      // console.log("Master connected. Broadcasting discovery...");
      publish({
        topic: mqttTopics.master.broadcast,
        payload: { type: "discovery", ts: Date.now() },
        qos: 0,
        retain: false,
      });
    }
  }, [connectionState, subscribe, publish]);

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
          if (stationId === "master") return; // Ignore self

          // console.log("Master received hello from:", stationId);

          // Mark as active
          setActiveStations((prev) => {
            const next = new Set(prev);
            next.add(stationId);
            return next;
          });

          // Find Coffee for this station
          let coffee = null;
          // Try parsing number for coffees.json lookup
          const numericId = parseInt(stationId.replace("station", ""), 10);

          if (!isNaN(numericId)) {
            coffee = coffees.find((c) => c.stationId === numericId);
          } else {
            // Fallback
            coffee = coffees.find((c) => String(c.stationId) === stationId);
          }

          if (coffee) {
            // console.log(`Configuring ${stationId} with ${coffee.name}`);
            // Send Config
            const topic = mqttTopics.station(stationId).command;
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
          console.log(`[Master] Received START_REQUEST from ${deviceId} for order ${orderId}`);

          // Update Order Status to PROCESSING
          setActiveOrders((prev) =>
            prev.map((o) => (o.orderId === orderId ? { ...o, status: "PROCESSING", startTime: Date.now() } : o))
          );

          const numericId = parseInt(deviceId.replace("station", ""), 10);
          const coffee = coffees.find((c) => c.stationId === numericId);

          if (coffee && coffee.pin) {
            // 2a. Acknowledge Start (Processing)
            console.log(`[Master] Sending STATUS: PROCESSING to ${deviceId}`);
            publish({
              topic: mqttTopics.station(deviceId).status,
              payload: { status: "processing", deviceId, ts: Date.now() },
            });

            // Determine duration: 7000ms for Cold, 6000ms for Hot (default)
            const isCold = coffee.tags && coffee.tags.includes("Cold");
            // 2b. Trigger GPIO API
            const duration = isCold ? 7000 : 6000;
            const payload = { pin: coffee.pin, duration: duration, value: 1, _v: "1.0.5" };
            console.log(`[Master v1.0.5] Triggering GPIO (isCold: ${isCold}) Payload:`, payload);

            fetch("/api/gpio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
              .then(async (res) => {
                const success = res.ok;
                try {
                  const json = await res.json();
                  if (json.mocked) console.log("[Master] GPIO Mocked:", json);
                } catch (e) {
                  // ignore json parse error
                }

                if (success) {
                  console.log("[Master] GPIO Triggered Successfully");
                } else {
                  console.error("[Master] GPIO Failed, but simulating flow.");
                }

                // 2c. Wait for the coffee duration EXACTLY, then send completed
                // We add a small buffer (e.g. 500ms) to ensure physics are done.
                setTimeout(() => {
                  console.log(`[Master] Sending STATUS: COMPLETED to ${deviceId} after ${duration}ms`);
                  publish({
                    topic: mqttTopics.station(deviceId).status,
                    payload: { status: "completed", deviceId, ts: Date.now() },
                  });

                  // Update Status to COMPLETED
                  setActiveOrders((prev) =>
                    prev.map((o) => (o.orderId === orderId ? { ...o, status: "COMPLETED", endTime: Date.now() } : o))
                  );
                }, duration + 500); // Duration + 500ms buffer
              })
              .catch((err) => {
                console.error("[Master] GPIO Call Error", err);
                // Even on network error, finish the flow?
                // Probably yes for testing.
                setTimeout(() => {
                  console.log(`[Master] Sending STATUS: COMPLETED to ${deviceId} (Recovery) after ${duration}ms`);
                  publish({
                    topic: mqttTopics.station(deviceId).status,
                    payload: { status: "completed", deviceId, ts: Date.now() },
                  });

                  setActiveOrders((prev) =>
                    prev.map((o) => (o.orderId === orderId ? { ...o, status: "COMPLETED", endTime: Date.now() } : o))
                  );
                }, duration + 500);
              });
          } else {
            console.warn(`[Master] Coffee config or PIN not found for ${deviceId}`);
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

      // Track locally
      setActiveOrders((prev) => [
        ...prev,
        {
          orderId: orderDetails.orderId,
          stationId,
          status: "SENT",
          details: orderDetails,
        },
      ]);

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
    activeStations: Array.from(activeStations),
    activeOrders,
  };
}
