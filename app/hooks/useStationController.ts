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

type StationControllerProps = {
  stationId?: string;
  brokerUrl?: string;
};

export function useStationController({ stationId, brokerUrl }: StationControllerProps = {}) {
  // 1. Setup & Defaults
  const envConfig = getMqttConfigFromEnv();
  const effectiveStationId = stationId || envConfig.deviceId || "station1";

  // 2. Local Coffee Config (Station knows itself now)
  const coffeeConfig = useMemo(() => {
    // Try by ID number (station4 -> 4)
    const numericId = parseInt(effectiveStationId.replace("station", ""), 10);
    return coffees.find((c) => c.stationId === numericId) || null;
  }, [effectiveStationId]);

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
  });

  // 4. Local State (Syncs with Shared State)
  const [sharedState, setSharedState] = useState<StationSharedState>({
    id: effectiveStationId,
    type: "station",
    state: "IDLE",
    order: null,
    ts: Date.now(),
  });

  // Helper to publish Retained State
  const publishState = useCallback(
    (newState: Partial<StationSharedState>) => {
      const merged: StationSharedState = {
        ...sharedState, // use current state as base? No, use ref or pass full?
        // Better: merge from argument assuming caller knows best or merge with existing locally
        ...newState,
        id: effectiveStationId,
        ts: Date.now(),
      } as StationSharedState;

      // Optimistic Update
      setSharedState(merged);

      // Publish Retained
      publish({
        topic: mqttTopics.status(effectiveStationId),
        payload: merged,
        retain: true,
        qos: 0, // Keep QoS 0 for speed
      });
    },
    [publish, effectiveStationId, sharedState]
  );

  // Bug fix: publishState closure staleness.
  // Actually, we should rely on incoming messages to update local state source of truth?
  // Protocol:
  // - Station writes IDLE (init)
  // - Master writes ORDER_RECEIVED
  // - Station writes PROCESSING (after start click) -> Wait, Master needs start signal first.
  //
  // Revised Flow:
  // - Station inits: writes IDLE (retained)
  // - Master writes: ORDER_RECEIVED (retained) -> Station udpates UI
  // - Station clicks Start: Publishes EVENT (not state) -> Master triggers GPIO -> Master writes PROCESSING (retained)
  // - Master writes: COMPLETED (retained) -> Station updates UI

  // 5. Connect & Subscribe & Announce
  useEffect(() => {
    if (connectionState === "connected") {
      const topic = mqttTopics.status(effectiveStationId);
      console.log(`[Station] Connected. Subscribing to self: ${topic}`);

      subscribe([
        { topic, qos: 0 }, // Subscribe to my own state (Master updates me here)
      ]);

      // Announce Presence (If I am fresh, or maybe I should trust retained?)
      // We should probably NOT overwrite if there is an active order (persistence).
      // But for now, let's Announce IDLE if we have no state.
      // Actually, subscribing first will give us the last retained state.
      // So we wait for message?
      // Let's publish IDLE only if we want to reset on boot.
      // For stability, let's publish IDLE on boot (Resetting station).

      /*
       * NOTE: Publishing IDLE on boot clears any active order after refresh.
       * This is safer for "stuck" orders.
       */
      const bootState: StationSharedState = {
        id: effectiveStationId,
        type: "station",
        state: "IDLE",
        order: null,
        ts: Date.now(),
      };

      publish({
        topic,
        payload: bootState,
        retain: true,
      });
    }
  }, [connectionState, effectiveStationId, subscribe, publish]);

  // 6. Handle Incoming State Updates (From Master)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    // Only care about my topic
    if (lastMsg.topic !== mqttTopics.status(effectiveStationId)) return;

    try {
      const payload = lastMsg.json || JSON.parse(lastMsg.payload);
      // Validate schema loosely
      if (payload.id === effectiveStationId && payload.state) {
        // Update local react state
        // console.log("[Station] State synced:", payload.state);
        setSharedState(payload);
      }
    } catch (e) {
      console.error("Failed to parse station state", e);
    }
  }, [messages, effectiveStationId]);

  // 7. Actions

  const handleStartOrder = useCallback(() => {
    if (!sharedState.order) return;

    console.log("[Station] Sending START Event...");
    // 1. Emit Event (momentary)
    publish({
      topic: mqttTopics.events,
      payload: {
        type: "START",
        stationId: effectiveStationId,
        orderId: sharedState.order.orderId,
        ts: Date.now(),
      },
    });

    // 2. Optimistic Update? No, wait for Master to set PROCESSING.
  }, [publish, effectiveStationId, sharedState.order]);

  const handleReset = useCallback(() => {
    // Force IDLE
    publishState({
      id: effectiveStationId,
      type: "station",
      state: "IDLE",
      order: null,
      ts: Date.now(),
    });
  }, [publishState, effectiveStationId]);

  const handleSafeReset = handleReset; // Same for now

  return {
    stationState: sharedState.state, // Map to legacy string
    coffeeConfig,
    orders: sharedState.order ? [sharedState.order] : [], // Legacy array adapter
    selectedOrderId: sharedState.order?.orderId || null,
    handleStartOrder,
    handleSelectOrder: () => {}, // No op, single order now
    handleReset,
    handleSafeReset,
    connectionState,
  };
}
