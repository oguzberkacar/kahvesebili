"use client";
import React from "react";
import { useStationController } from "../hooks/useStationController";

export default function DebugPage() {
  const controller = useStationController();
  return (
    <div>
      <h1>Debug Page</h1>
      <pre>{JSON.stringify(controller, null, 2)}</pre>
    </div>
  );
}
