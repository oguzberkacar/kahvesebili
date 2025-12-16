"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import { mqttTopics } from "../lib/mqtt/topics";
import type { StationConfigMessage, CommandMessage, IncomingMessage } from "../lib/mqtt/types";

type StationState =
  | "DISCONNECTED"
  | "IDLE" // Connected + Configured (Coffee Info)
  | "ORDER_RECEIVED" // Master sent config/order details to confirm
  | "PROCESSING" // User clicked Start, waiting for finish
  | "COMPLETED"; // Done

type StationControllerProps = {
  stationId: string;
  brokerUrl: string;
};

export function useStationController({ stationId, brokerUrl }: StationControllerProps) {
  const [stationState, setStationState] = useState<StationState>("DISCONNECTED");
  const [coffeeConfig, setCoffeeConfig] = useState<any>(null); // The coffee info
  const [activeOrder, setActiveOrder] = useState<CommandMessage | null>(null);

  // MQTT Client
  const {
    client,
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    url: brokerUrl,
    clientId: stationId + "_" + Math.random().toString(16).slice(2, 8),
    role: "station",
    deviceId: stationId,
  });

  // Handle Connection State
  useEffect(() => {
    if (connectionState === "connected") {
      // Subscribe to commands
      const topics = mqttTopics.station(stationId);
      subscribe([
        { topic: topics.command, qos: 1 },
        { topic: topics.status, qos: 1 }, // Listen for status updates (Finished)
      ]);

      // Publish Hello to request config
      publish({
        topic: topics.hello,
        payload: {
          deviceId: stationId,
          role: "station",
          ts: Date.now(),
        },
      });

      // If we don't have config yet, we are effectively waiting (DISCONNECTED/LOADING UI or disabled)
      // But if we already have config locally (maybe persisted), we could go IDLE.
      // For now, wait for Master to send config or we can implement local fallback lookup here if needed.
    } else {
      setStationState("DISCONNECTED");
    }
  }, [connectionState, stationId, subscribe, publish]);

  // Handle Incoming Messages
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    handleMessage(lastMsg);
  }, [messages]);

  const handleMessage = useCallback((msg: IncomingMessage) => {
    try {
      const payload: any = msg.json || JSON.parse(msg.payload);

      // 1. Config Message (Set Coffee Info)
      if (payload.type === "set_config") {
        setCoffeeConfig(payload.coffee);
        setStationState("IDLE");
        return;
      }

      // 2. Order Command (Show Order Screen)
      // If it has orderId and size, it's an order command
      if (payload.orderId && payload.size) {
        setActiveOrder(payload);
        setStationState("ORDER_RECEIVED");
        return;
      }

      // 3. Status Update (Started / Finished)
      // Master might send { status: 'processing' } or { status: 'completed' }
      if (payload.status === "processing") {
        // Master acknowledged start
        // We might already be in PROCESSING, but good to confirm
        setStationState("PROCESSING");
      } else if (payload.status === "completed") {
        setStationState("COMPLETED");

        // Auto reset after 30s
        setTimeout(() => {
          setStationState((curr) => (curr === "COMPLETED" ? "IDLE" : curr));
          setActiveOrder(null);
        }, 30000);
      }
    } catch (e) {
      console.error("Failed to parse station message", e);
    }
  }, []);

  // Actions
  const handleStartOrder = useCallback(() => {
    if (!activeOrder) return;

    // Publish Start Event to Master
    const topic = mqttTopics.station(stationId).events;
    publish({
      topic,
      payload: {
        type: "start_request",
        deviceId: stationId,
        orderId: activeOrder.orderId,
        ts: Date.now(),
      },
    });

    // Optimistically switch to PROCESSING (Master will confirm with GPIO)
    setStationState("PROCESSING");
  }, [publish, stationId, activeOrder]);

  const handleReset = useCallback(() => {
    setStationState("IDLE");
    setActiveOrder(null);
  }, []);

  return {
    stationState,
    coffeeConfig,
    activeOrder,
    handleStartOrder,
    handleReset,
    connectionState,
  };
}
