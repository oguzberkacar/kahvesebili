"use client";
import React from "react";
import { X, RefreshCw, Server, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
  role: "master" | "station";
  connectionState: string;
  // Master specific data
  activeStations?: string[];
  stationStates?: Record<string, any>;
  masterStates?: Record<string, "ONLINE" | "OFFLINE">;
  sessionId?: string; // Current master's unique session ID
  // Station specific data
  masterState?: string; // "ONLINE" | "OFFLINE"
  deviceId?: string;
  // Actions
  onRefresh: () => void;
}

export default function DebugMenu({
  isOpen,
  onClose,
  role,
  connectionState,
  activeStations = [],
  stationStates = {},
  masterStates = {},
  sessionId,
  masterState,
  deviceId,
  onRefresh,
}: DebugMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white/10 border border-white/20 text-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                connectionState === "connected" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}
            >
              <Server size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">System Status</h2>
              <p className="text-xs text-white/50 uppercase tracking-wider">{role.toUpperCase()} MODE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="space-y-4 mb-8">
          {/* MQTT Connection */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Wifi size={16} /> MQTT Broker
            </span>
            <span
              className={cn(
                "px-2 py-1 rounded text-xs font-bold uppercase",
                connectionState === "connected" ? "bg-green-500 text-black" : "bg-red-500 text-white"
              )}
            >
              {connectionState}
            </span>
          </div>

          {/* Role Specific Info */}
          {role === "station" && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <span className="flex items-center gap-2 text-sm font-medium">Master Status</span>
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-bold uppercase",
                  masterState === "ONLINE" ? "bg-green-500 text-black" : "bg-red-500 text-white"
                )}
              >
                {masterState || "UNKNOWN"}
              </span>
            </div>
          )}

          {/* Master: Station List */}
          {role === "master" && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/50 uppercase">
                Connected Stations ({Object.keys(stationStates).length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(stationStates).length > 0 ? (
                  Object.entries(stationStates).map(([id, state]: [string, any]) => (
                    <div
                      key={id}
                      className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between"
                    >
                      <span className="text-xs font-mono">{id}</span>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          state.state === "DISCONNECTED"
                            ? "bg-red-500 animate-pulse"
                            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        )}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-white/30 text-xs py-2 italic">No stations detected yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Master: Active Controllers List */}
          {role === "master" && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <h3 className="text-sm font-bold text-white/50 uppercase">
                Active Controllers ({Object.keys(masterStates).length})
              </h3>
              <div className="flex flex-col gap-2">
                {Object.keys(masterStates).length > 0 ? (
                  Object.entries(masterStates).map(([id, state]) => {
                    const isMe = id === sessionId;
                    return (
                      <div
                        key={id}
                        className={cn(
                          "p-2 rounded-lg border flex items-center justify-between",
                          isMe ? "bg-blue-500/20 border-blue-500/50" : "bg-white/5 border-white/5"
                        )}
                      >
                        <span className="text-xs font-mono flex items-center gap-2">
                          {id}
                          {isMe && <span className="bg-blue-500 text-white text-[9px] px-1 rounded">ME</span>}
                        </span>
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            state === "OFFLINE"
                              ? "bg-red-500 animate-pulse"
                              : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                          )}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-white/30 text-xs py-2 italic">Waiting for peers...</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRefresh}
            className="w-full py-4 bg-fi hover:bg-white text-secondary hover:text-black font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw size={20} />
            REFRESH NETWORK / RE-ANNOUNCE
          </button>

          {role === "station" && (
            <div className="text-center text-[10px] text-white/30 font-mono mt-2">Device ID: {deviceId}</div>
          )}
        </div>
      </div>
    </div>
  );
}
