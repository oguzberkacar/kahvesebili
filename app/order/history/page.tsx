"use client";

import React from "react";
import Link from "next/link";
import { useMaster } from "../../context/MasterContext";
import { ArrowLeft, Clock, CheckCircle, Activity, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderHistoryPage() {
  const { activeOrders } = useMaster();

  // Sort orders by timestamp (newest first)
  const sortedOrders = [...activeOrders].sort((a, b) => {
    const timeA = a.endTime || a.startTime || a.details.ts || 0;
    const timeB = b.endTime || b.startTime || b.details.ts || 0;
    return timeB - timeA;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SENT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={16} />;
      case "PROCESSING":
        return <Activity size={16} />;
      case "SENT":
        return <Send size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatTime = (ts?: number) => {
    if (!ts) return "-";
    return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/order" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">Total: {sortedOrders.length}</div>
        </div>

        <div className="space-y-4">
          {sortedOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No Orders Yet</h3>
              <p className="text-gray-500 mt-1">Orders sent to stations will appear here.</p>
            </div>
          ) : (
            sortedOrders.map((order, index) => (
              <div
                key={`${order.orderId}-${index}`}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  {/* Order ID & Source */}
                  <div className="min-w-[120px]">
                    <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">Order ID</div>
                    <div className="text-xl font-black text-gray-800">{order.orderId}</div>
                  </div>

                  {/* Station */}
                  <div className="min-w-[120px]">
                    <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">Station</div>
                    <div className="font-medium text-gray-700 capitalize">{order.stationId}</div>
                  </div>

                  {/* Details */}
                  <div className="min-w-[140px]">
                    <div className="text-xs text-gray-400 font-bold tracking-wider uppercase mb-1">Details</div>
                    <div className="font-medium text-gray-700">
                      <span className="capitalize">{order.details.size || "Standard"}</span> - ${order.details.price || "?"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {/* Timestamps */}
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">{formatTime(order.details.ts)}</div>
                    {order.endTime && order.status === "COMPLETED" && (
                      <div className="text-xs text-green-600 font-medium">
                        Took {((order.endTime - (order.startTime || order.details.ts)) / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border",
                      getStatusColor(order.status)
                    )}
                  >
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
