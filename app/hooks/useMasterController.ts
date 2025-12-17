"use client";

import { useEffect, useCallback, useState } from "react";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import { mqttTopics } from "../lib/mqtt/topics";
import type { IncomingMessage } from "../lib/mqtt/types";
import { getMqttConfigFromEnv } from "../lib/mqtt/config";
import coffees from "../data/coffees.json";

// Shared State Types (Mirrored from Station)
export type StationSharedState = {
  id: string;
  type: "station";
  state: "IDLE" | "ORDER_RECEIVED" | "PROCESSING" | "COMPLETED";
  order: {
    orderId: string;
    size: string;
    price: number;
    recipeId: string;
    customerName?: string;
  } | null;
  ts: number;
};

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

  // Track ALL stations state (Key: stationId)
  const [stationStates, setStationStates] = useState<Record<string, StationSharedState>>({});

  // Derived active orders for UI compatibility
  // const activeOrders = ... derived from stationStates ...

  const {
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    role: "master",
    clientId: envConfig.deviceId || "master-screen",
    enabled,
  });

  // 1. Subscribe to Global State & Events
  useEffect(() => {
    if (connectionState === "connected") {
      console.log("[Master] Connected. Subscribing to ALL stations...");
      subscribe([
        { topic: mqttTopics.statusAll, qos: 0 }, // Retained states
        { topic: mqttTopics.events, qos: 0 }, // Momentry events
      ]);
    }
  }, [connectionState, subscribe]);

  // 2. Handle Incoming Messages
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    handleMessage(lastMsg);
  }, [messages]);

  const handleMessage = useCallback(
    (msg: IncomingMessage) => {
      try {
        const payload: any = msg.json || JSON.parse(msg.payload);

        // A. State Update (system/status/+)
        if (msg.topic.startsWith("system/status/")) {
          // Simple State Sync
          const stationId = payload.id;
          if (stationId && payload.type === "station") {
            setStationStates((prev) => ({
              ...prev,
              [stationId]: payload,
            }));
          }
          return;
        }

        // B. Event (system/events) -> START Signal
        if (msg.topic === mqttTopics.events && payload.type === "START") {
          const { stationId, orderId } = payload;
          console.log(`[Master] Received START Event from ${stationId} for order ${orderId}`);

          // 1. Trigger GPIO Flow
          triggerGpioFlow(stationId, orderId);
        }
      } catch (e) {
        console.error("Master Handle Error", e);
      }
    },
    [] // Dependencies
  );

  // GPIO Logic Helper
  const triggerGpioFlow = (stationId: string, orderId: string) => {
    // Find Pin Config
    const numericId = parseInt(stationId.replace("station", ""), 10);
    const coffee = coffees.find((c) => c.stationId === numericId);

    if (!coffee || !coffee.pin) {
      console.warn(`[Master] No PIN config for ${stationId}`);
      return;
    }

    const isCold = coffee.tags && coffee.tags.includes("Cold");
    const duration = isCold ? 7000 : 6000;

    console.log(`[Master] Triggering GPIO PIN ${coffee.pin} for ${duration}ms`);

    // 1. Update State to PROCESSING (Retained) -> Station shows animation
    updateStationState(stationId, {
      state: "PROCESSING",
    });

    // 2. Call API
    const gpioPayload = { pin: coffee.pin, duration: duration, value: 1, _v: "2.0.0" };

    fetch("/api/gpio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gpioPayload),
    })
      .then(async (res) => {
        // ... handle success/fail log ...
        console.log("[Master] GPIO API Response:", res.status);

        // 3. Wait Duration + Buffer
        setTimeout(() => {
          console.log(`[Master] Sequence Done. Setting ${stationId} to COMPLETED.`);
          // 4. Update State to COMPLETED (Retained) -> Station shows Enjoy
          updateStationState(stationId, {
            state: "COMPLETED",
          });
        }, duration + 500);
      })
      .catch((err) => {
        console.error("GPIO Error", err);
        // Recovery
        setTimeout(() => {
          updateStationState(stationId, { state: "COMPLETED" });
        }, duration + 500);
      });
  };

  // Helper to update specific station state (PATCH style)
  const updateStationState = (stationId: string, updates: Partial<StationSharedState>) => {
    setStationStates((prev) => {
      const current = prev[stationId];
      if (!current) return prev; // Should be there if we are interacting

      const next: StationSharedState = {
        ...current,
        ...updates,
        ts: Date.now(),
      };

      // Publish Retained
      publish({
        topic: mqttTopics.status(stationId),
        payload: next,
        retain: true,
        qos: 0,
      });

      return { ...prev, [stationId]: next };
    });
  };

  // Public Actions
  const sendOrder = useCallback(
    (stationId: string, orderDetails: any) => {
      console.log(`[Master] Sending Order to ${stationId}`, orderDetails);

      // Instead of ephemeral command, we UPDATE the Station's state to ORDER_RECEIVED
      // But we need the current station state first.
      // If we haven't received it yet (rare if connected), we can't patch.
      // We can synthesize a new state.

      // Synthesize
      const newState: StationSharedState = {
        id: stationId,
        type: "station",
        state: "ORDER_RECEIVED",
        order: {
          orderId: orderDetails.orderId,
          size: orderDetails.size,
          price: orderDetails.price,
          recipeId: orderDetails.recipeId,
        },
        ts: Date.now(),
      };

      // Optimistic local update
      setStationStates((prev) => ({ ...prev, [stationId]: newState }));

      // Publish Retained
      publish({
        topic: mqttTopics.status(stationId),
        payload: newState,
        retain: true, // IMPORTANT: Station picks this up immediately
        qos: 0,
      });
    },
    [publish]
  );

  // Compatibility Derivations
  const activeStations = Object.keys(stationStates);
  const activeOrders = Object.values(stationStates)
    .filter((s) => s.order && (s.state === "ORDER_RECEIVED" || s.state === "PROCESSING" || s.state === "COMPLETED"))
    .map((s) => ({
      orderId: s.order!.orderId,
      stationId: s.id,
      status: s.state === "ORDER_RECEIVED" ? "SENT" : s.state, // Map enum
      details: s.order,
    }));

  return {
    connectionState,
    sendOrder,
    activeStations,
    activeOrders,
    stationStates, // Expose full state map if needed
  };
}
