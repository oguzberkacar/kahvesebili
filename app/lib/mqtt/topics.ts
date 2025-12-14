import type { DeviceRole, SubscriptionRequest } from "./types";

const MASTER_BASE = `master`;
const STATION_BASE = `station`;

export const mqttTopics = {
  root: '',
  master: {
    broadcast: `${MASTER_BASE}/broadcast`,
    helloAll: `${STATION_BASE}/+/hello`,
    statusAll: `${STATION_BASE}/+/status`,
    eventsAll: `${STATION_BASE}/+/events`,
  },
  station: (deviceId: string) => ({
    hello: `${STATION_BASE}/${deviceId}/hello`,
    status: `${STATION_BASE}/${deviceId}/status`,
    events: `${STATION_BASE}/${deviceId}/events`,
    command: `${STATION_BASE}/${deviceId}/command`,
  }),
};

export function defaultSubscriptionsForRole(
  role: DeviceRole,
  deviceId?: string,
): SubscriptionRequest[] {
  if (role === "master") {
    return [
      { topic: mqttTopics.master.helloAll },
      { topic: mqttTopics.master.statusAll },
      { topic: mqttTopics.master.eventsAll },
    ];
  }

  if (!deviceId) return [];

  const stationTopics = mqttTopics.station(deviceId);
  return [
    { topic: mqttTopics.master.broadcast },
    { topic: stationTopics.command },
  ];
}
