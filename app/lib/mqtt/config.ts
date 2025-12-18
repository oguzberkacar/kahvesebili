import { mqttTopics } from "./topics";
import type { DeviceRole, MqttConnectConfig, ProtocolVersion } from "./types";

function boolFromEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function parseProtocolVersion(value: string | undefined, fallback: ProtocolVersion = 4): ProtocolVersion {
  if (!value) return fallback;
  const num = Number(value);
  return num === 3 || num === 4 || num === 5 ? (num as ProtocolVersion) : fallback;
}

function normalizeRole(value?: string | null): DeviceRole {
  if (!value) return "master";
  const v = value.toLowerCase();
  if (v === "master" || v === "menu") return "master";
  if (v === "station" || v === "musluk") return "station";
  return "master";
}

export function resolveRoleFromEnv(): DeviceRole {
  const explicitRole = process.env.NEXT_PUBLIC_DEVICE_ROLE;
  if (explicitRole) return normalizeRole(explicitRole);

  const appEnvRole = process.env.APP_ENV;
  if (appEnvRole) return normalizeRole(appEnvRole);

  return "master";
}

export function getMqttConfigFromEnv(): MqttConnectConfig {
  const role = resolveRoleFromEnv();
  const deviceIdEnv = process.env.NEXT_PUBLIC_DEVICE_ID || process.env.STATION_ID;
  const deviceId = deviceIdEnv || (role === "station" ? "station-1" : "master");

  const url = process.env.NEXT_PUBLIC_MQTT_URL || "ws://192.168.1.9:9001";
  const clientId = deviceId;
  const path = process.env.NEXT_PUBLIC_MQTT_PATH;

  return {
    url,
    role,
    deviceId,
    clientId,
    keepalive: Number(process.env.NEXT_PUBLIC_MQTT_KEEPALIVE || 30),
    clean: boolFromEnv(process.env.NEXT_PUBLIC_MQTT_CLEAN, true),
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
    protocol: url.startsWith("ws") ? "ws" : url.startsWith("wss") ? "wss" : "mqtt",
    path,
    reconnectPeriod: Number(process.env.NEXT_PUBLIC_MQTT_RECONNECT_MS || 1500),
    connectTimeout: Number(process.env.NEXT_PUBLIC_MQTT_CONNECT_TIMEOUT_MS || 5000),
    protocolVersion: parseProtocolVersion(process.env.NEXT_PUBLIC_MQTT_PROTOCOL_VERSION, 4),
  };
}

// Deprecated hints removed for new Shared State architecture.
// Use mqttTopics directly from topics.ts
export const topicHints = {};
