import React from "react";
import { redirect } from "next/navigation";
import coffees from "../../../data/coffees.json";
import OrderStationClient from "./OrderStationClient";

type Props = {
  params: Promise<{ id: string; orderid: string }>;
};

export default async function OrderPage({ params }: Props) {
  const { id, orderid } = await params;

  const coffee = coffees.find((c) => c.stationId === Number(id));

  if (!coffee) {
    redirect("/station");
  }

  // Format order ID if needed (e.g. ensure '#' prefix)
  const displayOrderId = orderid.startsWith("%23")
    ? decodeURIComponent(orderid)
    : orderid.startsWith("#")
    ? orderid
    : `#${orderid}`;

  return <OrderStationClient coffee={coffee} displayOrderId={displayOrderId} />;
}
