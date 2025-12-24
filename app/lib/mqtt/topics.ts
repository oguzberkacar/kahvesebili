import type { DeviceRole, SubscriptionRequest } from "./types";

// PROD v2 Architecture: Shared State
// All devices utilize 'system/status/{id}' for state sync using Retained messages.
// All devices utilize 'system/events' for momentary actions (Start button, GPIO triggers).

const SYSTEM_STATUS_BASE = "system/status";
const SYSTEM_EVENTS = "system/events";

export const mqttTopics = {
  // Shared State Channel (Retained)
  // Each station publishes its own state here: system/status/station1
  // Master subscribes to system/status/+ to see everyone.
  status: (deviceId: string) => `${SYSTEM_STATUS_BASE}/${deviceId}`,

  // Wildcard for Master to listen all stations
  statusAll: `${SYSTEM_STATUS_BASE}/+`,

  // Event Channel (Ephemeral)
  // Used for "Start Button Click" or "GPIO Done" signals that are momentary
  events: SYSTEM_EVENTS,

  // Master Presence Channel (Retained) -> GLOBAL System Status (Old)
  masterStatus: "system/master/status",

  // Multi-Master Presence (New)
  masterPresence: (uniqueId: string) => `system/masters/${uniqueId}`,
  masterPresenceAll: `system/masters/+`,

  // Configuration Channel (Retained - Master sets, Station reads)
  // system/config/station1
  config: (stationId: string) => `system/config/${stationId}`,
};

export function defaultSubscriptionsForRole(role: DeviceRole, deviceId?: string): SubscriptionRequest[] {
  // Master listens to everyone's state + events
  if (role === "master") {
    return [
      { topic: mqttTopics.statusAll, qos: 0 },
      { topic: mqttTopics.events, qos: 0 },
    ];
  }

  // Station listens to its own state (to sync with Master updates) + events (optional)
  if (deviceId) {
    return [
      { topic: mqttTopics.status(deviceId), qos: 0 },
      // Station might not need events channel unless it listens for global broadcasts
    ];
  }

  return [];
}
