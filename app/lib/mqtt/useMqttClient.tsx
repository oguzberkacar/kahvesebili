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
import type {
  ConnectionState,
  IncomingMessage,
  MqttConnectConfig,
  PublishMessage,
  SubscriptionRequest,
} from "./types";

const MESSAGE_HISTORY_LIMIT = 50;

export function useMqttClient(
  config: MqttConnectConfig,
  initialSubscriptions: SubscriptionRequest[] = [],
) {
  const { url, clientId, username, password, role, deviceId, keepalive, clean, protocol } =
    config;
  const clientRef = useRef<MqttClient | null>(null);
  const [state, setState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<IncomingMessage[]>([]);
  const subscriptionsRef = useRef<SubscriptionRequest[]>(initialSubscriptions);

  useEffect(() => {
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
      console.error("MQTT error", err);
      setError(err?.message || "MQTT error");
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
  }, [
    url,
    clientId,
    username,
    password,
    role,
    deviceId,
    keepalive,
    clean,
    protocol,
  ]);

  const publish = useCallback(async (message: PublishMessage) => {
    const client = clientRef.current;
    if (!client) throw new Error("MQTT client is not ready");
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
    subscriptionsRef.current = subscriptionsRef.current.filter(
      (item) => !topics.includes(item.topic),
    );
    await unsubscribeTopics(client, topics);
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
    clearMessages,
  };
}
