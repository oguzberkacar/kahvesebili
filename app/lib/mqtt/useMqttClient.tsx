"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MqttClient } from "mqtt";
import {
  attachMessageHandler,
  connectMqttClient,
  mapClientState,
  publishMessage,
  subscribeTopics,
  unsubscribeTopics,
} from "./client";
import type { ConnectionState, IncomingMessage, MqttConnectConfig, PublishMessage, SubscriptionRequest } from "./types";

const MESSAGE_HISTORY_LIMIT = 50;

// Local extended config
type UseMqttConfig = MqttConnectConfig & { enabled?: boolean };

export function useMqttClient(config: UseMqttConfig, initialSubscriptions: SubscriptionRequest[] = []) {
  const { url, clientId, username, password, role, deviceId, keepalive, clean, protocol, enabled = true } = config;
  const clientRef = useRef<MqttClient | null>(null);
  const [state, setState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const subscriptionsRef = useRef<SubscriptionRequest[]>(initialSubscriptions);

  useEffect(() => {
    if (!enabled) {
      if (clientRef.current) {
        clientRef.current.end(true);
        clientRef.current = null;
      }
      setState("idle");
      return;
    }

    setError(null);
    setState("connecting");
    const client = connectMqttClient({
      url,
      clientId,
      username,
      password,
      role,
      deviceId,
      keepalive,
      clean,
      protocol,
    });
    clientRef.current = client;

    const detachMessage = attachMessageHandler(client, (msg) => {
      setMessages((prev) => {
        const next = [...prev, msg];
        return next.slice(-MESSAGE_HISTORY_LIMIT);
      });
    });

    const onConnect = () => {
      setState("connected");
      if (subscriptionsRef.current.length) {
        subscribeTopics(client, subscriptionsRef.current).catch((err) => {
          console.error("MQTT subscribe error", err);
          setError(err?.message || "Subscribe failed");
        });
      }
    };

    const onReconnect = () => setState("reconnecting");
    const onClose = () => setState("closed");
    const onError = (err: Error) => {
      // Suppress connection timeout errors to avoid console noise in production
      // or confusing users in dev mode if infinite retry is intended.
      if (err?.message?.includes("connack timeout") || err?.message?.includes("client is not ready")) {
        // Just set error state, don't log to console
        setError(err.message);
      } else {
        console.error("MQTT error", err);
        setError(err?.message || "MQTT error");
      }
      setState("error");
    };

    client.on("connect", onConnect);
    client.on("reconnect", onReconnect);
    client.on("close", onClose);
    client.on("error", onError);

    return () => {
      detachMessage();
      client.off("connect", onConnect);
      client.off("reconnect", onReconnect);
      client.off("close", onClose);
      client.off("error", onError);
      client.end(true);
      clientRef.current = null;
      setState("idle");
    };
  }, [url, clientId, username, password, role, deviceId, keepalive, clean, protocol, enabled]);

  const publish = useCallback(async (message: PublishMessage) => {
    const client = clientRef.current;
    if (!client) throw new Error("MQTT client is not ready");
    if (!client.connected) {
      console.warn("MQTT Publish skipped: Client not connected");
      return;
    }
    await publishMessage(client, message);
  }, []);

  const subscribe = useCallback(async (subscriptions: SubscriptionRequest[]) => {
    const client = clientRef.current;
    if (!client) throw new Error("MQTT client is not ready");
    subscriptionsRef.current = [...subscriptionsRef.current, ...subscriptions];
    await subscribeTopics(client, subscriptions);
  }, []);

  const unsubscribe = useCallback(async (topics: string[]) => {
    const client = clientRef.current;
    if (!client) throw new Error("MQTT client is not ready");
    subscriptionsRef.current = subscriptionsRef.current.filter((item) => !topics.includes(item.topic));
    await unsubscribeTopics(client, topics);
  }, []);

  const reconnect = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      console.log("Forcing MQTT reconnect...");
      client.reconnect();
    }
  }, []);

  const disconnect = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      client.end(true);
      clientRef.current = null;
      setState("closed");
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    client: clientRef.current,
    state: state === "error" ? "error" : mapClientState(clientRef.current),
    error,
    messages,
    publish,
    subscribe,
    unsubscribe,
    disconnect,
    reconnect,
    clearMessages,
  };
}
