import { getMqttConfigFromEnv } from "../lib/mqtt/config";
import TestMqttClient from "./TestMqttClient";

export default function TestMqttPage() {
  const resolvedConfig = getMqttConfigFromEnv();
  return <TestMqttClient initialConfig={resolvedConfig} />;
}
