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
  const [orders, setOrders] = useState<CommandMessage[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  // Handle Incoming Message Logic (defined before usage)
  const handleMessage = useCallback(
    (msg: IncomingMessage) => {
      try {
        const payload: any = msg.json || JSON.parse(msg.payload);

        // 0. Handle Broadcast Discovery (Master asking "Who is there?")
        if (msg.topic === mqttTopics.master.broadcast) {
          // console.log("Received Discovery Broadcast from Master");
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
          const newConfig = payload.coffee;
          // Check for equality (simple JSON comparison)
          if (coffeeConfig && JSON.stringify(coffeeConfig.id) === JSON.stringify(newConfig.id)) {
            // Deep check to prevent redundant updates
            if (JSON.stringify(coffeeConfig) === JSON.stringify(newConfig)) {
              return; // Ignore identical config
            }
          }

          console.log("Config Received:", newConfig.name);
          setCoffeeConfig(newConfig);
          // Only switch to IDLE if we are Disconnected.
          // If we are serving an order, don't interrupt!
          setStationState((prev) => {
            if (prev === "DISCONNECTED") return "IDLE";
            return prev; // Keep current state (IDLE, ORDER_RECEIVED, etc)
          });
          return;
        }

        // 2. Order Command (Add to Queue)
        if (payload.orderId && payload.size) {
          setOrders((prev) => {
            // Avoid duplicates
            if (prev.find((o) => o.orderId === payload.orderId)) return prev;
            return [...prev, payload];
          });

          setStationState((prev) => {
            if (prev === "IDLE" || prev === "COMPLETED") return "ORDER_RECEIVED";
            return prev;
          });
          return;
        }

        // 3. Status Update (Started / Finished)
        // Master might send { status: 'processing' } or { status: 'completed' }
        if (payload.status === "processing") {
          // Master acknowledged start
          setStationState("PROCESSING");
        } else if (payload.status === "completed") {
          setStationState("COMPLETED");

          // Remove completed order from queue
          setOrders((prev) => {
            // We need to know WHICH order completed.
            // Since tracking is loose, we assume the 'selectedOrderId' completed.
            // But we can't access selectedOrderId easily in this callback without dependency.
            // We'll update logical state here, and use logic in render/effects to cleanup.
            // Actually, simplest is:
            return prev.filter((o) => o.orderId !== selectedOrderId);
          });

          // Reset selection
          setSelectedOrderId(null);

          // Auto reset after 30s
          setTimeout(() => {
            setStationState((curr) => {
              if (curr === "COMPLETED") {
                // Return to ORDER_RECEIVED if orders exist, else IDLE
                // Since we can't see 'orders' here easily due to closure (unless added to dep),
                // we rely on the component re-render or check updated state.
                // This timeout closure captures OLD state.
                // We need a better reset, or just set to IDLE and let the effect promote to ORDER_RECEIVED if queue > 0.
                return "IDLE";
              }
              return curr;
            });
          }, 30000);
        }
      } catch (e) {
        console.error("Failed to parse station message", e);
      }
    },
    [effectiveStationId, publish, coffeeConfig, selectedOrderId]
  );

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

  // Handle Incoming Messages (Using the now already-defined handleMessage)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    handleMessage(lastMsg);
  }, [messages, handleMessage]);

  // If we have orders but are IDLE, move to ORDER_RECEIVED
  useEffect(() => {
    if (orders.length > 0 && stationState === "IDLE") {
      setStationState("ORDER_RECEIVED");
    }
  }, [orders, stationState]);

  // Auto-select if there is only one order
  useEffect(() => {
    if (orders.length === 1) {
      setSelectedOrderId(orders[0].orderId);
    }
  }, [orders]);

  // Actions
  const handleStartOrder = useCallback(() => {
    if (!selectedOrderId) return;
    const order = orders.find((o) => o.orderId === selectedOrderId);
    if (!order) return;

    // Publish Start Event to Master
    const topic = mqttTopics.station(effectiveStationId).events;
    console.log(`[Station] Sending START_REQUEST to ${topic}`, {
      type: "start_request",
      deviceId: effectiveStationId,
      orderId: order.orderId,
    });

    publish({
      topic,
      payload: {
        type: "start_request",
        deviceId: effectiveStationId,
        orderId: order.orderId,
        ts: Date.now(),
        price: order.price,
      },
    });

    // Optimistically switch to PROCESSING (Master will confirm with GPIO)
    // setStationState("PROCESSING");
    // Wait for Master confirmation instead.
  }, [publish, effectiveStationId, orders, selectedOrderId]);

  const handleReset = useCallback(() => {
    setStationState("IDLE");
    setOrders([]);
    setSelectedOrderId(null);
  }, []);

  const handleSelectOrder = useCallback((id: string) => {
    setSelectedOrderId(id);
  }, []);

  return {
    stationState,
    coffeeConfig,
    orders,
    selectedOrderId,
    handleStartOrder,
    handleSelectOrder,
    handleReset,
    connectionState,
  };
}
