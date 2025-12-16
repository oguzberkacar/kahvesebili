"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import { mqttTopics } from "../lib/mqtt/topics";
import type { StationConfigMessage, CommandMessage, IncomingMessage } from "../lib/mqtt/types";
import { getMqttConfigFromEnv } from "../lib/mqtt/config";

type StationState =
  | "DISCONNECTED"
  | "IDLE" // Connected + Configured (Coffee Info)
  | "ORDER_RECEIVED" // Master sent config/order details to confirm
  | "PROCESSING" // User clicked Start, waiting for finish
  | "COMPLETED"; // Done

type StationControllerProps = {
  // Props can override env, but we default to env
  stationId?: string;
  brokerUrl?: string;
};

export function useStationController({ stationId, brokerUrl }: StationControllerProps = {}) {
  const [stationState, setStationState] = useState<StationState>("DISCONNECTED");
  const [coffeeConfig, setCoffeeConfig] = useState<any>(null); // The coffee info
  const [activeOrder, setActiveOrder] = useState<CommandMessage | null>(null);

  // Get defaults from env
  const envConfig = getMqttConfigFromEnv();

  // Effective values
  const effectiveStationId = stationId || envConfig.deviceId || "station1";

  // MQTT Client
  const {
    client,
    state: connectionState,
    subscribe,
    publish,
    messages,
  } = useMqttClient({
    ...envConfig,
    url: brokerUrl || envConfig.url,
    role: "station",
    deviceId: effectiveStationId,
    clientId: effectiveStationId, // Use exact station ID for ACL compatibility (no random suffix)
  });

  // 1. Handle Subscription (Once on Connect)
  useEffect(() => {
    if (connectionState === "connected") {
      const topics = mqttTopics.station(effectiveStationId);
      console.log(`Station ${effectiveStationId} Subscribing to:`, topics.command);
      subscribe([
        { topic: topics.command, qos: 0 },
        { topic: topics.status, qos: 0 },
        { topic: mqttTopics.master.broadcast, qos: 0 }, // Listen for Master discovery
      ]);
    } else {
      setStationState("DISCONNECTED");
    }
  }, [connectionState, effectiveStationId, subscribe]);

  // 2. Handle Handshake (Retry Hello until Configured)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectionState === "connected" && !coffeeConfig) {
      const topics = mqttTopics.station(effectiveStationId);

      const sendHello = () => {
        console.log(`Station ${effectiveStationId} sending Hello (waiting for config)...`);
        publish({
          topic: topics.hello,
          payload: {
            deviceId: effectiveStationId,
            role: "station",
            ts: Date.now(),
          },
        });
      };

      // Send immediately
      sendHello();
      // Retry every 3 seconds
      interval = setInterval(sendHello, 3000);
    }

    return () => clearInterval(interval);
  }, [connectionState, coffeeConfig, effectiveStationId, publish]);

  // Handle Incoming Messages
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    handleMessage(lastMsg);
  }, [messages]);

  const handleMessage = useCallback((msg: IncomingMessage) => {
    try {
      const payload: any = msg.json || JSON.parse(msg.payload);

      // 0. Handle Broadcast Discovery (Master asking "Who is there?")
      if (msg.topic === mqttTopics.master.broadcast) {
        console.log("Received Discovery Broadcast from Master");
        // Respond with Hello immediately
        const topics = mqttTopics.station(effectiveStationId);
        publish({
          topic: topics.hello,
          payload: {
            deviceId: effectiveStationId,
            role: "station",
            ts: Date.now(),
          },
        });
        return;
      }

      // 1. Config Message (Set Coffee Info)
      if (payload.type === "set_config") {
        console.log("Config Received:", payload.coffee.name);
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
    const topic = mqttTopics.station(effectiveStationId).events;
    publish({
      topic,
      payload: {
        type: "start_request",
        deviceId: effectiveStationId,
        orderId: activeOrder.orderId,
        ts: Date.now(),
      },
    });

    // Optimistically switch to PROCESSING (Master will confirm with GPIO)
    setStationState("PROCESSING");
  }, [publish, effectiveStationId, activeOrder]);

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
