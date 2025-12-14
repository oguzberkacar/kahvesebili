"use client";

import { useEffect, useMemo, useState } from "react";
import { getMqttConfigFromEnv } from "../lib/mqtt/config";
import { defaultSubscriptionsForRole, mqttTopics } from "../lib/mqtt/topics";
import { useMqttClient } from "../lib/mqtt/useMqttClient";
import type { PublishMessage } from "../lib/mqtt/types";

const baseCard =
  "border border-black/5 bg-white shadow-md rounded-2xl p-6 flex flex-col gap-4 w-full";

export default function TestMqttPage() {
  const resolvedConfig = useMemo(() => getMqttConfigFromEnv(), []);
  const [topic, setTopic] = useState<string>("");
  const [payload, setPayload] = useState<string>('{"ping":"pong"}');
  const [subscribeTopic, setSubscribeTopic] = useState<string>("");

  const { state, error, messages, publish, subscribe, clearMessages } = useMqttClient(
    resolvedConfig,
    defaultSubscriptionsForRole(resolvedConfig.role, resolvedConfig.deviceId),
  );

  const deviceLabel = resolvedConfig.deviceId || "station";
  const stationTopics = mqttTopics.station(deviceLabel);

  useEffect(() => {
    if (!topic) {
      const fallbackTopic =
        resolvedConfig.role === "master"
          ? mqttTopics.master.broadcast
          : stationTopics.status;
      setTopic(fallbackTopic);
    }
    if (!subscribeTopic) {
      const fallback =
        resolvedConfig.role === "master"
          ? mqttTopics.master.helloAll
          : stationTopics.command;
      setSubscribeTopic(fallback);
    }
  }, [resolvedConfig.role, topic, subscribeTopic, stationTopics.status, stationTopics.command]);

  async function handlePublish() {
    if (!topic) return;
    const outgoing: PublishMessage = {
      topic,
      payload: parseOrReturn(payload),
    };
    await publish(outgoing);
  }

  async function handleSubscribe() {
    if (!subscribeTopic) return;
    await subscribe([{ topic: subscribeTopic }]);
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#d8f2e7] via-white to-[#f1f6f5] text-gray-900 flex items-start justify-center px-6 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="text-sm px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            MQTT Test
          </div>
          <div className="text-xs px-3 py-1 rounded-full bg-sky-100 text-sky-700 font-semibold">
            Role: {resolvedConfig.role}
          </div>
          {resolvedConfig.deviceId ? (
            <div className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
              Device: {resolvedConfig.deviceId}
            </div>
          ) : null}
          <div className="ml-auto text-xs px-3 py-1 rounded-full bg-gray-900 text-white font-semibold">
            {state}
          </div>
        </header>

        <section className={baseCard}>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-semibold">Bağlantı</div>
            <div className="text-sm text-gray-600 flex flex-wrap gap-3">
              <span>
                URL: <span className="font-mono text-gray-800">{resolvedConfig.url}</span>
              </span>
              {resolvedConfig.path ? (
                <span>
                  Path: <span className="font-mono text-gray-800">{resolvedConfig.path}</span>
                </span>
              ) : null}
              <span>
                Client:{" "}
                <span className="font-mono text-gray-800">{resolvedConfig.clientId}</span>
              </span>
            </div>
            {error ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Publish topic</label>
              <input
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="kahve/master/broadcast"
              />
              <label className="text-sm font-medium text-gray-700">Payload</label>
              <textarea
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm min-h-[120px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  onClick={handlePublish}
                >
                  Publish
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 transition-colors"
                  onClick={() =>
                    setPayload(
                      JSON.stringify(
                        {
                          deviceId: resolvedConfig.deviceId,
                          role: resolvedConfig.role,
                          ts: Date.now(),
                        },
                        null,
                        2,
                      ),
                    )
                  }
                >
                  Hello payload
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Subscribe topic</label>
              <input
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                value={subscribeTopic}
                onChange={(e) => setSubscribeTopic(e.target.value)}
                placeholder="kahve/station/+/status"
              />
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition-colors"
                  onClick={handleSubscribe}
                >
                  Subscribe
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 transition-colors"
                  onClick={clearMessages}
                >
                  Clear messages
                </button>
              </div>

              <div className="text-sm text-gray-600">
                Önerilen topicler:
                <div className="mt-2 space-y-1 font-mono text-xs text-gray-800">
                  <div>{mqttTopics.master.broadcast}</div>
                  <div>{mqttTopics.master.helloAll}</div>
                  <div>{mqttTopics.master.statusAll}</div>
                  <div>{stationTopics.command}</div>
                  <div>{stationTopics.status}</div>
                  <div>{stationTopics.hello}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={baseCard}>
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">Mesajlar</div>
            <div className="text-xs text-gray-500">Son {messages.length} kayıt</div>
          </div>
          <div className="flex flex-col gap-3 max-h-[420px] overflow-auto pr-1">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-500">Henüz mesaj yok.</div>
            ) : (
              messages
                .slice()
                .reverse()
                .map((msg, idx) => (
                  <div
                    key={`${msg.receivedAt}-${idx}`}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                  >
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="font-mono text-gray-800">{msg.topic}</span>
                      <span>{new Date(msg.receivedAt).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-xs text-gray-900 font-mono whitespace-pre-wrap">
                      {prettyPayload(msg.payload)}
                    </pre>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function parseOrReturn(value: string): string | Record<string, unknown> {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function prettyPayload(payload: string) {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}
