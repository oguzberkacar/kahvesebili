import mqtt, {
  type IClientOptions,
  type MqttClient,
  type ISubscriptionGrant,
} from "mqtt";
import {
  type ConnectionState,
  type IncomingMessage,
  type MqttConnectConfig,
  type PublishMessage,
  type SubscriptionRequest,
  type QoSLevel,
  type ProtocolVersion,
} from "./types";

const DEFAULT_QOS: QoSLevel = 0;

export function connectMqttClient(config: MqttConnectConfig): MqttClient {
  const {
    url,
    username,
    password,
    keepalive = 30,
    clean = true,
    protocol,
    clientId,
    path,
    reconnectPeriod = 1500,
    connectTimeout = 5000,
    protocolVersion = 4 as ProtocolVersion,
  } = config;

  const options: IClientOptions = {
    clientId,
    username,
    password,
    keepalive,
    clean,
    reconnectPeriod,
    connectTimeout,
    protocolVersion,
  };

  if (protocol) options.protocol = protocol;
  if (path) options.path = path;

  return mqtt.connect(url, options);
}

export async function subscribeTopics(
  client: MqttClient,
  subscriptions: SubscriptionRequest[],
): Promise<ISubscriptionGrant[]> {
  const grants: ISubscriptionGrant[] = [];

  for (const { topic, qos = DEFAULT_QOS } of subscriptions) {
    const result = await client.subscribeAsync(topic, { qos });
    grants.push(...result);
  }

  return grants;
}

export async function unsubscribeTopics(
  client: MqttClient,
  topics: string[],
): Promise<void> {
  if (!topics.length) return;
  await client.unsubscribeAsync(topics);
}

export async function publishMessage(
  client: MqttClient,
  message: PublishMessage,
): Promise<void> {
  const payload = normalizePayload(message.payload);
  await client.publishAsync(message.topic, payload, {
    qos: message.qos ?? DEFAULT_QOS,
    retain: message.retain ?? false,
  });
}

export function normalizePayload(payload: PublishMessage["payload"]): Buffer | string {
  if (Buffer.isBuffer(payload)) return payload;
  if (typeof payload === "string") return payload;
  return JSON.stringify(payload);
}

export function attachMessageHandler(
  client: MqttClient,
  onMessage: (msg: IncomingMessage) => void,
): () => void {
  const handler = (topic: string, payload: Buffer) => {
    const text = payload.toString();
    const json = safeParseJson(text);

    onMessage({
      topic,
      payload: text,
      json,
      receivedAt: Date.now(),
    });
  };

  client.on("message", handler);

  return () => {
    client.off("message", handler);
  };
}

export function mapClientState(client?: MqttClient | null): ConnectionState {
  if (!client) return "idle";
  if (client.disconnected) return "closed";
  if (client.reconnecting) return "reconnecting";
  if (client.connected) return "connected";
  return "connecting";
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
