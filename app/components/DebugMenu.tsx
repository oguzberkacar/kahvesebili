"use client";
import React, { useState, useEffect } from "react";
import { X, RefreshCw, Server, Wifi, Settings, ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";

// Minimal definition to match useMasterController's type
type StationConfig = {
  stationId: string;
  coffeeId: string;
  name: string;
  type: "Hot" | "Cold";
  pin: number;
  duration: number;
  image: string;
  roast?: string;
  details?: any;
};

interface DebugMenuProps {
  isOpen: boolean;
  onClose: () => void;
  role: "master" | "station";
  connectionState: string;
  // Master specific data
  activeStations?: string[];
  stationStates?: Record<string, any>;
  masterStates?: Record<string, "ONLINE" | "OFFLINE">;
  sessionId?: string;
  // Configs
  stationConfigs?: Record<string, StationConfig>;
  onUpdateConfig?: (stationId: string, updates: Partial<StationConfig>) => void;

  // Station specific data
  masterState?: string;
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
  stationConfigs,
  onUpdateConfig,
  masterState,
  deviceId,
  onRefresh,
}: DebugMenuProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StationConfig>>({});

  // Reset internal state if closed
  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setEditForm({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartEdit = (id: string, currentConf?: StationConfig) => {
    if (!currentConf) return;
    setEditingId(id);
    setEditForm({ ...currentConf });
  };

  const handleSave = () => {
    if (editingId && onUpdateConfig) {
      onUpdateConfig(editingId, editForm);
      setEditingId(null);
    }
  };

  const currentConfig = editingId && stationConfigs ? stationConfigs[editingId] : null;

  // Render Edit View
  if (editingId && currentConfig) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#1F2937] border border-white/20 text-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingId(null)}
                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold">Edit Station</h2>
                <p className="text-xs text-white/50">{editingId}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {/* Coffee Name (Readonly or editable?) User said info stays same usually */}
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase font-bold ml-1">Assigned Coffee</label>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-sm text-white/70">
                {currentConfig.name} ({currentConfig.coffeeId})
              </div>
            </div>

            {/* Type Selection */}
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase font-bold ml-1">Type (Hot/Cold)</label>
              <div className="grid grid-cols-2 gap-2">
                {["Hot", "Cold"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setEditForm((prev) => ({ ...prev, type: type as "Hot" | "Cold" }))}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-bold transition-all",
                      editForm.type === type
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Input */}
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase font-bold ml-1">Duration (ms)</label>
              <input
                type="number"
                value={editForm.duration || 0}
                onChange={(e) => setEditForm((prev) => ({ ...prev, duration: parseInt(e.target.value, 10) }))}
                className="w-full p-3 bg-black/20 rounded-xl border border-white/10 focus:border-blue-500 focus:outline-none text-white font-mono"
              />
              <div className="flex gap-2 mt-2">
                {/* Presets */}
                <button
                  onClick={() => setEditForm((prev) => ({ ...prev, duration: 4000 }))}
                  className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                >
                  4000ms (Cold)
                </button>
                <button
                  onClick={() => setEditForm((prev) => ({ ...prev, duration: 6000 }))}
                  className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                >
                  6000ms (Hot)
                </button>
                <button
                  onClick={() => setEditForm((prev) => ({ ...prev, duration: 7000 }))}
                  className="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                >
                  7000ms
                </button>
              </div>
            </div>

            {/* GPIO Pin (Readonly mostly) */}
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase font-bold ml-1">GPIO Pin (Raw)</label>
              <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-sm font-mono text-white/70">
                BCM {currentConfig.pin}
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            SAVE CONFIGURATION
          </button>
        </div>
      </div>
    );
  }

  // Render Main View
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
                  Object.entries(stationStates).map(([id, state]: [string, any]) => {
                    // Check if we have config
                    const conf = stationConfigs ? stationConfigs[id] : null;

                    return (
                      <div
                        key={id}
                        onClick={() => conf && handleStartEdit(id, conf)}
                        className="p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col gap-1 cursor-pointer hover:bg-white/10 active:scale-95 transition-all relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold">{id}</span>
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              state.state === "DISCONNECTED"
                                ? "bg-red-500 animate-pulse"
                                : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                            )}
                          />
                        </div>

                        {/* Short Config Summary */}
                        {conf && (
                          <div className="text-[10px] text-white/50 flex flex-col mt-1">
                            <span className="truncate text-white/70">{conf.name}</span>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={cn(
                                  "px-1 rounded text-[9px] uppercase font-bold",
                                  conf.type === "Cold" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"
                                )}
                              >
                                {conf.type}
                              </span>
                              <span className="font-mono">{conf.duration / 1000}s</span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg backdrop-blur-sm transition-opacity">
                              <Settings size={16} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
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
