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
  state: "IDLE" | "ORDER_RECEIVED" | "PROCESSING" | "COMPLETED" | "DISCONNECTED";
  orders: {
    orderId: string;
    size: string;
    price: number;
    recipeId: string;
    customerName?: string;
  }[];
  duration?: number;
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

  // Track Active Masters (Key: uniqueSessionId, Value: ONLINE/OFFLINE)
  const [masterStates, setMasterStates] = useState<Record<string, "ONLINE" | "OFFLINE">>({});

  // Create a unique session ID for this Master instance to allow multiple Masters (e.g., iPad + Laptop)
  const [sessionMasterId] = useState(() => `master-${Math.random().toString(36).slice(2, 8)}`);

  const {
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    role: "master",
    clientId: sessionMasterId, // Unique ID per session
    enabled,
    // Multi-Master LWT: Tell others I am offline on my unique topic
    will: {
      topic: mqttTopics.masterPresence(sessionMasterId),
      payload: JSON.stringify({ id: sessionMasterId, state: "OFFLINE", ts: Date.now() }),
      retain: true,
      qos: 0,
    },
  });

  // Helper to update specific station state (PATCH style) -> MOVED UP
  const updateStationState = useCallback(
    (stationId: string, updates: Partial<StationSharedState>) => {
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
    },
    [publish]
  );

  // 1. Subscribe to Global State & Events & Announce Presence
  useEffect(() => {
    if (connectionState === "connected") {
      console.log("[Master] Connected. Subscribing to ALL stations and masters...");

      // Announce Presence (Global) - To wake up stations
      publish({
        topic: mqttTopics.masterStatus, // Legacy: "system/master/status"
        payload: { state: "ONLINE", ts: Date.now() },
        retain: true,
      });

      // Announce Presence (Multi-Master) - To show up in other masters' lists
      publish({
        topic: mqttTopics.masterPresence(sessionMasterId),
        payload: { id: sessionMasterId, state: "ONLINE", ts: Date.now() },
        retain: true, // Retain so new masters see me
      });

      subscribe([
        { topic: mqttTopics.statusAll, qos: 0 }, // Retained station states
        { topic: mqttTopics.events, qos: 0 }, // Momentary events
        { topic: mqttTopics.masterPresenceAll, qos: 0 }, // Listen to other masters
      ]);
    }
  }, [connectionState, subscribe, publish, sessionMasterId]);

  // GPIO Logic Helper
  const triggerGpioFlow = useCallback(
    (stationId: string, orderId: string) => {
      // Find Pin Config
      const numericId = parseInt(stationId.replace("station", ""), 10);
      const coffee = coffees.find((c) => c.stationId === numericId);

      if (!coffee || !coffee.pin) {
        console.warn(`[Master] No PIN config for ${stationId}`);
        return;
      }

      const isCold = coffee.tags && coffee.tags.includes("Cold");
      const duration = isCold ? 4000 : 6000;

      console.log(`[Master] Triggering GPIO PIN ${coffee.pin} for ${duration}ms`);

      // 1. Update State to PROCESSING (Retained) -> Station shows animation
      updateStationState(stationId, {
        state: "PROCESSING",
        duration: duration, // Send duration to Station
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

          // 3. Wait Duration (Exact duration, removed buffer)
          setTimeout(() => {
            console.log(`[Master] Sequence Done. Setting ${stationId} to COMPLETED.`);
            // 4. Update State to COMPLETED (Retained) -> Station shows Enjoy
            updateStationState(stationId, {
              state: "COMPLETED",
              duration: undefined, // Clear duration
            });
          }, duration);
        })
        .catch((err) => {
          console.error("GPIO Error", err);
          // Recovery
          setTimeout(() => {
            updateStationState(stationId, { state: "COMPLETED" });
          }, duration);
        });
    },
    [updateStationState]
  );

  const handleMessage = useCallback(
    (msg: IncomingMessage) => {
      try {
        const payload: any = msg.json || JSON.parse(msg.payload);

        // A. State Update (system/status/+) - Stations
        if (msg.topic.startsWith("system/status/")) {
          const stationId = payload.id;
          if (stationId && payload.type === "station") {
            if (payload.state === "DISCONNECTED") {
              console.log(`[Master] Station ${stationId} reported DISCONNECTED`);
            }
            setStationStates((prev) => ({
              ...prev,
              [stationId]: payload,
            }));
          }
          return;
        }

        // B. Master Presence (system/masters/+) - Other Masters
        if (msg.topic.startsWith("system/masters/")) {
          const masterId = payload.id;
          const state = payload.state; // ONLINE | OFFLINE
          if (masterId) {
            setMasterStates((prev) => ({
              ...prev,
              [masterId]: state,
            }));
          }
          return;
        }

        // C. Event (system/events) -> START Signal
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
    [triggerGpioFlow]
  );

  // 2. Handle Incoming Messages (Moved down)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    handleMessage(lastMsg);
  }, [messages, handleMessage]);

  // Public Actions
  const sendOrder = useCallback(
    (stationId: string, orderDetails: any) => {
      console.log(`[Master] Sending Order to ${stationId}`, orderDetails);
      const currentStation = stationStates[stationId];
      const currentOrders = currentStation?.orders || [];

      const newOrderObj = {
        orderId: orderDetails.orderId,
        size: orderDetails.size,
        price: orderDetails.price,
        recipeId: orderDetails.recipeId,
      };

      const newOrders = [...currentOrders, newOrderObj];

      const newState: StationSharedState = {
        id: stationId,
        type: "station",
        state: "ORDER_RECEIVED",
        orders: newOrders,
        ts: Date.now(),
      };

      // Optimistic local update
      setStationStates((prev) => ({ ...prev, [stationId]: newState }));

      // Publish Retained
      publish({
        topic: mqttTopics.status(stationId),
        payload: newState,
        retain: true,
        qos: 0,
      });
    },
    [publish, stationStates]
  );

  // Compatibility Derivations
  const activeStations = Object.keys(stationStates).filter((id) => stationStates[id].state !== "DISCONNECTED");
  const activeOrders = Object.values(stationStates)
    .filter(
      (s) =>
        s.orders &&
        s.orders.length > 0 &&
        (s.state === "ORDER_RECEIVED" || s.state === "PROCESSING" || s.state === "COMPLETED")
    )
    .flatMap((s) =>
      s.orders.map((order) => ({
        orderId: order.orderId,
        stationId: s.id,
        status: s.state === "ORDER_RECEIVED" ? "SENT" : s.state,
        details: order,
      }))
    );

  const refreshNetwork = useCallback(() => {
    console.log("[Master] Refreshing Network... Sending ONLINE broadcast.");
    // 1. Broad Global Online
    publish({
      topic: mqttTopics.masterStatus,
      payload: { state: "ONLINE", ts: Date.now() },
      retain: true,
    });
    // 2. Re-announce specific session presence
    publish({
      topic: mqttTopics.masterPresence(sessionMasterId),
      payload: { id: sessionMasterId, state: "ONLINE", ts: Date.now() },
      retain: true,
    });
  }, [publish, sessionMasterId]);

  return {
    connectionState,
    sendOrder,
    activeStations,
    activeOrders,
    stationStates,
    refreshNetwork,
    masterStates, // New exposed state
    sessionId: sessionMasterId,
  };
}
