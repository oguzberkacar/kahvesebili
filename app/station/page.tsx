"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function SlavePage() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push("/siparis")}>Go to Siparis</button>
    </div>
  );
}
