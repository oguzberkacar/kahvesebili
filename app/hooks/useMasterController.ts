"use client";

import { useEffect, useCallback, useState, useRef } from "react";
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

// New Configuration Type
export type StationConfig = {
  stationId: string;
  coffeeId: string;
  name: string;
  type: "Hot" | "Cold";
  pin: number;
  duration: number; // ms
  image: string;
  roast?: string;
  details?: any;
};

export function useMasterController({ enabled = true }: { enabled?: boolean } = {}) {
  const envConfig = getMqttConfigFromEnv();

  // Track ALL stations state (Key: stationId)
  const [stationStates, setStationStates] = useState<Record<string, StationSharedState>>({});

  // Track Active Masters
  const [masterStates, setMasterStates] = useState<Record<string, "ONLINE" | "OFFLINE">>({});

  // Station Configurations (Synced from JSON, then potentially overridden)
  const [stationConfigs, setStationConfigs] = useState<Record<string, StationConfig>>({});
  const configsInitialized = useRef(false);

  // Load initial configs from JSON
  useEffect(() => {
    if (configsInitialized.current) return;
    const initial: Record<string, StationConfig> = {};
    coffees.forEach((c) => {
      const sId = `station${c.stationId}`;
      const isCold = c.tags && c.tags.includes("Cold");
      initial[sId] = {
        stationId: sId,
        coffeeId: c.id,
        name: c.name,
        type: isCold ? "Cold" : "Hot",
        pin: c.pin,
        duration: isCold ? 4000 : 7000,
        image: c.image,
        roast: c.roast,
        details: c.details,
      };
    });
    setStationConfigs(initial);
    configsInitialized.current = true;
  }, []);

  const [sessionMasterId] = useState(() => `master-${Math.random().toString(36).slice(2, 8)}`);

  const {
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    role: "master",
    clientId: sessionMasterId,
    enabled,
    will: {
      topic: mqttTopics.masterPresence(sessionMasterId),
      payload: JSON.stringify({ id: sessionMasterId, state: "OFFLINE", ts: Date.now() }),
      retain: true,
      qos: 0,
    },
  });

  const updateStationState = useCallback(
    (stationId: string, updates: Partial<StationSharedState>) => {
      setStationStates((prev) => {
        const current = prev[stationId];
        if (!current) return prev;

        const next: StationSharedState = {
          ...current,
          ...updates,
          ts: Date.now(),
        };

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

  // Update & Publish Configuration
  const updateConfig = useCallback(
    (stationId: string, updates: Partial<StationConfig>) => {
      setStationConfigs((prev) => {
        const current = prev[stationId];
        if (!current) return prev;

        const next = { ...current, ...updates };

        console.log(`[Master] Updating Config for ${stationId}:`, next);

        publish({
          topic: mqttTopics.config(stationId),
          payload: next,
          retain: true,
          qos: 0,
        });

        return { ...prev, [stationId]: next };
      });
    },
    [publish]
  );

  // Sync on Connect
  useEffect(() => {
    if (connectionState === "connected") {
      console.log("[Master] Connected. Subscribing...");

      publish({
        topic: mqttTopics.masterStatus,
        payload: { state: "ONLINE", ts: Date.now() },
        retain: true,
      });

      publish({
        topic: mqttTopics.masterPresence(sessionMasterId),
        payload: { id: sessionMasterId, state: "ONLINE", ts: Date.now() },
        retain: true,
      });

      // Broadcast Configs (Retained) - Ensures Stations get the latest config
      // Note: In a persistent system, we might want to ONLY publish if changed?
      // But since this is an in-memory session, we republish our truth.
      Object.values(stationConfigs).forEach((conf) => {
        publish({
          topic: mqttTopics.config(conf.stationId),
          payload: conf,
          retain: true,
          qos: 0,
        });
      });

      subscribe([
        { topic: mqttTopics.statusAll, qos: 0 },
        { topic: mqttTopics.events, qos: 0 },
        { topic: mqttTopics.masterPresenceAll, qos: 0 },
      ]);
    }
  }, [connectionState, subscribe, publish, sessionMasterId, stationConfigs]);
  // Dependency config: if configs change locally, do we re-publish all?
  // No, `updateConfig` handles manual changes. This effect is mainly for ON CONNECT.
  // Including `stationConfigs` here might cause re-publish loops if not careful.
  // But wait `stationConfigs` is stable after init. `updateConfig` creates new ref.
  // If we change one config, `stationConfigs` changes, this effect runs -> re-publishes ALL.
  // This is acceptable for small number of stations (4-5). Ensures consistency.

  // GPIO Logic Helper
  const triggerGpioFlow = useCallback(
    (stationId: string, orderId: string) => {
      // Use DYNAMIC CONFIG first, fallback to JSON logic if needed (but config should exist)
      let config = stationConfigs[stationId];

      if (!config) {
        // Fallback logic usually not needed if initialized correctly
        const numericId = parseInt(stationId.replace("station", ""), 10);
        const coffee = coffees.find((c) => c.stationId === numericId);
        if (coffee) {
          const isCold = coffee.tags && coffee.tags.includes("Cold");
          config = {
            stationId,
            pin: coffee.pin,
            duration: isCold ? 4000 : 7000,
            // other fields mock
            type: isCold ? "Cold" : "Hot",
            name: coffee.name,
            coffeeId: coffee.id,
            image: coffee.image,
          };
        }
      }

      if (!config || !config.pin) {
        console.warn(`[Master] No PIN config for ${stationId}`);
        return;
      }

      const { pin, duration } = config;

      console.log(`[Master] Triggering GPIO PIN ${pin} for ${duration}ms (Type: ${config.type})`);

      updateStationState(stationId, {
        state: "PROCESSING",
        duration: duration,
      });

      const gpioPayload = { pin, duration, value: 1, _v: "2.0.0" };

      fetch("/api/gpio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gpioPayload),
      })
        .then(async (res) => {
          console.log("[Master] GPIO API Response:", res.status);
          setTimeout(() => {
            console.log(`[Master] Sequence Done. Setting ${stationId} to COMPLETED.`);
            updateStationState(stationId, {
              state: "COMPLETED",
              duration: undefined,
            });
          }, duration);
        })
        .catch((err) => {
          console.error("GPIO Error", err);
          setTimeout(() => {
            updateStationState(stationId, { state: "COMPLETED" });
          }, duration);
        });
    },
    [updateStationState, stationConfigs]
  );

  const handleMessage = useCallback(
    (msg: IncomingMessage) => {
      try {
        const payload: any = msg.json || JSON.parse(msg.payload);

        if (msg.topic.startsWith("system/status/")) {
          const stationId = payload.id;
          if (stationId && payload.type === "station") {
            setStationStates((prev) => ({
              ...prev,
              [stationId]: payload,
            }));
          }
          return;
        }

        if (msg.topic.startsWith("system/masters/")) {
          const masterId = payload.id;
          const state = payload.state;
          if (masterId) {
            setMasterStates((prev) => ({
              ...prev,
              [masterId]: state,
            }));
          }
          return;
        }

        if (msg.topic === mqttTopics.events && payload.type === "START") {
          const { stationId, orderId } = payload;
          console.log(`[Master] Received START Event from ${stationId} for order ${orderId}`);
          triggerGpioFlow(stationId, orderId);
        }
      } catch (e) {
        console.error("Master Handle Error", e);
      }
    },
    [triggerGpioFlow]
  );

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    handleMessage(lastMsg);
  }, [messages, handleMessage]);

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

      setStationStates((prev) => ({ ...prev, [stationId]: newState }));

      publish({
        topic: mqttTopics.status(stationId),
        payload: newState,
        retain: true,
        qos: 0,
      });
    },
    [publish, stationStates]
  );

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
    console.log("[Master] Refreshing Network...");
    publish({ topic: mqttTopics.masterStatus, payload: { state: "ONLINE", ts: Date.now() }, retain: true });
    publish({
      topic: mqttTopics.masterPresence(sessionMasterId),
      payload: { id: sessionMasterId, state: "ONLINE", ts: Date.now() },
      retain: true,
    });

    // Re-broadcast configs
    Object.values(stationConfigs).forEach((conf) => {
      publish({ topic: mqttTopics.config(conf.stationId), payload: conf, retain: true });
    });
  }, [publish, sessionMasterId, stationConfigs]);

  return {
    connectionState,
    sendOrder,
    activeStations,
    activeOrders,
    stationStates,
    refreshNetwork,
    masterStates,
    sessionId: sessionMasterId,
    // Config features
    stationConfigs,
    updateConfig,
  };
}
