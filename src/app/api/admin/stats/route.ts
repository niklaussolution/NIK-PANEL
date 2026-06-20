export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = getAdminDb();
    const [usersSnap, ordersSnap, vpsSnap, ticketsSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("orders").get(),
      db.collection("vps").where("status", "==", "active").get(),
      db.collection("tickets").where("status", "==", "open").get(),
    ]);

    const orders = ordersSnap.docs.map((d) => d.data());
    const revenue = orders
      .filter((o) => o.status === "paid")
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    return NextResponse.json({
      totalCustomers: usersSnap.size,
      totalOrders: ordersSnap.size,
      revenue,
      activeVPS: vpsSnap.size,
      openTickets: ticketsSnap.size,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
