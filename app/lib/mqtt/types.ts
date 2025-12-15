import type { IClientOptions, IClientPublishOptions } from "mqtt";

export type QoSLevel = 0 | 1 | 2;

export type DeviceRole = "master" | "station";

export type ProtocolVersion = 3 | 4 | 5;

export type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "closed" | "error";

export type MqttCredentials = {
  username?: string;
  password?: string;
};

export type MqttConnectConfig = {
  url: string;
  role: DeviceRole;
  clientId: string;
  deviceId?: string;
  keepalive?: number;
  clean?: boolean;
  protocol?: IClientOptions["protocol"];
  path?: string;
  reconnectPeriod?: number;
  connectTimeout?: number;
  protocolVersion?: ProtocolVersion;
} & MqttCredentials;

export type SubscriptionRequest = {
  topic: string;
  qos?: QoSLevel;
};

export type PublishMessage = {
  topic: string;
  payload: string | Buffer | Record<string, unknown>;
  qos?: QoSLevel;
  retain?: IClientPublishOptions["retain"];
};

export type IncomingMessage<T = unknown> = {
  topic: string;
  payload: string;
  json?: T;
  receivedAt: number;
};

export type HelloMessage = {
  deviceId: string;
  role: DeviceRole;
  version?: string;
  ts: number;
};

export type StatusMessage = {
  deviceId: string;
  ready: boolean;
  waterLevel?: number;
  temperature?: number;
  note?: string;
  ts: number;
};

export type CommandMessage = {
  orderId: string;
  deviceId: string;
  recipeId: string;
  size: string;
  extras?: string[];
  ts: number;
};

export type GpioCommandMessage = {
  type: "gpio_pulse";
  deviceId: string;
  pins: number[];
  durationSec: number;
  ts: number;
};

export type EventMessage = {
  deviceId: string;
  orderId?: string;
  level: "info" | "warn" | "error";
  code: string;
  message: string;
  ts: number;
};

export type ParsedMqttMessage =
  | HelloMessage
  | StatusMessage
  | CommandMessage
  | GpioCommandMessage
  | EventMessage
  | Record<string, unknown>
  | string;
