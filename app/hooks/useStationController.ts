"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import { mqttTopics } from "../lib/mqtt/topics";
import type { IncomingMessage } from "../lib/mqtt/types";
import { getMqttConfigFromEnv } from "../lib/mqtt/config";
import coffees from "../data/coffees.json";

// Unified Shared State Schema
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

type StationControllerProps = {
  stationId?: string;
  brokerUrl?: string;
};

export function useStationController({ stationId, brokerUrl }: StationControllerProps = {}) {
  // 1. Setup & Defaults
  const envConfig = getMqttConfigFromEnv();
  const effectiveStationId = stationId || envConfig.deviceId || "station1";

  // 2. Local Coffee Config (Dynamic: Starts from JSON, updates from MQTT)
  const [coffeeConfig, setCoffeeConfig] = useState<any | null>(() => {
    // Initial Hydration from built-in JSON
    const numericId = parseInt(effectiveStationId.replace("station", ""), 10);
    return coffees.find((c) => c.stationId === numericId) || null;
  });

  // 3. MQTT Client
  const {
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    url: brokerUrl || envConfig.url,
    role: "station",
    deviceId: effectiveStationId,
    clientId: effectiveStationId, // keep it stable
    keepalive: 5,
    will: {
      topic: mqttTopics.status(effectiveStationId),
      payload: JSON.stringify({
        id: effectiveStationId,
        type: "station",
        state: "DISCONNECTED",
        ts: Date.now(),
      }),
      retain: true,
      qos: 0,
    },
  });

  // 4. Local State (Syncs with Shared State)
  const [sharedState, setSharedState] = useState<StationSharedState>({
    id: effectiveStationId,
    type: "station",
    state: "IDLE",
    orders: [],
    ts: Date.now(),
  });

  // Helper to publish Retained State
  const publishState = useCallback(
    (newState: Partial<StationSharedState>) => {
      const merged: StationSharedState = {
        ...sharedState,
        ...newState,
        id: effectiveStationId,
        ts: Date.now(),
      } as StationSharedState;

      setSharedState(merged);

      publish({
        topic: mqttTopics.status(effectiveStationId),
        payload: merged,
        retain: true,
        qos: 0,
      });
    },
    [publish, effectiveStationId, sharedState]
  );

  // 5. Connect & Subscribe & Announce
  useEffect(() => {
    if (connectionState === "connected") {
      const topic = mqttTopics.status(effectiveStationId);
      console.log(`[Station] Connected. Subscribing to self: ${topic}`);

      subscribe([
        { topic, qos: 0 }, // Subscribe to my own state
        { topic: mqttTopics.masterStatus, qos: 0 }, // Monitor Master
        { topic: mqttTopics.config(effectiveStationId), qos: 0 }, // Listen for Config overrides
      ]);

      // Announce IDLE on boot (Resetting station state for safety)
      const bootState: StationSharedState = {
        id: effectiveStationId,
        type: "station",
        state: "IDLE",
        orders: [],
        ts: Date.now(),
      };

      publish({
        topic,
        payload: bootState,
        retain: true,
      });

      const handleBeforeUnload = () => {
        // Cleanup hook
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [connectionState, effectiveStationId, subscribe, publish]);

  // 4b. Master State Tracking
  const [masterState, setMasterState] = useState<"ONLINE" | "OFFLINE">("ONLINE");

  // 6. Handle Incoming State Updates (From Master)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    try {
      const payload = lastMsg.json || JSON.parse(lastMsg.payload);

      // 1. Master Status
      if (lastMsg.topic === mqttTopics.masterStatus) {
        if (payload.state) {
          setMasterState(payload.state);
          if (payload.state === "ONLINE" && sharedState.state !== "DISCONNECTED") {
            console.log("[Station] Master back ONLINE. Re-announcing state.");
            publishState(sharedState);
          }
        }
        return;
      }

      // 2. Config Update
      if (lastMsg.topic === mqttTopics.config(effectiveStationId)) {
        console.log("[Station] Received Config Update:", payload);
        // Merge Payload with existing config structure
        // UI expects 'tags' array for Hot/Cold logic
        const adaptedConfig = {
          ...payload,
          tags: payload.type === "Cold" ? ["Cold"] : ["Hot"],
        };
        setCoffeeConfig(adaptedConfig);
        return;
      }

      // 3. State Sync (loopback check)
      if (lastMsg.topic === mqttTopics.status(effectiveStationId)) {
        if (payload.id === effectiveStationId && payload.state) {
          setSharedState(payload);
        }
        return;
      }
    } catch (e) {
      console.error("Msg Error", e);
    }
  }, [messages, effectiveStationId, publishState, sharedState]);

  // 7. Actions

  // 4c. Local Selection State
  const [internalSelectedOrderId, setInternalSelectedOrderId] = useState<string | null>(null);

  const effectiveOrderId = useMemo(() => {
    if (internalSelectedOrderId && sharedState.orders.some((o) => o.orderId === internalSelectedOrderId)) {
      return internalSelectedOrderId;
    }
    return sharedState.orders.length > 0 ? sharedState.orders[0].orderId : null;
  }, [internalSelectedOrderId, sharedState.orders]);

  const handleSelectOrder = useCallback((orderId: string) => {
    setInternalSelectedOrderId(orderId);
  }, []);

  const handleStartOrder = useCallback(() => {
    if (!effectiveOrderId) return;
    console.log(`[Station] Sending START Event for ${effectiveOrderId}...`);
    publish({
      topic: mqttTopics.events,
      payload: {
        type: "START",
        stationId: effectiveStationId,
        orderId: effectiveOrderId,
        ts: Date.now(),
      },
    });
  }, [publish, effectiveStationId, effectiveOrderId]);

  const handleReset = useCallback(() => {
    const completedId = effectiveOrderId;
    const nextOrders = sharedState.orders.filter((o) => o.orderId !== completedId);
    const nextState = nextOrders.length > 0 ? "ORDER_RECEIVED" : "IDLE";
    publishState({
      id: effectiveStationId,
      type: "station",
      state: nextState,
      orders: nextOrders,
      ts: Date.now(),
    });
    setInternalSelectedOrderId(null);
  }, [publishState, effectiveStationId, sharedState.orders, effectiveOrderId]);

  const handleSafeReset = handleReset;

  const reannounce = useCallback(() => {
    console.log("[Station] Manual re-announce requested.");
    publishState(sharedState);
  }, [publishState, sharedState]);

  return {
    stationState: sharedState.state,
    coffeeConfig,
    orders: sharedState.orders,
    selectedOrderId: effectiveOrderId,
    handleStartOrder,
    handleSelectOrder,
    handleReset,
    handleSafeReset,
    connectionState,
    masterState,
    currentDuration: sharedState.duration,
    reannounce,
  };
}
